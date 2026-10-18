/**
 * 站内做菜视频搜索服务（服务端）
 * ------------------------------------------------------------
 * 真实检索中国大陆常见平台的做菜视频：
 *  - 哔哩哔哩：调用其网页版公开搜索接口。首次先访问一次主页，
 *    获取匿名会话（buvid3）后再搜索；命中风控（-412）时刷新会话重试一次。
 *    不登录、不破解签名、不绕过验证码，拿不到就如实报错，绝不伪造数据。
 *  - 抖音 / 小红书 / 西瓜视频：未对个人开放通用视频搜索接口，其网页数据
 *    依赖签名与登录态，不做抓取；仅提供官方搜索页入口（sourceType =
 *    'search-entry'），前端明确标注为「在该平台搜索更多」。
 *
 * 所有结果一律经过：HTML 清洗（去标签、解实体）、链接校验（https + 平台
 * 域名白名单）、去重、按相关度/教程完整度/用户条件排序、数量截断。
 * 作者 / 时长 / 封面 / 发布日期均为可选字段，缺失即不返回，绝不伪造。
 *
 * 缓存：关键词级内存缓存（默认 10 分钟，可用 VIDEO_SEARCH_CACHE_TTL_MS 调整）；
 * 失败结果短缓存 60 秒，避免打爆平台接口。
 */
import { getCuisine } from '../../src/data/cuisines'
import { getTaste } from '../../src/data/tastes'
import {
  VIDEO_PLATFORMS,
  VIDEO_PLATFORM_IDS,
  buildSearchEntries,
  buildVideoKeywords,
  contextSubjectFor,
  detectVideoIntent,
  isVideoPlatform,
  normalizeProtocolUrl,
  sanitizeCoverUrl,
  sanitizeVideoUrl,
} from '../../src/lib/videoIntent'
import type {
  VideoPlatform,
  VideoProviderReport,
  VideoResult,
  VideoSearchBundle,
} from '../../src/types'

/* ------------------------------ 输入校验 ------------------------------ */

export type VideoSearchInput = {
  text?: string
  dish?: string
  query?: string
  platforms?: unknown[]
  difficulty?: string
  maxDuration?: number
  limit?: number
  contextCharacterId?: string
  contextCuisineId?: string
  /** 口味探索上下文（tasteId）：与 cuisineId/characterId 互不混用，未知 id 会被忽略 */
  contextTasteId?: string
}

/** 输入不合法（路由层映射为 400，绝不静默回退） */
export class VideoSearchInputError extends Error {}

export type VideoSearchConfig = {
  timeoutMs: number
  cacheTtlMs: number
  /** 可选：手动指定 B 站匿名会话 Cookie（不填则自动访问一次主页获取） */
  bilibiliCookie: string
}

const DEFAULT_CONFIG: VideoSearchConfig = {
  timeoutMs: 8000,
  cacheTtlMs: 10 * 60 * 1000,
  bilibiliCookie: '',
}

function intFromEnv(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.round(parsed)))
}

/** 从 Vite env 读取可选配置（全部有安全默认值，不配置也能用） */
export function videoSearchConfig(env: Record<string, string | undefined>): VideoSearchConfig {
  return {
    timeoutMs: intFromEnv(env.VIDEO_SEARCH_TIMEOUT_MS, DEFAULT_CONFIG.timeoutMs, 2000, 20000),
    cacheTtlMs: intFromEnv(env.VIDEO_SEARCH_CACHE_TTL_MS, DEFAULT_CONFIG.cacheTtlMs, 10_000, 3_600_000),
    bilibiliCookie: (env.BILIBILI_COOKIE ?? '').trim(),
  }
}

type FetchLike = typeof globalThis.fetch

function toText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function toInt(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.round(parsed)
}

/* ------------------------------ B 站数据清洗 ------------------------------ */

const BV_RE = /^BV[0-9A-Za-z]{8,12}$/

const ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&nbsp;': ' ',
}

function stripHtml(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z#x0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
    .replace(/\s+/g, ' ')
    .trim()
}

/** 「3:36」「1:02:03」→ 秒；无法解析返回 0 */
export function parseBilibiliDuration(raw: unknown): number {
  if (typeof raw !== 'string' || !raw.trim()) return 0
  const parts = raw.trim().split(':').map((part) => Number(part))
  if (!parts.length || parts.some((part) => !Number.isFinite(part) || part < 0)) return 0
  if (parts.length === 2) return Math.round(parts[0] * 60 + parts[1])
  if (parts.length === 3) return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2])
  return 0
}

/**
 * 把 B 站搜索返回的单条原始数据清洗为 VideoResult。
 * 无法通过校验（BV 号非法 / 标题为空 / 链接不可信）时返回 null，直接丢弃。
 */
export function normalizeBilibiliItem(raw: unknown): VideoResult | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  if (item.type !== 'video') return null

  const bvid = typeof item.bvid === 'string' ? item.bvid.trim() : ''
  if (!BV_RE.test(bvid)) return null

  const title = stripHtml(item.title)
  if (!title) return null

  const url = sanitizeVideoUrl(`https://www.bilibili.com/video/${bvid}`, 'bilibili')
  if (!url) return null

  const result: VideoResult = {
    id: `bilibili-${bvid}`,
    title: title.slice(0, 120),
    platform: 'bilibili',
    url,
    sourceType: 'video',
  }

  const cover = sanitizeCoverUrl(normalizeProtocolUrl(typeof item.pic === 'string' ? item.pic : ''))
  if (cover) result.coverUrl = cover

  const author = stripHtml(item.author).slice(0, 40)
  if (author) result.author = author

  const duration = parseBilibiliDuration(item.duration)
  if (duration > 0) result.duration = duration

  const description = stripHtml(item.description).slice(0, 90)
  if (description && description !== result.title) result.description = description

  const pubdate = Number(item.pubdate)
  if (Number.isFinite(pubdate) && pubdate > 0) {
    const date = new Date(pubdate * 1000)
    if (Number.isFinite(date.getTime())) result.publishedAt = date.toISOString()
  }

  return result
}

/* ------------------------------ 排序打分 ------------------------------ */

export type VideoScoreCriteria = {
  base: string
  maxDurationSec?: number
  difficulty?: string
  style: string[]
}

/** 相关度 / 教程完整度 / 用户条件排序（分数相同保持平台原始顺序） */
export function scoreVideoResult(item: VideoResult, criteria: VideoScoreCriteria): number {
  const title = item.title
  let score = 0
  if (title.includes(criteria.base)) score += 4
  if (/(家常|家庭版|在家)/.test(title)) score += 1
  if (/(教程|教学|讲解|做法|烹饪|步骤)/.test(title)) score += 1
  if (/(新手|入门|零基础|小白)/.test(title)) score += criteria.difficulty === '新手' ? 2 : 1
  if (criteria.difficulty === '新手' && /(简单|快手|懒人)/.test(title)) score += 1
  if (item.duration) {
    if (item.duration >= 60 && item.duration <= 1200) score += 1
    if (criteria.maxDurationSec && item.duration <= criteria.maxDurationSec) score += 2
  }
  if (criteria.style.includes('正宗') && /(正宗|地道|传统|厨师长|老饭骨|特厨)/.test(title)) score += 2
  if (criteria.style.includes('少油少盐') && /(少油|少盐|低脂|低卡|健康|减脂)/.test(title)) score += 2
  if (criteria.style.includes('快手') && /(快手|十分钟|10分钟|五分钟|懒人|省时|简单)/.test(title)) score += 2
  return score
}

/* ------------------------------ B 站检索 ------------------------------ */

const WEB_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const BILIBILI_ORIGIN = 'https://www.bilibili.com/'
const BILIBILI_SEARCH_ENDPOINT = 'https://api.bilibili.com/x/web-interface/search/type'
const SESSION_TTL_MS = 25 * 60 * 1000
const SESSION_FAIL_COOLDOWN_MS = 30 * 1000

type BilibiliOutcome = { status: 'ok' | 'empty' | 'error'; items: VideoResult[]; reason?: string }

type SessionState = { cookie: string; ts: number } | { failure: string; ts: number } | null

let session: SessionState = null
let sessionInFlight: Promise<string> | null = null

async function ensureBilibiliCookie(
  fetchImpl: FetchLike,
  config: VideoSearchConfig,
  force = false,
): Promise<string> {
  if (config.bilibiliCookie) return config.bilibiliCookie
  const now = Date.now()
  if (!force && session) {
    if ('cookie' in session && now - session.ts < SESSION_TTL_MS) return session.cookie
    if ('failure' in session && now - session.ts < SESSION_FAIL_COOLDOWN_MS) throw new Error(session.failure)
  }
  // 并行关键词共享同一次会话获取，避免重复访问主页
  if (!force && sessionInFlight) return sessionInFlight

  const task = (async () => {
    try {
      const response = await fetchImpl(BILIBILI_ORIGIN, {
        headers: { 'User-Agent': WEB_UA, Accept: 'text/html' },
        redirect: 'follow',
        signal: AbortSignal.timeout(config.timeoutMs),
      })
      const headerShim = response.headers as Headers & { getSetCookie?: () => string[] }
      const rawCookies = typeof headerShim.getSetCookie === 'function' ? headerShim.getSetCookie() : []
      const cookie = rawCookies.map((item) => item.split(';')[0]).join('; ')
      if (!/(?:^|;\s*)buvid3=/.test(cookie)) throw new Error('未获得匿名会话（buvid3）')
      session = { cookie, ts: Date.now() }
      return cookie
    } catch (error) {
      const message = `无法建立平台匿名会话（${String((error as Error)?.message ?? error).slice(0, 60)}）`
      session = { failure: message, ts: Date.now() }
      throw new Error(message)
    }
  })()

  sessionInFlight = task
  try {
    return await task
  } finally {
    if (sessionInFlight === task) sessionInFlight = null
  }
}

/** B 站时长筛选：1 = 10 分钟以下（用户要求 ≤10 分钟时启用） */
export function durationBucketFor(maxDuration?: number): string {
  return maxDuration && maxDuration <= 10 ? '1' : '0'
}

export function buildBilibiliSearchUrl(keyword: string, bucket: string): string {
  const url = new URL(BILIBILI_SEARCH_ENDPOINT)
  url.searchParams.set('search_type', 'video')
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('page', '1')
  url.searchParams.set('page_size', '20')
  url.searchParams.set('order', 'totalrank')
  if (bucket && bucket !== '0') url.searchParams.set('duration', bucket)
  return url.toString()
}

/* 关键词级缓存（含失败短缓存） */
const cache = new Map<string, { expires: number; value: BilibiliOutcome }>()
const CACHE_MAX_ENTRIES = 200
const ERROR_CACHE_TTL_MS = 60 * 1000

function cacheGet(key: string): BilibiliOutcome | null {
  const hit = cache.get(key)
  if (!hit) return null
  if (hit.expires < Date.now()) {
    cache.delete(key)
    return null
  }
  return hit.value
}

function cacheSet(key: string, value: BilibiliOutcome, ttlMs: number) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, { expires: Date.now() + ttlMs, value })
}

/** 测试用：清空缓存与会话 */
export function clearVideoSearchCache() {
  cache.clear()
  session = null
}

async function fetchBilibiliSearch(
  keyword: string,
  bucket: string,
  fetchImpl: FetchLike,
  config: VideoSearchConfig,
): Promise<BilibiliOutcome> {
  const cacheKey = `bilibili|${keyword}|${bucket}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const finish = (outcome: BilibiliOutcome): BilibiliOutcome => {
    cacheSet(cacheKey, outcome, outcome.status === 'error' ? ERROR_CACHE_TTL_MS : config.cacheTtlMs)
    return outcome
  }

  const attempt = async (cookie: string) => {
    const response = await fetchImpl(buildBilibiliSearchUrl(keyword, bucket), {
      headers: {
        'User-Agent': WEB_UA,
        Referer: BILIBILI_ORIGIN,
        Accept: 'application/json',
        Cookie: cookie,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(config.timeoutMs),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()
    let json: any
    try {
      json = JSON.parse(text)
    } catch {
      throw new Error('返回内容不是 JSON（可能被网关拦截）')
    }
    return json
  }

  try {
    let cookie = await ensureBilibiliCookie(fetchImpl, config)
    let json = await attempt(cookie)
    if (json?.code === -412 || json?.code === -799) {
      // 匿名会话失效/触发风控：刷新一次会话重试；仍失败则如实报错（不伪造签名、不绕过验证码）
      cookie = await ensureBilibiliCookie(fetchImpl, config, true)
      json = await attempt(cookie)
    }
    if (json?.code === -412 || json?.code === -799) {
      return finish({ status: 'error', items: [], reason: `平台风控限制（code ${json.code}）` })
    }
    if (json?.code !== 0) {
      return finish({ status: 'error', items: [], reason: `平台返回异常（code ${json?.code}）` })
    }
    const list: unknown[] = Array.isArray(json?.data?.result) ? json.data.result : []
    const items = list.map((item) => normalizeBilibiliItem(item)).filter(Boolean) as VideoResult[]
    return finish(items.length ? { status: 'ok', items } : { status: 'empty', items: [] })
  } catch (error) {
    return finish({
      status: 'error',
      items: [],
      reason: `请求失败（${String((error as Error)?.message ?? error).slice(0, 60)}）`,
    })
  }
}

/* ------------------------------ 主流程 ------------------------------ */

const ENTRY_ONLY_REASON = '该平台未开放通用视频搜索接口，仅提供官方搜索页入口（不抓取、不绕过风控）'

/**
 * 执行一次完整的视频检索：
 * 解析意图 → 生成关键词 → （真实）检索可用平台 → 清洗/校验/去重/排序/截断
 * → 生成平台搜索入口 → 生成如实说明。任何平台失败都不会抛错，只会如实报告。
 */
export async function searchVideos(
  input: VideoSearchInput,
  deps: { fetchImpl?: FetchLike; config?: Partial<VideoSearchConfig> } = {},
): Promise<VideoSearchBundle> {
  const startedAt = Date.now()
  const config: VideoSearchConfig = { ...DEFAULT_CONFIG, ...deps.config }
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch

  const text = toText(input.text, 300)
  const explicitDish = toText(input.dish, 40)
  const explicitQuery = toText(input.query, 100)
  if (!text && !explicitDish && !explicitQuery) {
    throw new VideoSearchInputError('缺少搜索内容（text / dish / query 至少提供一项）')
  }

  // 平台白名单校验：未知 id 明确报错，绝不静默回退
  let requestedPlatforms: VideoPlatform[] | null = null
  if (Array.isArray(input.platforms)) {
    const list: VideoPlatform[] = []
    for (const raw of input.platforms) {
      const id = toText(raw, 20)
      if (!isVideoPlatform(id)) {
        throw new VideoSearchInputError(`不支持的平台：${id || '(空)'}`)
      }
      if (!list.includes(id)) list.push(id)
    }
    requestedPlatforms = list.length ? list : null
  }

  const limitRaw = toInt(input.limit)
  const limit = Math.min(12, Math.max(1, limitRaw ?? 6))
  const maxDurationRaw = toInt(input.maxDuration)
  const inputMaxDuration =
    maxDurationRaw !== undefined && maxDurationRaw >= 1 && maxDurationRaw <= 180 ? maxDurationRaw : undefined
  const inputDifficulty =
    input.difficulty === '新手' || input.difficulty === '进阶' ? input.difficulty : undefined

  // 意图解析（前后端同一套纯函数；服务端在上下文里解析出的结果才是权威）
  const subject = contextSubjectFor({
    characterId: toText(input.contextCharacterId, 40) || undefined,
    cuisineId: toText(input.contextCuisineId, 40) || undefined,
    tasteId: toText(input.contextTasteId, 40) || undefined,
  })
  const intent = detectVideoIntent(text || explicitDish || explicitQuery, { defaultSubject: subject })

  const base = explicitDish || intent.dish || explicitQuery || intent.query || subject || null
  const scope: VideoPlatform[] = requestedPlatforms ?? (intent.platforms.length ? intent.platforms : VIDEO_PLATFORM_IDS)
  const maxDuration = inputMaxDuration ?? intent.maxDuration
  const difficulty = inputDifficulty ?? intent.difficulty
  const style = intent.style

  // 信息不足时先询问，不执行搜索、不编造
  if (!base) {
    const cuisine = toText(input.contextCuisineId, 40) ? getCuisine(toText(input.contextCuisineId, 40)) : undefined
    const taste = toText(input.contextTasteId, 40) ? getTaste(toText(input.contextTasteId, 40)) : undefined
    const sampleDish = taste?.representativeDishes[0]?.name ?? '麻婆豆腐'
    const question = taste
      ? `想找哪道适合「${taste.name}」口味的视频？直接说菜名就行，例如「${sampleDish} 的做法视频」。`
      : cuisine
        ? `想找哪道${cuisine.name}的视频？直接说菜名就行，例如「鱼香肉丝 的做法视频」。`
        : '想找哪道菜的做菜视频？直接说菜名就行，例如「麻婆豆腐 的做法视频」。'
    return {
      status: 'clarify',
      note: question,
      query: null,
      keywords: [],
      results: [],
      entries: [],
      providers: scope.map<VideoProviderReport>((platform) => ({ platform, status: 'skipped', count: 0 })),
      question,
      took: Date.now() - startedAt,
      searchedAt: Date.now(),
      sourceText: text,
    }
  }

  const keywords = buildVideoKeywords(base, { difficulty, style })
  const bucket = durationBucketFor(maxDuration)
  const bilibiliInScope = scope.includes('bilibili')

  let results: VideoResult[] = []
  let bilibiliStatus: 'ok' | 'empty' | 'error' = 'empty'
  let bilibiliReason: string | undefined
  let relaxed = false
  const maxDurationSec = maxDuration ? maxDuration * 60 : undefined

  if (bilibiliInScope && keywords.length) {
    const outcomes = await Promise.all(
      keywords.map((keyword) => fetchBilibiliSearch(keyword, bucket, fetchImpl, config)),
    )

    // 合并去重（按视频 id），保持平台原始顺序
    const merged = new Map<string, VideoResult>()
    for (const outcome of outcomes) {
      for (const item of outcome.items) if (!merged.has(item.id)) merged.set(item.id, item)
    }
    let list = [...merged.values()]

    // 硬性条件：时长上限（时长已知且超出的先剔除；全都超时则放宽并如实说明）
    if (maxDurationSec) {
      const filtered = list.filter((item) => !item.duration || item.duration <= maxDurationSec)
      if (filtered.length > 0) list = filtered
      else if (list.length > 0) relaxed = true
    }

    const criteria: VideoScoreCriteria = { base, maxDurationSec, difficulty, style }
    results = list
      .map((item, index) => ({ item, index, score: scoreVideoResult(item, criteria) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, limit)
      .map((entry) => entry.item)

    const errored = outcomes.filter((outcome) => outcome.status === 'error')
    if (outcomes.some((outcome) => outcome.status === 'ok')) {
      bilibiliStatus = 'ok'
    } else if (errored.length && errored.length === outcomes.length) {
      bilibiliStatus = 'error'
      bilibiliReason = [...new Set(errored.map((item) => item.reason).filter(Boolean))].join('；')
    } else {
      bilibiliStatus = 'empty'
    }
  }

  const entries = buildSearchEntries(base, scope)
  const providers: VideoProviderReport[] = scope.map((platform) => {
    if (platform === 'bilibili') {
      return {
        platform,
        status: bilibiliInScope ? bilibiliStatus : 'skipped',
        count: results.length,
        ...(bilibiliStatus === 'error' && bilibiliReason ? { reason: bilibiliReason } : {}),
      }
    }
    return { platform, status: 'skipped', count: 0, reason: ENTRY_ONLY_REASON }
  })

  // 如实生成说明文字（完全由真实结果确定性生成，与模型无关）
  let note: string
  if (results.length > 0) {
    const parts = [`已在${VIDEO_PLATFORMS.bilibili.label}实时检索到 ${results.length} 条相关视频。`]
    if (keywords.length) parts.push(`搜索关键词：${keywords.slice(0, 2).join('；')}。`)
    if (relaxed) parts.push(`注：没有完全符合「${maxDuration} 分钟以内」的视频，以下是相近结果。`)
    note = parts.join('')
  } else if (bilibiliInScope && bilibiliStatus === 'error') {
    note = `暂时无法取得具体视频（${bilibiliReason ?? '平台接口暂不可用'}）。可以用下面的平台搜索入口继续找，或稍后重试。`
  } else if (bilibiliInScope) {
    note = '这次没有检索到合适的单个视频。换个关键词试试，或直接用下面的平台搜索入口。'
  } else {
    note = `你指定的平台（${scope.map((platform) => VIDEO_PLATFORMS[platform].label).join('、')}）目前只提供官方搜索页入口，没有开放单条视频数据。点下方链接可去平台内继续搜索。`
  }

  return {
    status: 'done',
    note,
    query: base,
    keywords,
    results,
    entries,
    providers,
    took: Date.now() - startedAt,
    searchedAt: Date.now(),
    sourceText: text,
  }
}
