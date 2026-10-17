import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CommunityPost, PostReply } from '../data/community'
import { characterMap } from '../data/characters'
import { formatTimeAgo } from '../lib/community'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M12 20.2s-7.4-4.6-7.4-9.4A4.3 4.3 0 0 1 12 8.1a4.3 4.3 0 0 1 7.4 2.7c0 4.8-7.4 9.4-7.4 9.4Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M20 12.4c0 3.6-3.6 6.4-8 6.4-1 0-2-.15-2.9-.42L5 20l1.2-3.3A6.5 6.5 0 0 1 4 12.4C4 8.8 7.6 6 12 6s8 2.8 8 6.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type Props = {
  post: CommunityPost
  liked: boolean
  likeCount: number
  replies: PostReply[]
  onLike: () => void
  onOpenImage: (post: CommunityPost, index: number) => void
  /** 提交回复；由页面写入服务端，成功后 resolve */
  onSubmitReply?: (content: string) => Promise<void>
  variant?: 'full' | 'compact'
  index?: number
}

export default function PostCard({
  post,
  liked,
  likeCount,
  replies,
  onLike,
  onOpenImage,
  onSubmitReply,
  variant = 'full',
  index = 0,
}: Props) {
  const character = post.characterId ? characterMap[post.characterId] : undefined
  const images = post.images ?? []

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [replyError, setReplyError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (open && onSubmitReply) inputRef.current?.focus({ preventScroll: true })
  }, [open, onSubmitReply])

  const submitReply = async () => {
    const text = draft.trim()
    if (!text || sending || !onSubmitReply) return
    setSending(true)
    setReplyError('')
    try {
      await onSubmitReply(text)
      setDraft('')
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : '回复失败，请重试')
    } finally {
      setSending(false)
    }
  }

  return (
    <article
      className={`fs-post ${variant === 'compact' ? 'fs-post--compact' : ''} ${
        images.length ? 'has-media' : ''
      }`}
      style={{ '--i': index } as React.CSSProperties}
    >
      <header className="fs-post__head">
        <span
          className="fs-post__avatar"
          style={{ background: post.avatarColor }}
          aria-hidden="true"
        >
          {post.initial}
        </span>
        <div className="fs-post__who">
          <div className="fs-post__name-row">
            <span className="fs-post__name">{post.nickname}</span>
            {post.badge && <span className="fs-post__badge">{post.badge}</span>}
          </div>
          <span className="fs-post__meta">
            {formatTimeAgo(post.createdAt)} · {post.kind}
          </span>
        </div>
      </header>

      <h3 className="fs-post__topic">{post.topic}</h3>
      <p className="fs-post__content">{post.content}</p>

      {images.length > 0 && (
        <div className={`fs-post__media fs-post__media--${Math.min(images.length, 3)}`}>
          {images.slice(0, 3).map((src, imageIndex) => (
            <button
              key={src + imageIndex}
              type="button"
              className="fs-post__image"
              onClick={() => onOpenImage(post, imageIndex)}
              aria-label={`查看图片：${post.topic}`}
            >
              <img src={src} alt={post.topic} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      <footer className="fs-post__foot">
        {character ? (
          <Link className="fs-post__char" to={`/characters/${character.id}`}>
            <span className="fs-post__char-dot" style={{ background: character.palette.base }} />
            {character.name}
          </Link>
        ) : (
          <span className="fs-post__char fs-post__char--plain"># 美食讨论</span>
        )}

        <div className="fs-post__actions">
          <button
            type="button"
            className={`fs-action ${liked ? 'is-liked' : ''}`}
            onClick={onLike}
            aria-pressed={liked}
            aria-label={liked ? '取消点赞' : '点赞'}
          >
            <HeartIcon filled={liked} />
            <span>{likeCount}</span>
          </button>
          <button
            type="button"
            className={`fs-action ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? '收起回复' : '回复'}
          >
            <ReplyIcon />
            <span>{replies.length > 0 ? `${replies.length} 条回复` : '回复'}</span>
          </button>
        </div>
      </footer>

      {open && (
        <section className="fs-post__replies" aria-label="回复">
          {replies.length === 0 ? (
            <p className="fs-replies__empty">还没有回复，来说第一句。</p>
          ) : (
            <ul className="fs-replies">
              {replies.map((reply) => (
                <li key={reply.id} className="fs-reply">
                  <span
                    className="fs-reply__avatar"
                    style={{ background: reply.avatarColor }}
                    aria-hidden="true"
                  >
                    {reply.initial}
                  </span>
                  <div className="fs-reply__body">
                    <div className="fs-reply__head">
                      <strong>{reply.nickname}</strong>
                      <span>{formatTimeAgo(reply.createdAt)}</span>
                    </div>
                    <p>{reply.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {onSubmitReply && (
            <form
              className="fs-reply-form"
              onSubmit={(event) => {
                event.preventDefault()
                void submitReply()
              }}
            >
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void submitReply()
                  }
                }}
                placeholder="写下你的回复…（Enter 发送）"
                rows={1}
                maxLength={200}
              />
              <button
                type="submit"
                className="btn btn--primary btn--sm"
                disabled={!draft.trim() || sending}
              >
                {sending ? '发送中' : '回复'}
              </button>
            </form>
          )}

          {replyError && <p className="fs-reply-form__error">{replyError}</p>}
        </section>
      )}
    </article>
  )
}
