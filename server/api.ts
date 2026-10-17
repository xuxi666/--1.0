/**
 * 食有灵 · AI 服务层（服务端）
 * ------------------------------------------------------------
 * 作为 Vite 中间件运行，同时服务 dev 与 preview：
 *   GET  /api/status          -> AI 是否已接入
 *   POST /api/chat            -> 角色多轮对话（SSE 流式）
 *   POST /api/pet-chat        -> 首页美食小精灵：通用助手（SSE 流式，无角色人格）
 *   POST /api/recipe          -> 结构化菜谱（服务端解析 + 校验）
 *   POST /api/recommend       -> 先筛库、再打分、最后让 AI 写推荐理由
 *   POST /api/related-dishes  -> 聊天页「相关菜品」（AI 从菜品库挑选 + 写理由）
 *   GET  /api/community       -> 社区快照（用户帖子 + 回复表 + 点赞表）
 *   POST /api/community/posts   -> 发帖（存 data/community.json，局域网内同步）
 *   POST /api/community/replies -> 回复
 *   POST /api/community/likes   -> 点赞切换
 *
 * API Key 只存在于服务端环境变量 ZHIPU_API_KEY，永不下发到浏览器。
 * 没有 Key 时返回 demo:true 的演示数据，并在前端明确标注。
 */

import fs from 'node:fs'
import nodePath from 'node:path'
import { characterMap } from '../src/data/characters'
import { dishDatabase, type Dish } from '../src/data/dishes'
import {
  avatarColorFor,
  communityPosts,
  initialOf,
  type CommunityPost,
  type PostKind,
  type PostReply,
} from '../src/data/community'
import type { Recipe, RecipeIngredient, RecipeStep } from '../src/types'

type Env = Record<string, string | undefined>
type Req = any
type Res = any

const ZHIPU_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

/** 用户上传的照片落盘目录（dev 与 preview 都由中间件直接提供） */
const UPLOAD_DIR = nodePath.join(process.cwd(), 'public', 'uploads')
const UPLOAD_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/* ---------------------- 社区数据（服务端持久化，局域网同步） ---------------------- */

/** 社区数据文件：发帖 / 回复 / 点赞统一存这里，同一局域网内所有设备可见 */
const COMMUNITY_FILE = nodePath.join(process.cwd(), 'data', 'community.json')
const POST_KINDS: PostKind[] = ['讨论', '菜谱分享', '提问', '角色话题']
/** 用户帖子只允许引用站内图片 */
const IMAGE_PATH_RE = /^(?:\/uploads\/[A-Za-z0-9._-]+|\/images\/photos\/[%A-Za-z0-9._-]+\.jpg)$/

type StoredPost = Omit<CommunityPost, 'likeBase' | 'kind'> & { likeBase: number; kind: PostKind }
type StoredReply = PostReply
type CommunityStore = {
  posts: StoredPost[]
  replies: Record<string, StoredReply[]>
  likes: Record<string, string[]>
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function makeReply(nickname: string, content: string, minutesAgo: number): StoredReply {
  return {
    id: makeId('r'),
    nickname,
    avatarColor: avatarColorFor(nickname),
    initial: initialOf(nickname),
    content,
    createdAt: Date.now() - minutesAgo * 60_000,
  }
}

/** 首次运行时写入的示例回复，让回复功能开箱可见（与演示帖子同一批虚构居民） */
function seedStore(): CommunityStore {
  return {
    posts: [],
    replies: {
      p1: [
        makeReply('一勺豆瓣', '焯水这步真的救命，我也试了 40 秒淡盐水，豆腐完整多了。', 9),
        makeReply('林小满', '它嘴硬但心软，你问它别的，它也会认真答。', 4),
      ],
      p2: [makeReply('火锅局召集人', '第三次亮油这招我学到了，盘底终于不出水了。', 25)],
      p7: [makeReply('面食控小张', '“汤浑了只有一个理由：火大了”，这句得裱起来。', 300)],
    },
    likes: {},
  }
}

function writeStore(store: CommunityStore) {
  fs.mkdirSync(nodePath.dirname(COMMUNITY_FILE), { recursive: true })
  fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(store, null, 2))
}

function readStore(): CommunityStore {
  try {
    const raw = JSON.parse(fs.readFileSync(COMMUNITY_FILE, 'utf8')) as Partial<CommunityStore>
    return {
      posts: Array.isArray(raw?.posts) ? (raw.posts as StoredPost[]) : [],
      replies: raw?.replies && typeof raw.replies === 'object' ? raw.replies : {},
      likes: raw?.likes && typeof raw.likes === 'object' ? raw.likes : {},
    }
  } catch {
    const store = seedStore()
    writeStore(store)
    return store
  }
}

/** 帖子可以是服务端用户帖，也可以是内置演示帖（p1..p9） */
function postExists(store: CommunityStore, postId: string) {
  return store.posts.some((post) => post.id === postId) || communityPosts.some((post) => post.id === postId)
}

/* ------------------------------- 工具 ------------------------------- */

function readBody(req: Req, maxBytes = 1_000_000): Promise<any> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > maxBytes) {
        reject(new Error('payload too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('invalid json'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: Res, status: number, payload: unknown) {
  const body = JSON.stringify(payload)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(body)
}

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

/* --------------------------- 智谱 AI 调用 --------------------------- */

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function zhipuConfig(env: Env) {
  const apiKey = env.ZHIPU_API_KEY?.trim()
  const model = env.ZHIPU_MODEL?.trim() || 'glm-4-flash'
  return { apiKey, model, enabled: Boolean(apiKey) }
}

/**
 * 统一的智谱调用：始终以流式读取（长 JSON 输出更稳，不会因空闲被网关掐断），
 * 传入 onDelta 时边收边回调，否则在结束后返回完整文本。
 */
async function requestZhipu(
  env: Env,
  messages: ChatMessage[],
  opts: {
    temperature?: number
    json?: boolean
    timeoutMs?: number
    onDelta?: (text: string) => void
  } = {},
): Promise<string> {
  const { apiKey, model } = zhipuConfig(env)
  if (!apiKey) throw new Error('ZHIPU_API_KEY missing')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 90000)

  try {
    const response = await fetch(ZHIPU_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.8,
        stream: true,
        ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    })

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => '')
      throw new Error(`zhipu ${response.status}: ${text.slice(0, 300)}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let full = ''

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const parsed = JSON.parse(payload)
          const delta = parsed?.choices?.[0]?.delta?.content
          if (typeof delta === 'string' && delta) {
            full += delta
            opts.onDelta?.(delta)
          }
        } catch {
          /* 忽略心跳/无法解析的分片 */
        }
      }
    }

    if (!full.trim()) throw new Error('empty completion')
    return full
  } finally {
    clearTimeout(timer)
  }
}

function callZhipu(
  env: Env,
  messages: ChatMessage[],
  opts: { temperature?: number; json?: boolean; timeoutMs?: number } = {},
): Promise<string> {
  return requestZhipu(env, messages, opts)
}

function streamZhipu(
  env: Env,
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  opts: { temperature?: number; timeoutMs?: number } = {},
): Promise<string> {
  return requestZhipu(env, messages, { ...opts, onDelta })
}

/* ---------------------------- 菜谱校验 ---------------------------- */

const DIFFICULTIES = ['简单', '中等', '进阶'] as const

function toNumber(value: unknown, fallback: number, min = 0, max = 9999): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function toText(value: unknown, max = 400): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/** 服务端严格校验：模型返回的结构不合法时直接抛错，由调用方降级 */
export function normalizeRecipe(raw: unknown, servings: number): Recipe {
  if (!raw || typeof raw !== 'object') throw new Error('recipe: not an object')
  const r = raw as Record<string, unknown>

  const title = toText(r.title, 60)
  if (!title) throw new Error('recipe: missing title')

  const ingredientsRaw = Array.isArray(r.ingredients) ? r.ingredients : []
  const ingredients: RecipeIngredient[] = ingredientsRaw
    .map((item) => {
      const it = (item ?? {}) as Record<string, unknown>
      const name = toText(it.name, 40)
      const amount = toNumber(it.amount, 0, 0, 100000)
      const unit = toText(it.unit, 12) || '克'
      if (!name || amount <= 0) return null
      const note = toText(it.note, 40)
      return { name, amount, unit, ...(note ? { note } : {}) }
    })
    .filter(Boolean) as RecipeIngredient[]
  if (ingredients.length < 2) throw new Error('recipe: ingredients insufficient')

  const stepsRaw = Array.isArray(r.steps) ? r.steps : []
  const steps: RecipeStep[] = stepsRaw
    .map((item, index) => {
      const st = (item ?? {}) as Record<string, unknown>
      const action = toText(st.action, 300)
      if (!action) return null
      const heat = toText(st.heat, 24)
      const tip = toText(st.tip, 120)
      const minutes = st.minutes === undefined ? undefined : toNumber(st.minutes, 0, 0, 600)
      return {
        order: index + 1,
        action,
        ...(heat ? { heat } : {}),
        ...(minutes ? { minutes } : {}),
        ...(tip ? { tip } : {}),
      }
    })
    .filter(Boolean) as RecipeStep[]
  if (steps.length < 2) throw new Error('recipe: steps insufficient')

  const difficultyRaw = toText(r.difficulty, 8)
  const difficulty = (DIFFICULTIES as readonly string[]).includes(difficultyRaw)
    ? (difficultyRaw as Recipe['difficulty'])
    : '中等'

  const stringList = (value: unknown, max: number): string[] =>
    (Array.isArray(value) ? value : [])
      .map((v) => toText(v, 160))
      .filter(Boolean)
      .slice(0, max)

  return {
    title,
    servings: toNumber(r.servings, servings, 1, 12),
    prepMinutes: toNumber(r.prepMinutes, 10, 0, 600),
    cookMinutes: toNumber(r.cookMinutes, 20, 0, 600),
    difficulty,
    flavor: toText(r.flavor, 40) || '家常',
    ingredients,
    steps,
    tips: stringList(r.tips, 5),
    substitutions: stringList(r.substitutions, 4),
    allergens: stringList(r.allergens, 6).map((item) => item.split(/[（(]/)[0].trim()).filter(Boolean),
  }
}

/* -------------------------- 演示用菜谱 -------------------------- */

/** 常见食材的合理用量，让演示菜谱不至于只有“1 份” */
const AMOUNT_HINTS: Record<string, { amount: number; unit: string }> = {
  嫩豆腐: { amount: 400, unit: '克' },
  豆腐: { amount: 400, unit: '克' },
  牛肉末: { amount: 100, unit: '克' },
  猪肉馅: { amount: 250, unit: '克' },
  五花肉: { amount: 600, unit: '克' },
  咸肉: { amount: 150, unit: '克' },
  鸡腿肉: { amount: 400, unit: '克' },
  鸡胸: { amount: 300, unit: '克' },
  羊肉: { amount: 400, unit: '克' },
  草鱼: { amount: 700, unit: '克' },
  黑鱼片: { amount: 400, unit: '克' },
  鲈鱼: { amount: 600, unit: '克' },
  河虾仁: { amount: 250, unit: '克' },
  三黄鸡: { amount: 900, unit: '克' },
  鸭腿: { amount: 500, unit: '克' },
  郫县豆瓣: { amount: 25, unit: '克' },
  花椒: { amount: 3, unit: '克' },
  干辣椒: { amount: 12, unit: '克' },
  黄酒: { amount: 200, unit: '毫升' },
  生抽: { amount: 30, unit: '毫升' },
  老抽: { amount: 10, unit: '毫升' },
  冰糖: { amount: 40, unit: '克' },
  番茄: { amount: 300, unit: '克' },
  鸡蛋: { amount: 3, unit: '个' },
  面条: { amount: 200, unit: '克' },
  中筋面粉: { amount: 300, unit: '克' },
  高筋面粉: { amount: 300, unit: '克' },
  糯米粉: { amount: 200, unit: '克' },
  黑芝麻: { amount: 60, unit: '克' },
  小葱: { amount: 20, unit: '克' },
  蒜: { amount: 15, unit: '克' },
  姜: { amount: 15, unit: '克' },
  青菜: { amount: 250, unit: '克' },
  豆苗: { amount: 200, unit: '克' },
  生菜: { amount: 150, unit: '克' },
  酸菜: { amount: 200, unit: '克' },
  春笋: { amount: 250, unit: '克' },
  长茄: { amount: 350, unit: '克' },
  豆芽: { amount: 200, unit: '克' },
  萝卜: { amount: 200, unit: '克' },
  米饭: { amount: 300, unit: '克' },
  丝苗米: { amount: 200, unit: '克' },
  腊肠: { amount: 100, unit: '克' },
  牛腱: { amount: 500, unit: '克' },
  水牛奶: { amount: 400, unit: '毫升' },
  红豆: { amount: 150, unit: '克' },
  甜面酱: { amount: 40, unit: '克' },
  皮冻: { amount: 150, unit: '克' },
  米线: { amount: 200, unit: '克' },
  红薯粉: { amount: 150, unit: '克' },
  馍: { amount: 2, unit: '个' },
  臭豆腐: { amount: 8, unit: '块' },
  食用油: { amount: 40, unit: '毫升' },
  猪油: { amount: 20, unit: '克' },
  盐: { amount: 4, unit: '克' },
  糖: { amount: 15, unit: '克' },
}

function hintFor(name: string) {
  if (AMOUNT_HINTS[name]) return AMOUNT_HINTS[name]
  const key = Object.keys(AMOUNT_HINTS).find((k) => name.includes(k) || k.includes(name))
  return key ? AMOUNT_HINTS[key] : { amount: 200, unit: '克' }
}

function demoRecipe(input: any): Recipe {
  const dishName: string = toText(input?.dish, 40) || '番茄炒蛋'
  const servings = toNumber(input?.servings, 2, 1, 12)
  const minutes = toNumber(input?.minutes, 30, 5, 600)
  const known = dishDatabase.find((d) => dishName.includes(d.name) || d.name.includes(dishName))

  const base: Recipe = {
    title: known ? `${known.name}（演示菜谱）` : `${dishName}（演示菜谱）`,
    servings,
    prepMinutes: 10,
    cookMinutes: Math.max(10, Math.min(minutes - 10, 45)),
    difficulty: minutes >= 60 ? '中等' : '简单',
    flavor: known?.flavors.join(' · ') ?? '家常',
    ingredients: (known?.ingredients ?? ['主料', '葱姜蒜', '盐', '食用油']).map((name) => {
      const hint = hintFor(name)
      const scaled = Math.round(hint.amount * (servings / 2) * 10) / 10
      return { name, amount: scaled, unit: hint.unit }
    }),
    steps: [
      { order: 1, action: '所有食材洗净，按入口大小切好，调料提前摆到手边。', heat: '无', minutes: 5 },
      {
        order: 2,
        action: '热锅凉油，先下需要长时间加热的料炒出香味，再放主料。',
        heat: '中火',
        minutes: 3,
        tip: '锅不够热就下料，食材会出水而不是上色。',
      },
      {
        order: 3,
        action: '调味后加少量热水，转中小火让味道进去。',
        heat: '中小火',
        minutes: Math.max(5, Math.round(minutes / 4)),
      },
      {
        order: 4,
        action: '收汁到挂勺，尝一次咸淡，出锅前再补一次香气（葱花/香油）。',
        heat: '大火',
        minutes: 2,
      },
    ],
    tips: [
      '演示菜谱为本地规则生成，未经真实模型推理，仅用于展示交互流程。',
      '盐分两次放：中途定底味，出锅前补足。',
      '食材下锅前尽量擦干，避免油温骤降。',
    ],
    substitutions: ['没有高汤可用热水加少量生抽替代', '不吃辣可去掉辣椒，用白胡椒补香'],
    allergens: known?.allergens ?? [],
  }
  return base
}

/* ------------------------- 推荐：筛选与打分 ------------------------- */

const MOOD_SCENE: Record<string, string> = {
  开心: '朋友聚会',
  疲惫: '加班快手',
  孤单: '一人食',
  想犒劳自己: '待客',
  没胃口: '下饭',
  想清淡: '减脂',
}

/** 口味大类 -> 关键词，用于把菜品风味映射到用户选择的六个方向 */
const FLAVOR_KEYWORDS: Record<string, string[]> = {
  麻辣: ['麻', '辣'],
  鲜香: ['鲜', '本味', '汤', '清'],
  浓香: ['浓', '酱香', '焦香', '腊香', '孜然', '油香', '蒜香', '咸甜'],
  清爽: ['清', '爽', '淡', '减脂'],
  酸香: ['酸'],
  甜润: ['甜', '糯', '奶香'],
}

function flavorHits(dish: Dish, flavors: string[]): string[] {
  const hits: string[] = []
  for (const flavor of flavors) {
    const keywords = FLAVOR_KEYWORDS[flavor] ?? [flavor]
    const hit = dish.flavors.some((f) => keywords.some((k) => f.includes(k) || k.includes(f)))
    if (hit) hits.push(flavor)
  }
  return hits
}

type RecommendInput = {
  mood?: string
  flavors?: string[]
  spicy?: number
  budget?: number
  people?: number
  minutes?: number
  region?: string
  avoid?: string[]
}

export function selectCandidates(input: RecommendInput): Dish[] {
  const spicy = toNumber(input.spicy, 2, 0, 3)
  const budget = toNumber(input.budget, 60, 5, 500)
  const minutes = toNumber(input.minutes, 60, 5, 600)
  const people = toNumber(input.people, 2, 1, 12)
  const region = toText(input.region, 20)
  const avoid = (input.avoid ?? []).map((a) => a.trim()).filter(Boolean)
  const flavors = (input.flavors ?? []).map((f) => f.trim()).filter(Boolean)
  const scene = MOOD_SCENE[toText(input.mood, 12)] ?? ''

  const scored = dishDatabase
    .filter((d) => d.spicy <= spicy)
    .filter((d) => d.minutes <= Math.max(minutes, 15))
    .filter((d) => d.price <= budget)
    .filter((d) => (avoid.length ? !d.allergens.some((a) => avoid.includes(a)) : true))
    .filter((d) => (avoid.length ? !avoid.some((a) => d.ingredients.some((i) => i.includes(a))) : true))
    .filter((d) => (region && region !== '不限' ? d.region === region || d.region === '全国' : true))
    .map((d) => {
      let score = 0
      const matched: string[] = []
      if (flavors.length) {
        const hit = flavorHits(d, flavors)
        if (hit.length) {
          score += hit.length * 6
          matched.push(...hit)
        } else {
          score -= 5
        }
      }
      if (scene && d.scenes.includes(scene)) {
        score += 3
        matched.push(scene)
      }
      if (people >= 4 && d.scenes.includes('朋友聚会')) score += 2
      if (people === 1 && d.scenes.includes('一人食')) score += 2
      // 时间越贴合越高分
      score += Math.max(0, 2 - Math.abs(d.minutes - Math.min(minutes, 90)) / 45)
      // 预算利用率（更接近预算的菜更像“想吃的”）
      score += Math.max(0, 1.5 - Math.abs(budget - d.price * people) / (budget + 1))
      // 稳定伪随机，保证每次结果不呆板但可复现
      const seed = [...d.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
      score += ((seed * 37) % 100) / 100
      return { dish: d, score, matched, flavorMatched: flavors.length ? flavorHits(d, flavors).length > 0 : true }
    })
    .sort((a, b) => b.score - a.score)

  // 口味匹配足够多时，只在匹配集合里选，避免“麻辣”推荐出葱油拌面
  const flavorMatched = scored.filter((item) => item.flavorMatched)
  const pool = flavors.length && flavorMatched.length >= 3 ? flavorMatched : scored

  const picked = pool.slice(0, Math.min(4, Math.max(3, pool.length)))
  if (picked.length < 3) {
    // 条件过严时补足，但绝不编造菜品
    const rest = dishDatabase.filter((d) => !picked.some((p) => p.dish.id === d.id))
    while (picked.length < 3 && rest.length) {
      const next = rest.shift()!
      picked.push({ dish: next, score: 0, matched: [], flavorMatched: false })
    }
  }
  return picked.map((p) => p.dish)
}

function demoReason(dish: Dish, input: RecommendInput): string {
  const parts: string[] = []
  const people = toNumber(input.people, 2, 1, 12)
  const spicy = toNumber(input.spicy, 2, 0, 3)
  const minutes = toNumber(input.minutes, 60, 5, 600)
  const hits = flavorHits(dish, input.flavors ?? [])
  if (hits.length) parts.push(`口味对上你要的${hits.join('、')}`)
  if (dish.spicy <= spicy) parts.push(`辣度 ${dish.spicy}/3 在你可接受范围内`)
  if (dish.minutes <= minutes) parts.push(`${dish.minutes} 分钟能上桌`)
  if (dish.price * people <= toNumber(input.budget, 60, 5, 500)) parts.push(`人均约 ¥${dish.price}，在预算内`)
  if (input.mood) parts.push(`适合你现在的状态：${input.mood}`)
  // 按菜品 id 轮换理由侧重点，避免所有卡片都是同一句话
  const seed = [...dish.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const start = parts.length ? seed % parts.length : 0
  const picked = [parts[start], parts[(start + 1) % Math.max(1, parts.length)]].filter(Boolean)
  const head = picked.length ? picked.join('，') : '与你的口味画像吻合'
  return `${head}。${dish.desc}`
}

/* ------------------------------ 路由 ------------------------------ */

const DEMO_NOTICE =
  '【演示模式 · 尚未接入智谱 AI】以下内容由本地规则生成，用于展示交互流程，不是真实模型回复。'

/**
 * 首页美食小精灵的系统提示词（通用助手，无固定美食人格）。
 * 只存在于服务端，前端不能传入或覆盖 system 角色。
 */
const PET_SYSTEM_PROMPT = [
  '你是食有灵 FOOD SOUL 的美食小精灵，一个轻松、自然、友好的美食助手。',
  '你没有固定的美食人格，不代表某一道具体菜品，也不需要刻意模仿某种口味或角色。',
  '你可以与用户聊中国美食、家常菜、食材搭配、烹饪技巧、饮食文化，以及日常生活中的轻松话题。',
  '回答应自然、简洁、有帮助，通常优先控制在 1 至 4 句话。',
  '用户询问菜谱时，先给出实用简要建议；如果用户需要完整菜谱，可以引导其使用网站的菜谱生成功能。',
  '用户询问今天吃什么时，可以结合已有菜品库给出合理建议。',
  '不要声称自己真的有身体、正在吃饭或具有真实人类经历。不要编造菜品库中不存在的系统功能。',
  '涉及过敏原、食品安全或食材是否可食用时，应谨慎回答。',
].join('\n')

export function createApiMiddleware(env: Env) {
  return async function apiMiddleware(req: Req, res: Res, next: () => void) {
    const url: string = req.url || ''
    if (!url.startsWith('/api/') && !url.startsWith('/uploads/')) return next()

    const path = url.split('?')[0]
    const { enabled, model } = zhipuConfig(env)

    if (path === '/api/status' && req.method === 'GET') {
      return sendJson(res, 200, { ai: enabled ? 'live' : 'demo', model: enabled ? model : null })
    }

    /* ---------------- 用户上传的照片 ---------------- */
    if (path.startsWith('/uploads/') && req.method === 'GET') {
      const name = nodePath.basename(decodeURIComponent(path.slice('/uploads/'.length)))
      const file = nodePath.join(UPLOAD_DIR, name)
      if (!name || !fs.existsSync(file)) return sendJson(res, 404, { error: 'not found' })
      res.statusCode = 200
      res.setHeader('Content-Type', UPLOAD_MIME[nodePath.extname(name).toLowerCase()] ?? 'application/octet-stream')
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      fs.createReadStream(file).pipe(res)
      return
    }

    if (path === '/api/upload' && req.method === 'POST') {
      const body = await readBody(req, 12_000_000)
      const data = typeof body?.data === 'string' ? body.data : ''
      const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(data)
      if (!match) return sendJson(res, 400, { error: '只支持 JPG / PNG / WebP 图片' })

      const buffer = Buffer.from(match[2], 'base64')
      if (buffer.length < 512) return sendJson(res, 400, { error: '图片无效' })
      if (buffer.length > 6_000_000) return sendJson(res, 413, { error: '图片超过 6MB，请压缩后再上传' })

      const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
      const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
      fs.writeFileSync(nodePath.join(UPLOAD_DIR, filename), buffer)
      return sendJson(res, 200, { url: `/uploads/${filename}`, bytes: buffer.length })
    }

    try {
      /* ---------------- 角色对话（流式） ---------------- */
      if (path === '/api/chat' && req.method === 'POST') {
        const body = await readBody(req)
        const character = characterMap[toText(body.characterId, 40)]
        if (!character) return sendJson(res, 400, { error: 'unknown character' })

        const history: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : [])
          .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
          .map((m: any) => ({
            role: m.role,
            content: toText(m.content, 2000),
          }))
          .filter((m: ChatMessage) => m.content)
          .slice(-12)

        if (!history.length) return sendJson(res, 400, { error: 'empty messages' })

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache, no-transform')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')

        const write = (payload: unknown) => res.write(`data: ${JSON.stringify(payload)}\n\n`)

        if (!enabled) {
          // 演示模式：明确标注，不伪装成真实模型
          const lastUser = [...history].reverse().find((m) => m.role === 'user')?.content ?? ''
          const demo = [
            `${DEMO_NOTICE}`,
            '',
            `我是${character.name}。${character.quote}`,
            '',
            `你问的是「${lastUser.slice(0, 60)}」。`,
            `按我的性子，我会先告诉你：${character.examples[0]}`,
            `我能聊的范围是：${character.knowledge.slice(0, 3).join('、')}。`,
            '',
            `在服务端配置 ZHIPU_API_KEY 之后，我会用完整的角色人格、多轮上下文和真实知识回答你，而不是这段固定文本。`,
          ].join('\n')
          for (const chunk of demo.match(/[\s\S]{1,12}/g) ?? []) {
            write({ type: 'delta', text: chunk })
            await new Promise((r) => setTimeout(r, 18))
          }
          write({ type: 'done', demo: true })
          return res.end()
        }

        try {
          await streamZhipu(
            env,
            [{ role: 'system', content: character.systemPrompt }, ...history],
            (text) => write({ type: 'delta', text }),
          )
          write({ type: 'done', demo: false })
          res.end()
        } catch (error: any) {
          const message = String(error?.message ?? error)
          write({
            type: 'error',
            message: message.includes('429')
              ? '请求太频繁了，缓一分钟再来找我。'
              : message.includes('abort')
                ? '这次回答超时了，要不要再问一次？'
                : '我这会儿没接上话，请稍后再试。',
          })
          res.end()
        }
        return
      }

      /* ---------------- 首页美食小精灵（通用助手，无角色人格） ---------------- */
      if (path === '/api/pet-chat' && req.method === 'POST') {
        const body = await readBody(req) // 默认 1MB 请求体上限
        // 只接受 user / assistant 两种角色；system 一律由服务端注入，前端传入会被过滤
        const history: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : [])
          .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
          .map((m: any) => ({
            role: m.role as 'user' | 'assistant',
            content: toText(m.content, 2000),
          }))
          .filter((m: ChatMessage) => m.content)
          .slice(-10) // 只带最近 10 条，避免上下文无限增长

        if (!history.length || history[history.length - 1].role !== 'user') {
          return sendJson(res, 400, { error: 'messages 需要以最后一条用户消息结尾' })
        }

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache, no-transform')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')

        const write = (payload: unknown) => res.write(`data: ${JSON.stringify(payload)}\n\n`)

        if (!enabled) {
          // 演示模式：明确标注，不伪装成真实模型
          const lastUser = history[history.length - 1].content
          const demo = [
            `${DEMO_NOTICE}`,
            '',
            `你问的是「${lastUser.slice(0, 60)}」。`,
            '我是首页的美食小精灵：可以聊家常菜、食材搭配、烹饪技巧和饮食文化。',
            '想认真做一道菜，可以用本站的「AI 菜谱」；拿不定主意吃什么，可以试试「智能推荐」。',
            '',
            '在服务端配置 ZHIPU_API_KEY 之后，我会结合上下文用真实模型回答你，而不是这段固定文本。',
          ].join('\n')
          for (const chunk of demo.match(/[\s\S]{1,12}/g) ?? []) {
            write({ type: 'delta', text: chunk })
            await new Promise((r) => setTimeout(r, 18))
          }
          write({ type: 'done', demo: true })
          return res.end()
        }

        try {
          await streamZhipu(env, [{ role: 'system', content: PET_SYSTEM_PROMPT }, ...history], (text) =>
            write({ type: 'delta', text }),
          )
          write({ type: 'done', demo: false })
          res.end()
        } catch (error: any) {
          const message = String(error?.message ?? error)
          write({
            type: 'error',
            message: message.includes('429')
              ? '请求太频繁了，稍等一下再来聊。'
              : message.includes('abort')
                ? '这次回答超时了，要不要再问一次？'
                : '小精灵这边没接上话，请稍后再试。',
          })
          res.end()
        }
        return
      }

      /* ---------------- 结构化菜谱 ---------------- */
      if (path === '/api/recipe' && req.method === 'POST') {
        const body = await readBody(req)
        const servings = toNumber(body.servings, 2, 1, 12)
        const request = {
          dish: toText(body.dish, 60),
          ingredients: toText(body.ingredients, 300),
          servings,
          minutes: toNumber(body.minutes, 40, 5, 600),
          spicy: toText(body.spicy, 12),
          equipment: toText(body.equipment, 60),
          note: toText(body.note, 200),
        }
        if (!request.dish && !request.ingredients) {
          return sendJson(res, 400, { error: '请至少填写想做的菜或现有食材' })
        }

        if (!enabled) {
          return sendJson(res, 200, { demo: true, recipe: demoRecipe(request), model: null })
        }

        const prompt = [
          `请为一位家庭厨师生成一份可执行的中文菜谱，严格输出 JSON，不要任何解释文字。`,
          `需求：`,
          `- 想做的菜：${request.dish || '（未指定，请根据现有食材决定）'}`,
          `- 现有食材：${request.ingredients || '（未指定）'}`,
          `- 用餐人数：${request.servings}`,
          `- 可用总时间：${request.minutes} 分钟`,
          `- 辣度/口味偏好：${request.spicy || '不限'}`,
          `- 烹饪设备：${request.equipment || '家用燃气灶 + 炒锅'}`,
          `- 补充要求：${request.note || '无'}`,
          ``,
          `JSON 结构：`,
          `{"title":string,"servings":number,"prepMinutes":number,"cookMinutes":number,`,
          `"difficulty":"简单"|"中等"|"进阶","flavor":string,`,
          `"ingredients":[{"name":string,"amount":number,"unit":string,"note":string}],`,
          `"steps":[{"action":string,"heat":string,"minutes":number,"tip":string}],`,
          `"tips":[string],"substitutions":[string],"allergens":[string]}`,
          ``,
          `硬性要求：`,
          `1. ingredients 必须同时包含两组：主料（用户提供的食材${request.ingredients ? `：${request.ingredients}` : '，未提供则按这道菜的常规主料'}）与全部必需调味料（食用油、盐、生抽、姜葱蒜、料酒等），按 ${request.servings} 人份给出数字用量与单位。`,
          `2. steps 5-8 步；每步 action 写清“做什么 + 到什么状态算对”（如“糖色炒到枣红起小泡”），15-60 字，不要只写菜名；每步都要填 heat 与 minutes（装盘步骤写 heat:"无"、minutes:1）。`,
          `3. 时间必须符合真实烹饪：炖煮、卤、烤等无法压缩的工序要写足时长；若超过 ${request.minutes} 分钟，用高压锅等方式加速并在 tips 中说明。`,
          `4. 总量控制在 ${request.minutes} 分钟以内，tips 2-3 条，substitutions 1-2 条，allergens 列出常见过敏原。`,
        ].join('\n')

        // 模型偶发输出非法 JSON，重试一次再降级
        let lastError: unknown = null
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const text = await callZhipu(
              env,
              [
                { role: 'system', content: '你是严谨的中餐厨师，只输出合法 JSON，不要输出任何解释或代码块标记。' },
                { role: 'user', content: attempt === 0 ? prompt : `${prompt}\n\n注意：上一次输出不是合法 JSON，请务必只输出一个完整的 JSON 对象。` },
              ],
              { temperature: attempt === 0 ? 0.4 : 0.2, json: true, timeoutMs: 120000 },
            )
            const parsed = extractJson(text)
            if (!parsed || typeof parsed !== 'object') {
              throw new Error(`recipe: unparsable output (${text.length} chars)`)
            }
            const recipe = normalizeRecipe(parsed, servings)
            return sendJson(res, 200, { demo: false, recipe, model })
          } catch (error) {
            lastError = error
          }
        }

        // 两次都失败：返回演示菜谱，但明确标记 demo
        return sendJson(res, 200, {
          demo: true,
          recipe: demoRecipe(request),
          model,
          error: String((lastError as any)?.message ?? lastError).slice(0, 160),
        })
      }

      /* ---------------- 个性化推荐 ---------------- */
      if (path === '/api/recommend' && req.method === 'POST') {
        const body = await readBody(req)
        const input: RecommendInput = {
          mood: toText(body.mood, 20),
          flavors: Array.isArray(body.flavors) ? body.flavors.slice(0, 5).map((f: any) => toText(f, 12)) : [],
          spicy: toNumber(body.spicy, 2, 0, 3),
          budget: toNumber(body.budget, 60, 5, 500),
          people: toNumber(body.people, 2, 1, 12),
          minutes: toNumber(body.minutes, 60, 5, 600),
          region: toText(body.region, 20),
          avoid: Array.isArray(body.avoid) ? body.avoid.slice(0, 8).map((a: any) => toText(a, 12)) : [],
        }

        const candidates = selectCandidates(input)
        if (!enabled) {
          return sendJson(res, 200, {
            demo: true,
            model: null,
            results: candidates.map((dish) => ({
              id: dish.id,
              name: dish.name,
              reason: demoReason(dish, input),
            })),
          })
        }

        const prompt = [
          `用户画像：心情=${input.mood || '未说明'}；口味=${(input.flavors ?? []).join('、') || '不限'}；`,
          `辣度上限=${input.spicy}/3；预算人均=${input.budget} 元；人数=${input.people}；`,
          `可接受时长=${input.minutes} 分钟；地域=${input.region || '不限'}；忌口=${(input.avoid ?? []).join('、') || '无'}。`,
          ``,
          `只能从下列候选中挑选，禁止新增菜品：`,
          ...candidates.map(
            (d) =>
              `- id:${d.id}｜${d.name}｜辣度${d.spicy}｜${d.minutes}分钟｜人均¥${d.price}｜${d.flavors.join('/')}｜${d.desc}`,
          ),
          ``,
          `为每道候选写一句 30-55 字的推荐理由，必须具体（提到口味、时间、预算或场景之一），不要空话。`,
          `不要编造数字：只在确定准确时才提价格/时间，否则只谈口味与场景。`,
          `严格输出 JSON：{"reasons":[{"id":"菜品id","reason":"理由"}]}`,
        ].join('\n')

        try {
          const text = await callZhipu(
            env,
            [
              { role: 'system', content: '你是克制、具体的中华美食顾问，只输出合法 JSON。' },
              { role: 'user', content: prompt },
            ],
            { temperature: 0.6, json: true, timeoutMs: 60000 },
          )
          const parsed: any = extractJson(text)
          const reasons: Record<string, string> = {}
          if (parsed && Array.isArray(parsed.reasons)) {
            for (const item of parsed.reasons) {
              const id = toText(item?.id, 60)
              const reason = toText(item?.reason, 120)
              if (id && reason && candidates.some((c) => c.id === id)) reasons[id] = reason
            }
          }
          return sendJson(res, 200, {
            demo: false,
            model,
            results: candidates.map((dish) => ({
              id: dish.id,
              name: dish.name,
              reason: reasons[dish.id] ?? demoReason(dish, input),
            })),
          })
        } catch (error: any) {
          return sendJson(res, 200, {
            demo: true,
            model,
            error: String(error?.message ?? error).slice(0, 160),
            results: candidates.map((dish) => ({
              id: dish.id,
              name: dish.name,
              reason: demoReason(dish, input),
            })),
          })
        }
      }

      /* ---------------- 聊天页「相关菜品」 ---------------- */
      if (path === '/api/related-dishes' && req.method === 'POST') {
        const body = await readBody(req)
        const character = characterMap[toText(body.characterId, 40)]
        if (!character) return sendJson(res, 400, { error: 'unknown character' })

        // 同口味的其他菜（不包含角色自己）
        const pool: Dish[] = dishDatabase.filter(
          (d) => d.categoryId === character.categoryId && d.name !== character.name,
        )
        const fallback = pool.slice(0, 4)

        const withMeta = (dish: Dish, reason: string, tag: string) => ({
          name: dish.name,
          reason,
          tag,
          photo: `/images/photos/${encodeURIComponent(dish.name)}.jpg`,
          minutes: dish.minutes,
          price: dish.price,
          emoji: dish.emoji,
        })

        if (!enabled || !pool.length) {
          return sendJson(res, 200, {
            demo: true,
            model: null,
            items: fallback.map((dish) => withMeta(dish, demoReason(dish, {}), '同口味')),
          })
        }

        const prompt = [
          `你是「${character.name}」的对话页推荐位。用户正在和它聊天，右侧要展示 4 道与之相关的菜。`,
          `只能从下列候选里选，不要新增、不要改名：`,
          ...pool.map((d) => `- ${d.name}｜${d.flavors.join('/')}｜${d.minutes}分钟｜人均¥${d.price}｜${d.desc}`),
          ``,
          `为每道菜写：`,
          `- tag：从「同门 / 下饭 / 换口味 / 汤水 / 硬菜 / 收尾」里选一个，不要自创，四个 tag 尽量不重复`,
          `- reason：25-45 字，用第二人称对用户说。主语必须是这道候选菜本身，不要写成「${character.name}」的评价，也不要把两者的特点说反；用第三人称描述，不要用「我们」`,
          `严格输出 JSON：{"items":[{"name":string,"tag":string,"reason":string}]}`,
        ].join('\n')

        try {
          const text = await callZhipu(
            env,
            [
              { role: 'system', content: '你只输出合法 JSON，不输出解释文字。' },
              { role: 'user', content: prompt },
            ],
            { temperature: 0.55, json: true, timeoutMs: 45000 },
          )
          const parsed: any = extractJson(text)
          const rawItems = Array.isArray(parsed?.items) ? parsed.items : []
          const items: ReturnType<typeof withMeta>[] = []

          for (const raw of rawItems) {
            const name = toText((raw as any)?.name, 40)
            const dish = pool.find((d) => d.name === name || name.includes(d.name) || d.name.includes(name))
            if (!dish || items.some((item) => item.name === dish.name)) continue
            items.push(
              withMeta(
                dish,
                toText((raw as any)?.reason, 120) || demoReason(dish, {}),
                toText((raw as any)?.tag, 6) || '相关',
              ),
            )
          }

          for (const dish of fallback) {
            if (items.length >= 4) break
            if (!items.some((item) => item.name === dish.name)) {
              items.push(withMeta(dish, demoReason(dish, {}), '同口味'))
            }
          }

          return sendJson(res, 200, { demo: false, model, items: items.slice(0, 4) })
        } catch (error: any) {
          return sendJson(res, 200, {
            demo: true,
            model,
            error: String(error?.message ?? error).slice(0, 160),
            items: fallback.map((dish) => withMeta(dish, demoReason(dish, {}), '同口味')),
          })
        }
      }

      /* ---------------- 社区：读取快照 ---------------- */
      if (path === '/api/community' && req.method === 'GET') {
        const store = readStore()
        return sendJson(res, 200, {
          posts: store.posts.slice(0, 200),
          replies: store.replies,
          likes: store.likes,
        })
      }

      /* ---------------- 社区：发帖 ---------------- */
      if (path === '/api/community/posts' && req.method === 'POST') {
        const body = await readBody(req)
        const content = toText(body.content, 400)
        if (!content) return sendJson(res, 400, { error: '内容不能为空' })

        const nickname = toText(body.nickname, 16) || '匿名食客'
        const kindRaw = toText(body.kind, 12)
        const kind = (POST_KINDS as string[]).includes(kindRaw) ? (kindRaw as PostKind) : '讨论'
        const images = (Array.isArray(body.images) ? body.images : [])
          .map((item: unknown) => toText(item, 300))
          .filter((item: string) => IMAGE_PATH_RE.test(item))
          .slice(0, 3)
        const characterId = toText(body.characterId, 40)

        const post: StoredPost = {
          id: makeId('p'),
          nickname,
          avatarColor: avatarColorFor(nickname),
          initial: initialOf(nickname),
          createdAt: Date.now(),
          topic: toText(body.topic, 40) || content.slice(0, 18),
          ...(characterMap[characterId] ? { characterId } : {}),
          content,
          likeBase: 0,
          kind,
          badge: '新朋友',
          images,
        }

        const store = readStore()
        store.posts.unshift(post)
        writeStore(store)
        return sendJson(res, 200, { post })
      }

      /* ---------------- 社区：回复 ---------------- */
      if (path === '/api/community/replies' && req.method === 'POST') {
        const body = await readBody(req)
        const postId = toText(body.postId, 80)
        const content = toText(body.content, 200)
        if (!postId || !content) return sendJson(res, 400, { error: '回复内容不能为空' })

        const store = readStore()
        if (!postExists(store, postId)) return sendJson(res, 404, { error: '帖子不存在' })

        const nickname = toText(body.nickname, 16) || '匿名食客'
        const list = store.replies[postId] ?? []
        list.push(makeReply(nickname, content, 0))
        // 单帖最多保留最近 100 条回复
        store.replies[postId] = list.slice(-100)
        writeStore(store)
        return sendJson(res, 200, { replies: store.replies[postId] })
      }

      /* ---------------- 社区：点赞切换 ---------------- */
      if (path === '/api/community/likes' && req.method === 'POST') {
        const body = await readBody(req)
        const postId = toText(body.postId, 80)
        const clientId = toText(body.clientId, 64)
        if (!postId || !clientId) return sendJson(res, 400, { error: '参数不完整' })

        const store = readStore()
        if (!postExists(store, postId)) return sendJson(res, 404, { error: '帖子不存在' })

        const list = store.likes[postId] ?? []
        const next = list.includes(clientId) ? list.filter((id) => id !== clientId) : [...list, clientId]
        store.likes[postId] = next
        writeStore(store)
        return sendJson(res, 200, { likes: next })
      }

      return sendJson(res, 404, { error: 'not found' })
    } catch (error: any) {
      return sendJson(res, 500, { error: String(error?.message ?? error).slice(0, 200) })
    }
  }
}
