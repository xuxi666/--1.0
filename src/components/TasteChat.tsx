import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FoodPhoto from './FoodPhoto'
import VideoResults from './VideoResults'
import { useWorldPreview } from './CircularTransition'
import { chatWithTaste, getAiStatus, searchCookingVideos } from '../lib/api'
import { VIDEO_REQUEST_TEXT, buildFailedBundle, contextSubjectFor, detectVideoIntent } from '../lib/videoIntent'
import { useLocalStorage } from '../lib/hooks'
import { getDish } from '../data/dishes'
import { tasteIncludesDish, type Taste } from '../data/tastes'
import type { AiStatus, ChatMessage } from '../types'

/**
 * 口味专属聊天区（嵌在 /tastes/:id 页面内）
 * ------------------------------------------------------------
 * - 每个口味有独立的本地历史（fs-taste-chat-<tasteId>），不同口味互不串上下文；
 * - 请求 /api/taste-chat 并携带 tasteId，服务端校验后选择该口味人格的系统提示词——
 *   它既不是 cuisineId 也不是 characterId，不会和菜系聊天、菜品角色聊天混用；
 * - 页面以 key={taste.id} 挂载本组件，切换口味时聊天区整体重建；
 * - 聊天样式与菜系聊天区共用（.cuisine-chat），并额外标注 .taste-chat 便于区分。
 */
export default function TasteChat({ taste }: { taste: Taste }) {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`fs-taste-chat-${taste.id}`, [])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  /** 渲染在转场预览层里（真实页面组件的第二次挂载）：不触发落地后才会有的副作用 */
  const isPreview = useWorldPreview()

  /**
   * 菜品页带进来的上下文：/tastes/<id>?dish=<菜品 id>。
   * 只有这道菜确实是当前口味的代表菜时才生效（服务端也会再校验一次）。
   */
  const dishParam = searchParams.get('dish')
  const contextDish = (() => {
    const candidate = getDish(dishParam)
    return candidate && tasteIncludesDish(taste, candidate.id) ? candidate : undefined
  })()

  const clearDishContext = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('dish')
    setSearchParams(next, { replace: true })
  }

  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const autoSentRef = useRef(false)

  useEffect(() => {
    let alive = true
    getAiStatus().then((data) => {
      if (alive) setStatus(data)
    })
    return () => {
      alive = false
      abortRef.current?.abort()
    }
  }, [taste.id])

  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, streaming])

  /**
   * 视频搜索请求：不进入口味人格对话，而是调用 /api/videos/search 真实检索；
   * 结果以独立消息块展示，不切换聊天对象、不影响口味上下文。
   */
  const runVideoSearch = async (text: string, base?: ChatMessage[]) => {
    if (streaming) return
    const history: ChatMessage[] = [...(base ?? messages), { role: 'user', content: text }]
    setMessages([...history, { role: 'assistant', content: '', videoLoading: true }])
    setInput('')
    setError('')
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller
    const subject = contextSubjectFor({ tasteId: taste.id })

    try {
      const bundle = await searchCookingVideos(
        { text, contextTasteId: taste.id, limit: 6 },
        controller.signal,
      )
      setMessages((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last && last.role === 'assistant') {
          next[next.length - 1] = { role: 'assistant', content: bundle.note, video: bundle }
        }
        return next
      })
    } catch (err) {
      const aborted = (err as { name?: string } | null)?.name === 'AbortError'
      const message = aborted
        ? '搜索已取消。'
        : `视频搜索暂时不可用（${err instanceof Error ? err.message : '网络异常'}）。`
      setMessages((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last && last.role === 'assistant') {
          next[next.length - 1] = { role: 'assistant', content: '', video: buildFailedBundle(text, message, subject) }
        }
        return next
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const send = async (raw: string, base?: ChatMessage[]) => {
    if (streaming) return
    const text = raw.trim()
    if (!text) return

    // 视频需求：交给站内视频搜索（真实检索），不传给模型
    const intent = detectVideoIntent(text)
    if (intent.isVideoRequest) {
      void runVideoSearch(text, base)
      return
    }

    const history: ChatMessage[] = [...(base ?? messages), { role: 'user', content: text }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setError('')
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await chatWithTaste({
        tasteId: taste.id,
        dishId: contextDish?.id,
        messages: history,
        signal: controller.signal,
        onDelta: (delta) => {
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { role: 'assistant', content: last.content + delta }
            }
            return next
          })
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '对话中断'
      setError(message)
      setMessages((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last && last.role === 'assistant' && !last.content) next.pop()
        return next
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  // 支持从外部带问题进入：/tastes/mala?q=xxx，只在还没有聊天记录时自动发送一次
  // （转场预览层里不发送：落到真实页面后再发送，避免预览层提前消耗外部带入的问题）
  useEffect(() => {
    if (isPreview) return
    const preset = searchParams.get('q')
    if (preset && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true
      void send(preset)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taste.id])

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(input)
    }
  }

  const retry = () => {
    let lastUserIndex = -1
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user') {
        lastUserIndex = i
        break
      }
    }
    if (lastUserIndex < 0) return
    const text = messages[lastUserIndex].content
    const base = messages.slice(0, lastUserIndex)
    setError('')
    void send(text, base)
  }

  const isDemo = status?.ai === 'demo'
  const personaName = taste.imageDish?.name ?? taste.name

  return (
    <section
      className="cuisine-chat taste-chat"
      id="taste-chat"
      aria-label={`和「${taste.name}」口味的 AI 人格聊天`}
    >
      <header className="cuisine-chat__head">
        <div className="cuisine-chat__identity">
          <span className="chat-head__avatar cuisine-chat__avatar">
            <FoodPhoto
              name={personaName}
              src={taste.image}
              fallbackSrc={taste.fallbackImage}
              emoji={taste.emoji}
              palette={taste.palette}
              alt={`「${taste.name}」口味 AI 人格`}
              eager
            />
          </span>
          <div className="cuisine-chat__titles">
            <h2>和「{taste.name}」口味聊聊天</h2>
            <span className="chat-head__sub">
              {taste.personalityTag} · 口味探索 · 可跨菜系聊
            </span>
          </div>
        </div>
        <div className="cuisine-chat__tools">
          {status &&
            (isDemo ? (
              <span className="demo-flag">演示模式</span>
            ) : (
              <span className="live-flag" title={`模型：${status.model ?? 'GLM'}`}>
                GLM 在线
              </span>
            ))}
          <button
            type="button"
            className="chat-head__clear"
            onClick={() => {
              if (streaming) return
              setMessages([])
              setError('')
            }}
            disabled={streaming || messages.length === 0}
          >
            清空对话
          </button>
        </div>
      </header>

      {isDemo && (
        <div className="chat-notice">
          当前为演示模式：回复由服务端本地模板生成。在服务端配置
          <code> ZHIPU_API_KEY </code>
          后，即可启用八种口味各自的人格对话（GLM 流式输出）。
        </div>
      )}

      {contextDish && (
        <div className="chat-context" data-testid="taste-chat-context">
          <span className="chat-context__label">当前讨论</span>
          <strong className="chat-context__dish">{contextDish.name}</strong>
          <span className="chat-context__from">来自口味「{taste.name}」 · {contextDish.region}</span>
          <Link to={`/dishes/${contextDish.id}`} className="chat-context__link">
            查看图鉴 <span className="arrow" aria-hidden="true">↗</span>
          </Link>
          <button type="button" className="chat-context__clear" onClick={clearDishContext}>
            切换话题
          </button>
        </div>
      )}

      <div className="chat-scroll cuisine-chat__scroll" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty__avatar">
              <FoodPhoto
                name={personaName}
                src={taste.image}
                fallbackSrc={taste.fallbackImage}
                emoji={taste.emoji}
                palette={taste.palette}
                alt={`「${taste.name}」口味 AI 人格`}
                eager
              />
            </div>
            <p className="chat-empty__greeting">{taste.greeting}</p>
            {contextDish && (
              <p className="chat-empty__context">
                从口味页带来了「{contextDish.name}」：可以直接问它为什么属于「{taste.name}」，
                或者聊聊怎么在家复刻。
              </p>
            )}
            <div className="chat-empty__suggest">
              {[
                ...(contextDish ? [`介绍一下${contextDish.name}，它为什么属于「${taste.name}」口味？`] : []),
                ...taste.suggestedQuestions,
                VIDEO_REQUEST_TEXT,
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  className="chat-suggest"
                  onClick={() => void send(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isLast = index === messages.length - 1
          const isVideoMessage = message.role === 'assistant' && Boolean(message.video || message.videoLoading)
          const empty = message.role === 'assistant' && !message.content && !isVideoMessage
          return (
            <div
              key={`${index}-${message.role}`}
              className={`msg msg--${message.role} ${empty && streaming ? 'is-typing' : ''}`}
            >
              {message.role === 'assistant' && (
                <span className="msg__avatar">
                  <FoodPhoto
                    name={personaName}
                    src={taste.image}
                    fallbackSrc={taste.fallbackImage}
                    emoji={taste.emoji}
                    palette={taste.palette}
                    alt={`「${taste.name}」口味 AI 人格`}
                  />
                </span>
              )}
              <div className={`msg__bubble ${isVideoMessage ? 'msg__bubble--video' : ''}`}>
                {isVideoMessage ? (
                  <VideoResults
                    bundle={message.video}
                    loading={message.videoLoading}
                    onRetry={() => {
                      const retryText = message.video?.sourceText || messages[index - 1]?.content || ''
                      if (retryText) void runVideoSearch(retryText, messages.slice(0, Math.max(0, index - 1)))
                    }}
                  />
                ) : (
                  message.content
                )}
                {message.role === 'assistant' && streaming && isLast && !isVideoMessage && (
                  <span className="msg__caret" aria-hidden="true" />
                )}
              </div>
            </div>
          )
        })}

        {error && (
          <div className="msg msg--error">
            <div className="msg__bubble">
              {error}
              <button type="button" className="msg__retry" onClick={retry}>
                重试
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="chat-quickbar">
        <button
          type="button"
          className="chat-quickbar__video"
          onClick={() => void send(VIDEO_REQUEST_TEXT)}
          disabled={streaming}
        >
          🎬 {VIDEO_REQUEST_TEXT}
        </button>
        <span className="chat-quickbar__hint">真实检索 B 站等平台，结果可点击观看</span>
      </div>

      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault()
          void send(input)
        }}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`和「${taste.name}」口味 AI 聊点什么…（忌口、辣度、想吃的菜系都可以说）`}
          rows={1}
          maxLength={2000}
        />
        {streaming ? (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => abortRef.current?.abort()}
          >
            停止
          </button>
        ) : (
          <button type="submit" className="btn btn--primary btn--sm" disabled={!input.trim()}>
            发送 <span className="arrow">→</span>
          </button>
        )}
      </form>
    </section>
  )
}
