import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FoodPhoto from './FoodPhoto'
import VideoResults from './VideoResults'
import { useWorldPreview } from './CircularTransition'
import { chatWithCuisine, getAiStatus, searchCookingVideos } from '../lib/api'
import { VIDEO_REQUEST_TEXT, buildFailedBundle, contextSubjectFor, detectVideoIntent } from '../lib/videoIntent'
import { useLocalStorage } from '../lib/hooks'
import { getDish } from '../data/dishes'
import type { AiStatus, ChatMessage } from '../types'
import type { Cuisine } from '../data/cuisines'

/**
 * 菜系专属聊天区（嵌在 /cuisines/:id 页面内）
 * ------------------------------------------------------------
 * - 每个菜系有独立的本地历史（fs-cuisine-chat-<cuisineId>），不同菜系互不串上下文；
 * - 请求 /api/cuisine-chat 并携带 cuisineId，服务端校验后选择该菜系的系统提示词；
 * - 页面以 key={cuisine.id} 挂载本组件，切换菜系时聊天区整体重建；
 * - 未主动点击「代表菜 → 切换到角色聊天」时，聊天对象始终是当前菜系本身。
 */
export default function CuisineChat({ cuisine }: { cuisine: Cuisine }) {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`fs-cuisine-chat-${cuisine.id}`, [])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  /** 渲染在转场预览层里（真实页面组件的第二次挂载）：不触发落地后才会有的副作用 */
  const isPreview = useWorldPreview()

  /**
   * 菜品图鉴带进来的上下文：/cuisines/<id>?dish=<菜品 id>。
   * 只有这道菜确实属于当前菜系时才生效（服务端也会再校验一次）。
   */
  const dishParam = searchParams.get('dish')
  const contextDish = (() => {
    const candidate = getDish(dishParam)
    return candidate && candidate.cuisineId === cuisine.id ? candidate : undefined
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
  }, [cuisine.id])

  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, streaming])

  /**
   * 视频搜索请求：不进入菜系人格对话，而是调用 /api/videos/search 真实检索；
   * 结果以独立消息块展示，不切换聊天对象、不影响菜系上下文。
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
    const subject = contextSubjectFor({ cuisineId: cuisine.id })

    try {
      const bundle = await searchCookingVideos(
        { text, contextCuisineId: cuisine.id, limit: 6 },
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
      await chatWithCuisine({
        cuisineId: cuisine.id,
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

  // 支持从外部带问题进入：/cuisines/chuan?q=xxx，只在还没有聊天记录时自动发送一次
  // （转场预览层里不发送：落到真实页面后再发送，避免预览层提前消耗外部带入的问题）
  useEffect(() => {
    if (isPreview) return
    const preset = searchParams.get('q')
    if (preset && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true
      void send(preset)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisine.id])

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

  return (
    <section className="cuisine-chat" id="cuisine-chat" aria-label={`和${cuisine.name}的 AI 人格聊天`}>
      <header className="cuisine-chat__head">
        <div className="cuisine-chat__identity">
          <span className="chat-head__avatar cuisine-chat__avatar">
            <FoodPhoto
              name={cuisine.name}
              src={cuisine.image}
              fallbackSrc={cuisine.fallbackImage}
              emoji={cuisine.emoji}
              palette={cuisine.palette}
              alt={`${cuisine.name} AI 人格`}
              eager
            />
          </span>
          <div className="cuisine-chat__titles">
            <h2>和「{cuisine.name}」AI 聊聊天</h2>
            <span className="chat-head__sub">
              {cuisine.personalityTag} · {cuisine.region} · 代表整个{cuisine.name}菜系
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
          后，即可启用八大菜系各自的人格对话（GLM 流式输出）。
        </div>
      )}

      {contextDish && (
        <div className="chat-context" data-testid="cuisine-chat-context">
          <span className="chat-context__label">当前讨论</span>
          <strong className="chat-context__dish">{contextDish.name}</strong>
          <span className="chat-context__from">来自图鉴 · {contextDish.region}</span>
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
                name={cuisine.name}
                src={cuisine.image}
                fallbackSrc={cuisine.fallbackImage}
                emoji={cuisine.emoji}
                palette={cuisine.palette}
                alt={`${cuisine.name} AI 人格`}
                eager
              />
            </div>
            <p className="chat-empty__greeting">{cuisine.greeting}</p>
            {contextDish && (
              <p className="chat-empty__context">
                从图鉴页带来了「{contextDish.name}」：可以直接问它的做法、典故，或者让 AI 说说它在{cuisine.name}里的位置。
              </p>
            )}
            <div className="chat-empty__suggest">
              {[
                ...(contextDish ? [`介绍一下${contextDish.name}，它在${cuisine.name}里是什么位置？`] : []),
                ...cuisine.suggestedQuestions,
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
                    name={cuisine.name}
                    src={cuisine.image}
                    fallbackSrc={cuisine.fallbackImage}
                    emoji={cuisine.emoji}
                    palette={cuisine.palette}
                    alt={`${cuisine.name} AI 人格`}
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
          placeholder={`和${cuisine.name}的 AI 聊点什么…（做法、选菜、辣度都可以）`}
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
