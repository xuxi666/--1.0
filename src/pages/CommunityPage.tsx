import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import Lightbox from '../components/Lightbox'
import FoodPhoto from '../components/FoodPhoto'
import {
  avatarColorFor,
  initialOf,
  postKinds,
  communityTopics,
  type CommunityPost,
  type PostKind,
} from '../data/community'
import { characterMap } from '../data/characters'
import { useLocalStorage } from '../lib/hooks'
import { useCommunityFeed } from '../lib/community'
import { uploadPhoto } from '../lib/api'
import { photoUrl } from '../lib/photos'

const PICKABLE = [
  '麻婆豆腐',
  '水煮鱼',
  '重庆火锅',
  '东坡肉',
  '小笼包',
  '兰州牛肉面',
  '黑芝麻汤圆',
  '孜然羊肉串',
]

type UploadItem = {
  id: string
  name: string
  preview: string
  status: 'uploading' | 'done' | 'error'
  url?: string
  error?: string
  size: number
}

export default function CommunityPage() {
  const community = useCommunityFeed()
  const [nickname, setNickname] = useLocalStorage<string>('fs-nickname', '')

  const [filter, setFilter] = useState<PostKind | '全部'>('全部')
  const [sort, setSort] = useState<'latest' | 'hot'>('latest')
  const [preview, setPreview] = useState<{ src: string; caption: string } | null>(null)

  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [pickedImages, setPickedImages] = useState<string[]>([])
  const [kind, setKind] = useState<PostKind>('讨论')
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState('')
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [mediaTab, setMediaTab] = useState<'upload' | 'library'>('upload')
  const [dragOver, setDragOver] = useState(false)

  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const composerBoxRef = useRef<HTMLDivElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const all = community.posts

  const counts = useMemo(() => {
    const map: Record<string, number> = { 全部: all.length }
    for (const post of all) map[post.kind] = (map[post.kind] ?? 0) + 1
    return map
  }, [all])

  const feed = useMemo(() => {
    const filtered = filter === '全部' ? all : all.filter((post) => post.kind === filter)
    return [...filtered].sort((a, b) =>
      sort === 'hot'
        ? b.likeCount + b.replies.length * 2 - (a.likeCount + a.replies.length * 2)
        : b.createdAt - a.createdAt,
    )
  }, [all, filter, sort])

  const openImage = (post: CommunityPost, index: number) =>
    setPreview({ src: post.images[index], caption: `${post.topic} · @${post.nickname}` })

  const focusComposer = () => {
    composerBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => composerRef.current?.focus(), 420)
  }

  const toggleImage = (name: string) => {
    setPickedImages((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : prev.length >= 3
          ? prev
          : [...prev, name],
    )
  }

  const uploadsRef = useRef<UploadItem[]>([])
  useEffect(() => {
    uploadsRef.current = uploads
  }, [uploads])

  useEffect(
    () => () => {
      uploadsRef.current.forEach((item) => {
        if (item.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview)
      })
    },
    [],
  )

  const flashToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return
    const slots = 3 - uploads.length - pickedImages.length
    if (slots <= 0) {
      flashToast('最多 3 张图片')
      return
    }
    for (const file of Array.from(files).slice(0, slots)) {
      if (!file.type.startsWith('image/')) {
        flashToast('只支持图片文件')
        continue
      }
      if (file.size > 12 * 1024 * 1024) {
        flashToast('单张照片请小于 12MB')
        continue
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const preview = URL.createObjectURL(file)
      setUploads((prev) => [
        ...prev,
        { id, name: file.name, preview, status: 'uploading', size: file.size },
      ])
      uploadPhoto(file)
        .then((result) => {
          setUploads((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: 'done', url: result.url, preview: result.preview } : item,
            ),
          )
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : '上传失败'
          flashToast(message)
          setUploads((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: 'error', error: message } : item,
            ),
          )
        })
    }
  }

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target && target.preview.startsWith('blob:')) URL.revokeObjectURL(target.preview)
      return prev.filter((item) => item.id !== id)
    })
  }

  const likePost = (postId: string) => {
    void community.toggleLike(postId).catch(() => flashToast('点赞失败，请确认服务仍在运行'))
  }

  const publish = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!content.trim() || publishing) return
    if (uploads.some((item) => item.status === 'uploading')) {
      flashToast('照片还在上传，稍等一下再发')
      return
    }
    const uploaded = uploads.filter((item) => item.status === 'done' && item.url).map((item) => item.url as string)
    if (uploads.some((item) => item.status === 'error') && uploaded.length === 0) {
      flashToast('有照片上传失败，删掉重传一次')
      return
    }

    setPublishing(true)
    try {
      await community.publishPost({
        nickname: nickname.trim() || '匿名食客',
        topic: topic.trim() || content.trim().slice(0, 18),
        content: content.trim(),
        kind,
        images: [...uploaded, ...pickedImages.map((item) => photoUrl(item))],
      })
      setTopic('')
      setContent('')
      setPickedImages([])
      setUploads([])
      setFilter('全部')
      setSort('latest')
      flashToast('已发布 · 局域网内所有设备都能看到')
    } catch (error) {
      flashToast(error instanceof Error ? error.message : '发布失败，请稍后再试')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <main className="page community">
      <div className="container">
        {/* ---------- Hero ---------- */}
        <section className="community-hero">
          <span className="community-hero__beam" aria-hidden="true" />
          <div className="community-hero__copy">
            <span className="eyebrow">COMMUNITY · 食有灵社区</span>
            <h1 className="page-title">
              好吃的东西，
              <br />
              值得一起聊。
            </h1>
            <p className="page-sub">
              和角色聊完，把结论带回来。菜谱、踩坑、深夜的食欲，都有人接话。
            </p>
          </div>

          <div className="community-hero__stats">
            <div>
              <strong>2,846</strong>
              <span>今日讨论</span>
            </div>
            <div>
              <strong>{all.length}</strong>
              <span>在架帖子</span>
            </div>
            <div>
              <strong>17</strong>
              <span>活跃角色</span>
            </div>
            <div>
              <strong>31</strong>
              <span>在线食客</span>
            </div>
          </div>

          <div className="community-hero__topics">
            {communityTopics.map((item) => (
              <button
                key={item}
                type="button"
                className="community-topic"
                onClick={() => {
                  setContent((prev) => (prev.includes(item) ? prev : `${prev}${item} `))
                  focusComposer()
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* ---------- 工具条 ---------- */}
        <div className="community-toolbar">
          <div className="community-toolbar__filters" role="tablist" aria-label="帖子分类">
            {postKinds.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={filter === item}
                className={`community-filter ${filter === item ? 'is-active' : ''}`}
                onClick={() => setFilter(item)}
              >
                {item}
                <span>{counts[item] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="community-toolbar__right">
            <div className="community-sort">
              <button
                type="button"
                className={sort === 'latest' ? 'is-active' : ''}
                onClick={() => setSort('latest')}
              >
                最新
              </button>
              <button
                type="button"
                className={sort === 'hot' ? 'is-active' : ''}
                onClick={() => setSort('hot')}
              >
                最热
              </button>
            </div>
            <button type="button" className="btn btn--primary btn--sm" onClick={focusComposer}>
              发帖
            </button>
          </div>
        </div>

        {/* ---------- 主体 ---------- */}
        <div className="community-layout">
          <div className="community-feed">
            {feed.length === 0 && (
              <div className="community-empty">
                <p>这个分类还没有帖子。</p>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setFilter('全部')}
                >
                  看看全部
                </button>
              </div>
            )}

            {feed.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                liked={post.liked}
                likeCount={post.likeCount}
                replies={post.replies}
                onLike={() => likePost(post.id)}
                onOpenImage={openImage}
                onSubmitReply={(replyText) =>
                  community.submitReply(post.id, {
                    nickname: nickname.trim() || '匿名食客',
                    content: replyText,
                  })
                }
              />
            ))}
          </div>

          <aside className="community-aside">
            <div className="composer" ref={composerBoxRef}>
              <div className="composer__head">
                <span
                  className="composer__avatar"
                  style={{ background: avatarColorFor(nickname.trim() || '匿名食客') }}
                  aria-hidden="true"
                >
                  {initialOf(nickname.trim() || '匿名食客')}
                </span>
                <div>
                  <h3>说点什么</h3>
                  <p>帖子与回复存服务端 · 局域网内同步</p>
                </div>
              </div>

              <form onSubmit={publish}>
                <input
                  className="composer__nick"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="昵称（不填就是匿名食客）"
                  maxLength={16}
                />
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="标题（可选）"
                  maxLength={40}
                />
                <textarea
                  ref={composerRef}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="今天和哪位角色聊了什么？做成了，还是翻车了？"
                  rows={4}
                  maxLength={400}
                />

                <div className="composer__kinds">
                  {(['讨论', '菜谱分享', '提问', '角色话题'] as PostKind[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`opt ${kind === item ? 'is-active' : ''}`}
                      aria-pressed={kind === item}
                      onClick={() => setKind(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="composer__media">
                  <div className="composer__media-head">
                    <span className="composer__photos-label">
                      配图 · {uploads.length + pickedImages.length}/3
                    </span>
                    <div className="composer__tabs" role="tablist" aria-label="配图来源">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={mediaTab === 'upload'}
                        className={mediaTab === 'upload' ? 'is-active' : ''}
                        onClick={() => setMediaTab('upload')}
                      >
                        上传照片
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={mediaTab === 'library'}
                        className={mediaTab === 'library' ? 'is-active' : ''}
                        onClick={() => setMediaTab('library')}
                      >
                        素材库
                      </button>
                    </div>
                  </div>

                  {mediaTab === 'upload' ? (
                    <div className="composer__upload">
                      <button
                        type="button"
                        className={`dropzone ${dragOver ? 'is-over' : ''}`}
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(event) => {
                          event.preventDefault()
                          setDragOver(true)
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(event) => {
                          event.preventDefault()
                          setDragOver(false)
                          addFiles(event.dataTransfer.files)
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                          <path
                            d="M12 16V5m0 0L8 9m4-4 4 4M4 17v1.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V17"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>点击选择，或把照片拖进来</span>
                        <em>JPG / PNG / WebP · 单张 ≤ 12MB · 自动压缩</em>
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(event) => {
                          addFiles(event.target.files)
                          event.target.value = ''
                        }}
                      />

                      {uploads.length > 0 && (
                        <div className="upload-list">
                          {uploads.map((item) => (
                            <div key={item.id} className={`upload-item is-${item.status}`}>
                              <img src={item.preview} alt={item.name} />
                              {item.status === 'uploading' && (
                                <span className="upload-item__spinner" aria-label="上传中" />
                              )}
                              {item.status === 'error' && (
                                <span className="upload-item__error" title={item.error}>
                                  !
                                </span>
                              )}
                              <button
                                type="button"
                                className="upload-item__remove"
                                onClick={() => removeUpload(item.id)}
                                aria-label="移除照片"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="composer__photos-grid">
                      {PICKABLE.map((name) => {
                        const active = pickedImages.includes(name)
                        return (
                          <button
                            key={name}
                            type="button"
                            className={`composer__photo ${active ? 'is-picked' : ''}`}
                            onClick={() => toggleImage(name)}
                            aria-pressed={active}
                            aria-label={`选择配图：${name}`}
                          >
                            <FoodPhoto name={name} alt={name} />
                            <span className="composer__photo-check" aria-hidden="true">
                              ✓
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--block btn--sm"
                  disabled={!content.trim() || publishing}
                >
                  {publishing ? '发布中…' : '发布'}
                </button>
              </form>
            </div>

            <div className="aside-card">
              <h3>活跃角色</h3>
              <ul className="aside-chars">
                {['mapo', 'huoguo', 'lanzhou', 'tangyuan', 'dongpo'].map((id) => {
                  const character = characterMap[id]
                  if (!character) return null
                  return (
                    <li key={id}>
                      <Link to={`/chat/${id}`}>
                        <span className="aside-chars__thumb">
                          <FoodPhoto name={character.name} alt={character.name} />
                        </span>
                        <span className="aside-chars__name">{character.name}</span>
                        <em>{character.tagline}</em>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="aside-card aside-card--rules">
              <h3>社区守则</h3>
              <ul>
                <li>只聊吃的，也聊吃背后的人。</li>
                <li>引用角色说法时，标上它的名字。</li>
                <li>翻车现场欢迎发，比成功学好看。</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {preview &&
        createPortal(
          <Lightbox src={preview.src} caption={preview.caption} onClose={() => setPreview(null)} />,
          document.body,
        )}

      {toast && createPortal(<div className="community-toast">{toast}</div>, document.body)}
    </main>
  )
}
