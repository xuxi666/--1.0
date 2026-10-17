import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { characterMap, getCharacter } from '../data/characters'
import { categoryMap } from '../data/categories'
import { useLocalStorage } from '../lib/hooks'
import { chatWithCharacter, getAiStatus } from '../lib/api'
import type { AiStatus, ChatMessage } from '../types'
import FoodPhoto from '../components/FoodPhoto'
import RelatedDishes from '../components/RelatedDishes'

const SWITCH_LIST = ['mapo', 'huoguo', 'lanzhou', 'dongpo', 'xiaolongbao', 'tangyuan', 'chuan', 'yue']

export default function ChatPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const character = getCharacter(id)

  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`fs-chat-${id ?? 'none'}`, [])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<AiStatus | null>(null)

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
  }, [])

  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, streaming])

  const send = async (raw: string, base?: ChatMessage[]) => {
    if (!character || streaming) return
    const text = raw.trim()
    if (!text) return

    const history: ChatMessage[] = [...(base ?? messages), { role: 'user', content: text }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setError('')
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await chatWithCharacter({
        characterId: character.id,
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

  // 从角色页带问题进入时自动发送一次
  useEffect(() => {
    const preset = searchParams.get('q')
    if (preset && character && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true
      void send(preset)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.id])

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const switchList = useMemo(
    () => SWITCH_LIST.map((cid) => characterMap[cid]).filter(Boolean),
    [],
  )

  if (!character) {
    return (
      <main className="page">
        <div className="container page-empty">
          <h1>没有找到这位角色</h1>
          <Link to="/personalities" className="btn btn--ghost">
            返回美食人格
          </Link>
        </div>
      </main>
    )
  }

  const category = categoryMap[character.categoryId]
  const isDemo = status?.ai === 'demo'

  return (
    <main className="chat-page">
      <div className="container chat-shell">
        <aside className="chat-side">
          <Link to={`/characters/${character.id}`} className="chat-side__card">
            <div className="chat-side__visual">
              <FoodPhoto
                name={character.name}
                emoji={character.emoji}
                palette={character.palette}
                alt={character.name}
                eager
              />
            </div>
            <div className="chat-side__meta">
              <strong>{character.name}</strong>
              <span>
                {category?.name} · {character.tagline}
              </span>
            </div>
          </Link>

          <div className="chat-side__group">
            <span className="chat-side__label">切换角色</span>
            <ul className="chat-side__list">
              {switchList.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/chat/${item.id}`}
                    className={`chat-side__item ${item.id === character.id ? 'is-active' : ''}`}
                  >
                    <span className="chat-side__dot" style={{ background: item.palette.base }} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link to="/personalities" className="chat-side__all">
            全部 17 位角色 →
          </Link>
        </aside>

        <section className="chat-main">
          <header className="chat-head">
            <div className="chat-head__left">
              <span className="chat-head__avatar">
                <FoodPhoto
                  name={character.name}
                  emoji={character.emoji}
                  palette={character.palette}
                  alt={character.name}
                  eager
                />
              </span>
              <div>
                <h1>{character.name}</h1>
                <span className="chat-head__sub">
                  {category?.name} · {character.tagline}
                </span>
              </div>
            </div>
            <div className="chat-head__right">
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
              当前为演示模式：回复由本地模板生成，用于展示多轮对话流程。在服务端配置
              <code> ZHIPU_API_KEY </code>
              后即可启用真实的角色人格对话（GLM 流式输出）。
            </div>
          )}

          <div className="chat-scroll" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="chat-empty">
                <div className="chat-empty__avatar">
                  <FoodPhoto
                    name={character.name}
                    emoji={character.emoji}
                    palette={character.palette}
                    alt={character.name}
                    eager
                  />
                </div>
                <p className="chat-empty__greeting">{character.greeting}</p>
                <div className="chat-empty__suggest">
                  {character.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="chat-suggest"
                      onClick={() => void send(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const isLast = index === messages.length - 1
              const empty = message.role === 'assistant' && !message.content
              return (
                <div
                  key={`${index}-${message.role}`}
                  className={`msg msg--${message.role} ${empty && streaming ? 'is-typing' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <span className="msg__avatar">
                      <FoodPhoto
                        name={character.name}
                        emoji={character.emoji}
                        palette={character.palette}
                        alt={character.name}
                      />
                    </span>
                  )}
                  <div className="msg__bubble">
                    {message.content}
                    {message.role === 'assistant' && streaming && isLast && (
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
              placeholder={`和${character.name}说点什么…`}
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
        <RelatedDishes characterId={character.id} characterName={character.name} />

      </div>
    </main>
  )
}
