/**
 * 美食小精灵 FOOD SOUL PET · 首页右下角悬浮助手
 * ------------------------------------------------------------
 * - 每次加载首页随机选一只小精灵（逻辑在 src/data/foodSprites.ts）；
 * - 形象只影响视觉，对话身份由服务端通用提示词统一决定；
 * - 点击精灵展开聊天面板，ESC / 关闭按钮收起，消息在本次页面会话内保留。
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { chatWithPet } from '../lib/api'
import type { ChatMessage } from '../types'
import {
  dismissPetBubble,
  isPetBubbleDismissed,
  lastFoodSpriteId,
  pickFoodSprite,
  pickSpriteHint,
  rememberFoodSprite,
} from '../data/foodSprites'
import FoodSpriteArt from './FoodSpriteArt'
import './FoodSoulPet.css'

const QUICK_QUESTIONS = [
  '今天吃什么好？',
  '给我推荐一道简单的家常菜。',
  '只有鸡蛋和番茄，能做什么？',
  '给我讲一个关于美食的小知识。',
]

const PANEL_ID = 'food-soul-pet-panel'

export default function FoodSoulPet() {
  // 每次加载首页随机一只；同一标签页连续刷新会优先避开上一只（仍保持随机）
  const [sprite] = useState(() => pickFoodSprite({ excludeId: lastFoodSpriteId() }))
  const [hint] = useState(() => pickSpriteHint(sprite))
  const [bubbleOpen, setBubbleOpen] = useState(() => !isPetBubbleDismissed())

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [demo, setDemo] = useState(false)
  const [unread, setUnread] = useState(false)

  const petRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const openRef = useRef(open)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    rememberFoodSprite(sprite.id)
  }, [sprite.id])

  // 聊天区自动滚到底部
  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, streaming, open, error])

  // 卸载时中止未完成的请求
  useEffect(() => () => abortRef.current?.abort(), [])

  const closePanel = useCallback(() => {
    setOpen(false)
    window.requestAnimationFrame(() => petRef.current?.focus())
  }, [])

  // 打开后聚焦输入框；ESC 收起并把焦点还给精灵按钮
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closePanel])

  const togglePanel = () => {
    if (open) {
      closePanel()
      return
    }
    setUnread(false)
    setOpen(true)
  }

  const dismissBubble = () => {
    setBubbleOpen(false)
    dismissPetBubble()
  }

  const send = async (raw: string, base?: ChatMessage[]) => {
    const text = raw.trim()
    if (!text || streaming) return

    const history: ChatMessage[] = [...(base ?? messages), { role: 'user', content: text }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setError('')
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await chatWithPet({
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
          if (!openRef.current) setUnread(true)
        },
      })
      setDemo(result.demo)
    } catch (err) {
      // 主动中止（如组件卸载）不算错误，只收掉空气泡
      setMessages((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last && last.role === 'assistant' && !last.content) next.pop()
        return next
      })
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : '对话中断了，请稍后再试。')
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
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
    void send(text, base)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    // 中文输入法组合中的回车不发送
    if (event.nativeEvent.isComposing) return
    event.preventDefault()
    void send(input)
  }

  return (
    <div className="pet">
      {open && (
        <section className="pet-panel" id={PANEL_ID} role="dialog" aria-label={`美食小精灵聊天 · ${sprite.name}`}>
          <header className="pet-panel__head">
            <span className="pet-panel__avatar" aria-hidden="true">
              <FoodSpriteArt art={sprite.art} palette={sprite.palette} size={36} />
            </span>
            <div className="pet-panel__who">
              <strong>{sprite.name}</strong>
              <span>美食小精灵 · FOOD SOUL PET</span>
            </div>
            <button type="button" className="pet-panel__close" onClick={closePanel} aria-label="收起聊天窗口">
              ✕
            </button>
          </header>

          <div className="pet-panel__scroll" ref={scrollRef} role="log" aria-live="polite" aria-busy={streaming}>
            {messages.length === 0 && (
              <div className="pet-panel__empty">
                <p className="pet-panel__welcome">{sprite.welcome}</p>
                <p className="pet-panel__sub">没有固定人格，聊什么都可以。也可以先试试：</p>
                <div className="pet-panel__quick">
                  {QUICK_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="pet-quick"
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
              const typing = streaming && isLast && message.role === 'assistant' && !message.content
              return (
                <div key={index} className={`pet-msg pet-msg--${message.role}`}>
                  <div className="pet-msg__bubble">
                    {typing ? (
                      <span className="pet-typing" aria-label="正在回复">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              )
            })}

            {error && (
              <div className="pet-msg pet-msg--error" role="alert">
                <div className="pet-msg__bubble">
                  <span>{error}</span>
                  <button type="button" className="pet-msg__retry" onClick={retry} disabled={streaming}>
                    重试
                  </button>
                </div>
              </div>
            )}
          </div>

          <form
            className="pet-composer"
            onSubmit={(event) => {
              event.preventDefault()
              void send(input)
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              maxLength={500}
              placeholder={`和${sprite.name}聊聊今天吃什么…`}
              aria-label="输入消息"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
            />
            <button type="submit" className="btn btn--primary btn--sm pet-composer__send" disabled={streaming || !input.trim()}>
              {streaming ? '回复中' : '发送'}
            </button>
          </form>

          <p className="pet-panel__foot">
            <span>AI 生成内容仅供参考 · 完整菜谱请用「AI 菜谱」</span>
            {demo && <span className="pet-panel__demo">演示模式</span>}
          </p>
        </section>
      )}

      {bubbleOpen && !open && (
        <div className="pet-bubble">
          <button type="button" className="pet-bubble__close" onClick={dismissBubble} aria-label="关闭提示气泡">
            ✕
          </button>
          <p>{hint}</p>
        </div>
      )}

      <button
        ref={petRef}
        type="button"
        className="pet-launcher"
        aria-label={`${sprite.name} · 打开美食小精灵聊天`}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={togglePanel}
      >
        <span className="pet-launcher__ring" aria-hidden="true" />
        <span className="pet-launcher__art" aria-hidden="true">
          <FoodSpriteArt art={sprite.art} palette={sprite.palette} size={62} />
        </span>
        {unread && !open && <span className="pet-launcher__dot" aria-hidden="true" />}
      </button>
    </div>
  )
}
