import type {
  AiStatus,
  RelatedDishesResponse,
  ChatMessage,
  RecipeResponse,
  RecommendInput,
  RecommendResponse,
  VideoPlatform,
  VideoSearchBundle,
} from '../types'
import type { CommunityPost, CommunitySnapshot, PostKind, PostReply } from '../data/community'

async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!response.ok) {
    let message = `请求失败（${response.status}）`
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  return (await response.json()) as T
}

export async function getAiStatus(): Promise<AiStatus> {
  try {
    const response = await fetch('/api/status')
    if (!response.ok) throw new Error('status failed')
    return (await response.json()) as AiStatus
  } catch {
    return { ai: 'demo', model: null }
  }
}

/**
 * 通用 SSE 流式对话客户端：/api/chat（角色）与 /api/pet-chat（小精灵）共用。
 * 返回是否处于演示模式。
 */
async function streamSseChat(
  path: string,
  body: unknown,
  options: { onDelta: (text: string) => void; signal?: AbortSignal },
): Promise<{ demo: boolean }> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options.signal,
  })

  if (!response.ok || !response.body) {
    let message = `连接失败（${response.status}）`
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let demo = false

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const line = frame.trim()
      if (!line.startsWith('data:')) continue
      try {
        const payload = JSON.parse(line.slice(5).trim())
        if (payload.type === 'delta' && typeof payload.text === 'string') {
          options.onDelta(payload.text)
        } else if (payload.type === 'done') {
          demo = Boolean(payload.demo)
        } else if (payload.type === 'error') {
          throw new Error(payload.message || '对话中断')
        }
      } catch (error) {
        if (error instanceof SyntaxError) continue
        throw error
      }
    }
  }

  return { demo }
}

/** 角色多轮对话（流式）。返回是否处于演示模式。 */
export function chatWithCharacter(options: {
  characterId: string
  /** 可选的菜品上下文（来自菜品图鉴详情页）；服务端会校验这道菜是否属于该角色 */
  dishId?: string
  messages: ChatMessage[]
  onDelta: (text: string) => void
  signal?: AbortSignal
}): Promise<{ demo: boolean }> {
  return streamSseChat(
    '/api/chat',
    { characterId: options.characterId, dishId: options.dishId, messages: options.messages },
    options,
  )
}

/**
 * 菜系专属对话（流式）：请求携带 cuisineId，
 * 服务端校验是否为八大菜系之一，并选择该菜系的系统提示词。返回是否处于演示模式。
 */
export function chatWithCuisine(options: {
  cuisineId: string
  /** 可选的菜品上下文（来自菜品图鉴详情页）；服务端会校验这道菜是否属于该菜系 */
  dishId?: string
  messages: ChatMessage[]
  onDelta: (text: string) => void
  signal?: AbortSignal
}): Promise<{ demo: boolean }> {
  return streamSseChat(
    '/api/cuisine-chat',
    { cuisineId: options.cuisineId, dishId: options.dishId, messages: options.messages },
    options,
  )
}

/**
 * 口味专属对话（流式）：请求携带 tasteId，
 * 服务端校验是否为八种口味之一，并选择该口味的系统提示词。
 * tasteId 只用于口味人格，服务端不会把它当作 cuisineId / characterId。返回是否处于演示模式。
 */
export function chatWithTaste(options: {
  tasteId: string
  /** 可选的菜品上下文（只有该口味的代表菜才会被服务端注入） */
  dishId?: string
  messages: ChatMessage[]
  onDelta: (text: string) => void
  signal?: AbortSignal
}): Promise<{ demo: boolean }> {
  return streamSseChat(
    '/api/taste-chat',
    { tasteId: options.tasteId, dishId: options.dishId, messages: options.messages },
    options,
  )
}

/** 首页美食小精灵：通用助手（无角色人格，SSE 流式）。返回是否处于演示模式。 */
export function chatWithPet(options: {
  messages: ChatMessage[]
  onDelta: (text: string) => void
  signal?: AbortSignal
}): Promise<{ demo: boolean }> {
  return streamSseChat('/api/pet-chat', { messages: options.messages }, options)
}

export function generateRecipe(
  input: {
    dish: string
    ingredients: string
    servings: number
    minutes: number
    spicy: string
    equipment: string
    note: string
  },
  signal?: AbortSignal,
): Promise<RecipeResponse> {
  return postJson<RecipeResponse>('/api/recipe', input, signal)
}

export function recommendDishes(
  input: RecommendInput,
  signal?: AbortSignal,
): Promise<RecommendResponse> {
  return postJson<RecommendResponse>('/api/recommend', input, signal)
}

export function getRelatedDishes(characterId: string, signal?: AbortSignal): Promise<RelatedDishesResponse> {
  return postJson<RelatedDishesResponse>('/api/related-dishes', { characterId }, signal)
}

/**
 * 做菜视频搜索：服务端真实检索 B 站等平台并返回可点击结果 + 平台搜索入口。
 * 结果全部来自真实检索（或平台官方搜索页），与 AI 生成文本严格分离。
 */
export function searchCookingVideos(
  input: {
    text: string
    contextCharacterId?: string
    contextCuisineId?: string
    contextTasteId?: string
    platforms?: VideoPlatform[]
    limit?: number
  },
  signal?: AbortSignal,
): Promise<VideoSearchBundle> {
  return postJson<VideoSearchBundle>('/api/videos/search', input, signal)
}

/* ------------------------------ 社区（服务端存储） ------------------------------ */

/** 拉取社区快照：用户帖子 + 回复表 + 点赞表 */
export async function fetchCommunity(signal?: AbortSignal): Promise<CommunitySnapshot> {
  const response = await fetch('/api/community', { signal })
  if (!response.ok) throw new Error(`社区数据加载失败（${response.status}）`)
  return (await response.json()) as CommunitySnapshot
}

export function createCommunityPost(input: {
  nickname: string
  topic: string
  content: string
  kind: PostKind
  images: string[]
}): Promise<{ post: CommunityPost }> {
  return postJson<{ post: CommunityPost }>('/api/community/posts', input)
}

/** 发表回复，返回该帖更新后的完整回复列表 */
export function createCommunityReply(input: {
  postId: string
  nickname: string
  content: string
}): Promise<{ replies: PostReply[] }> {
  return postJson<{ replies: PostReply[] }>('/api/community/replies', input)
}

/** 切换点赞，返回该帖更新后的客户端 id 列表 */
export function toggleCommunityLike(input: {
  postId: string
  clientId: string
}): Promise<{ likes: string[] }> {
  return postJson<{ likes: string[] }>('/api/community/likes', input)
}

/** 把用户照片压到长边 1600px 的 JPEG，减少上传体积 */
export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('请选择图片文件')
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('这张图读不出来（HEIC 等格式请先转成 JPG）')
  }
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('浏览器不支持图片处理')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()
  return canvas.toDataURL('image/jpeg', quality)
}

export type UploadResult = { url: string; preview: string; bytes?: number }

/** 上传用户照片，返回可持久引用的 URL */
export async function uploadPhoto(file: File): Promise<UploadResult> {
  const preview = await compressImage(file)
  const result = await postJson<{ url: string; bytes: number }>('/api/upload', { data: preview })
  return { url: result.url, preview, bytes: result.bytes }
}
