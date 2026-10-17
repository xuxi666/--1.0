import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createCommunityPost,
  createCommunityReply,
  fetchCommunity,
  toggleCommunityLike,
} from './api'
import {
  communityPosts,
  type CommunityPost,
  type CommunitySnapshot,
  type PostKind,
  type PostReply,
} from '../data/community'

/** 帖子视图：在原始帖子上叠加服务端的回复、点赞与“我是否点过赞” */
export type PostView = CommunityPost & {
  replies: PostReply[]
  likeCount: number
  liked: boolean
}

const EMPTY_SNAPSHOT: CommunitySnapshot = { posts: [], replies: {}, likes: {} }

/** 相对时间文案 */
export function formatTimeAgo(ts: number): string {
  const minutes = Math.max(0, Math.floor((Date.now() - ts) / 60_000))
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  if (hours < 48) return '昨天'
  return `${Math.floor(hours / 24)} 天前`
}

let memoryClientId = ''

/** 每个浏览器一个稳定的客户端 id，用于服务端记录“谁点过赞” */
export function getClientId(): string {
  if (memoryClientId) return memoryClientId
  try {
    const stored = window.localStorage.getItem('fs-client-id')
    if (stored) {
      memoryClientId = stored
      return stored
    }
    const id = `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem('fs-client-id', id)
    memoryClientId = id
    return id
  } catch {
    memoryClientId = `c-${Math.random().toString(36).slice(2, 10)}`
    return memoryClientId
  }
}

/**
 * 社区数据源：帖子 / 回复 / 点赞全部走服务端（data/community.json），
 * 同一局域网内所有设备共享；服务不可用时退回演示帖子。
 */
export function useCommunityFeed() {
  const clientId = useMemo(getClientId, [])
  const [snapshot, setSnapshot] = useState<CommunitySnapshot | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    fetchCommunity(controller.signal)
      .then((data) => {
        if (alive) setSnapshot(data)
      })
      .catch(() => {
        /* 服务不可用：仅展示演示帖子 */
      })
    return () => {
      alive = false
      controller.abort()
    }
  }, [])

  const posts = useMemo<PostView[]>(() => {
    const data = snapshot ?? EMPTY_SNAPSHOT
    return [...data.posts, ...communityPosts].map((post) => {
      const likedBy = data.likes[post.id] ?? []
      return {
        ...post,
        replies: data.replies[post.id] ?? [],
        likeCount: post.likeBase + likedBy.length,
        liked: likedBy.includes(clientId),
      }
    })
  }, [snapshot, clientId])

  const toggleLike = useCallback(
    async (postId: string) => {
      const { likes } = await toggleCommunityLike({ postId, clientId })
      setSnapshot((prev) => {
        const base = prev ?? EMPTY_SNAPSHOT
        return { ...base, likes: { ...base.likes, [postId]: likes } }
      })
    },
    [clientId],
  )

  const submitReply = useCallback(
    async (postId: string, input: { nickname: string; content: string }) => {
      const { replies } = await createCommunityReply({ postId, ...input })
      setSnapshot((prev) => {
        const base = prev ?? EMPTY_SNAPSHOT
        return { ...base, replies: { ...base.replies, [postId]: replies } }
      })
    },
    [],
  )

  const publishPost = useCallback(
    async (input: {
      nickname: string
      topic: string
      content: string
      kind: PostKind
      images: string[]
    }) => {
      const { post } = await createCommunityPost(input)
      setSnapshot((prev) => {
        const base = prev ?? EMPTY_SNAPSHOT
        return { ...base, posts: [post, ...base.posts] }
      })
      return post
    },
    [],
  )

  return { posts, clientId, toggleLike, submitReply, publishPost }
}
