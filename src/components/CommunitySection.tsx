import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { CommunityPost } from '../data/community'
import { useLocalStorage } from '../lib/hooks'
import { useCommunityFeed } from '../lib/community'
import PostCard from './PostCard'
import Lightbox from './Lightbox'

export default function CommunitySection({ limit = 4 }: { limit?: number }) {
  const community = useCommunityFeed()
  const [nickname] = useLocalStorage<string>('fs-nickname', '')
  const [preview, setPreview] = useState<{ src: string; caption: string } | null>(null)

  const posts = community.posts.slice(0, limit)
  const [featured, ...rest] = posts
  const todayCount = community.posts.filter((post) => Date.now() - post.createdAt < 86_400_000).length

  const openImage = (post: CommunityPost, index: number) =>
    setPreview({ src: post.images[index], caption: `${post.topic} · @${post.nickname}` })

  const renderPost = (post: (typeof posts)[number], index: number, variant: 'full' | 'compact') => (
    <PostCard
      key={post.id}
      post={post}
      variant={variant}
      index={index}
      liked={post.liked}
      likeCount={post.likeCount}
      replies={post.replies}
      onLike={() => {
        void community.toggleLike(post.id).catch(() => {})
      }}
      onOpenImage={openImage}
      onSubmitReply={(content) =>
        community.submitReply(post.id, { nickname: nickname.trim() || '匿名食客', content })
      }
    />
  )

  return (
    <div className="community-home">
      <div className="community-home__main">{featured && renderPost(featured, 0, 'full')}</div>

      <div className="community-home__side">
        <div className="community-stats">
          <div>
            <strong>2,846</strong>
            <span>今日讨论</span>
          </div>
          <div>
            <strong>17</strong>
            <span>活跃角色</span>
          </div>
          <div>
            <strong>{todayCount}</strong>
            <span>今日新帖</span>
          </div>
        </div>

        <div className="community-home__list">
          {rest.map((post, index) => renderPost(post, index + 1, 'compact'))}
        </div>

        <Link to="/community" className="community-home__more">
          进入完整社区
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {preview &&
        createPortal(
          <Lightbox src={preview.src} caption={preview.caption} onClose={() => setPreview(null)} />,
          document.body,
        )}
    </div>
  )
}
