/**
 * 做菜视频搜索 · 意图解析与链接校验（前后端共用，纯函数、无副作用）
 * ------------------------------------------------------------
 * - detectVideoIntent(text, ctx)：判断用户是否在要视频，解析菜品 / 平台 / 条件；
 * - buildVideoKeywords(base, intent)：生成国内视频平台的搜索关键词；
 * - buildSearchEntries(base, platforms)：生成平台原生搜索页入口（明确 sourceType）；
 * - sanitizeVideoUrl / sanitizeCoverUrl：https + 域名白名单校验；
 * - formatDuration：秒 → 「3:36」。
 *
 * 浏览器（聊天页拦截）与服务端（/api/videos/search）加载的是同一份代码，
 * 保证前后端对「同一句请求」的理解一致；服务端解析结果才是权威结果。
 */
import { cuisines } from '../data/cuisines'
import { characterMap } from '../data/characters'
import { dishDatabase } from '../data/dishes'
import { getTaste } from '../data/tastes'
import type { VideoIntent, VideoPlatform, VideoSearchBundle, VideoSearchEntry } from '../types'

/* ------------------------------ 平台元数据 ------------------------------ */

export type VideoPlatformMeta = {
  id: VideoPlatform
  label: string
  short: string
  /** 平台官方关键词搜索页（用户在站外继续找视频的入口） */
  searchUrl: (keyword: string) => string
}

export const VIDEO_PLATFORMS: Record<VideoPlatform, VideoPlatformMeta> = {
  bilibili: {
    id: 'bilibili',
    label: '哔哩哔哩',
    short: 'B站',
    searchUrl: (keyword) => `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`,
  },
  douyin: {
    id: 'douyin',
    label: '抖音',
    short: '抖音',
    searchUrl: (keyword) => `https://www.douyin.com/search/${encodeURIComponent(keyword)}`,
  },
  xiaohongshu: {
    id: 'xiaohongshu',
    label: '小红书',
    short: '小红书',
    searchUrl: (keyword) => `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`,
  },
  xigua: {
    id: 'xigua',
    label: '西瓜视频',
    short: '西瓜',
    searchUrl: (keyword) => `https://www.ixigua.com/search/${encodeURIComponent(keyword)}/`,
  },
}

/** 默认优先级：先 B 站，再其他平台 */
export const VIDEO_PLATFORM_IDS: VideoPlatform[] = ['bilibili', 'douyin', 'xiaohongshu', 'xigua']

export function isVideoPlatform(value: unknown): value is VideoPlatform {
  return typeof value === 'string' && (VIDEO_PLATFORM_IDS as string[]).includes(value)
}

/* ------------------------------ 链接校验 ------------------------------ */

/** 允许作为视频链接的域名（按平台白名单，防伪造/钓鱼链接） */
const VIDEO_HOSTS: Record<VideoPlatform, string[]> = {
  bilibili: ['bilibili.com'],
  douyin: ['douyin.com'],
  xiaohongshu: ['xiaohongshu.com'],
  xigua: ['ixigua.com'],
}

/** 允许作为封面的图床域名（B 站 / 字节系 CDN 等） */
const COVER_HOSTS = [
  'hdslb.com',
  'bilivideo.com',
  'douyinpic.com',
  'bytedance.com',
  'byteimg.com',
  'pstatp.com',
  'xiaohongshu.com',
  'xhscdn.com',
  'ixiguavideo.com',
  'ixigua.com',
]

function hostMatches(hostname: string, domains: string[]): boolean {
  const host = hostname.toLowerCase()
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`))
}

/** 把 `//i0.hdslb.com/x.jpg` 补全为 `https://i0.hdslb.com/x.jpg` */
export function normalizeProtocolUrl(raw: string): string {
  const text = raw.trim()
  if (text.startsWith('//')) return `https:${text}`
  return text
}

/** 视频链接校验：必须 http(s) 且域名属于该平台白名单；返回规范化 https 链接，否则 null */
export function sanitizeVideoUrl(raw: unknown, platform: VideoPlatform): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  let url: URL
  try {
    url = new URL(normalizeProtocolUrl(raw))
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (!hostMatches(url.hostname, VIDEO_HOSTS[platform])) return null
  url.protocol = 'https:'
  return url.toString()
}

/** 封面链接校验：必须 http(s) 且域名属于已知图床白名单；否则丢弃（不伪造封面） */
export function sanitizeCoverUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  let url: URL
  try {
    url = new URL(normalizeProtocolUrl(raw))
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (!hostMatches(url.hostname, COVER_HOSTS)) return null
  url.protocol = 'https:'
  return url.toString()
}

/* ------------------------------ 小工具 ------------------------------ */

/** 秒 → 「3:36」（小于 1 秒或非法值返回空串） */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  const total = Math.round(seconds)
  const pad = (value: number) => String(value).padStart(2, '0')
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`
}

const CN_DIGITS: Record<string, number> = {
  零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
}

/** 中文数字（≤999）解析：十 → 10，十五 → 15，二十三 → 23；失败返回 null */
export function parseCnNumber(input: string): number | null {
  const text = input.trim()
  if (!text) return null
  if (/^\d+$/.test(text)) return Number(text)
  let total = 0
  let current = 0
  let seen = false
  for (const ch of text) {
    if (ch === '百') {
      total += (current || 1) * 100
      current = 0
      seen = true
    } else if (ch === '十') {
      total += (current || 1) * 10
      current = 0
      seen = true
    } else if (ch in CN_DIGITS) {
      current = CN_DIGITS[ch]
      seen = true
    } else {
      return null
    }
  }
  return seen ? total + current : null
}

const DURATION_RE = /(\d{1,3}|[零一二两三四五六七八九十百]{1,4}|半)\s*(?:个)?\s*(小时|h|min|分钟|分)/gi

/** 从请求里解析「时长上限（分钟）」：十分钟以内 / 半小时 / 15分钟左右 / 30分钟的视频 */
export function matchMaxDuration(text: string): number | undefined {
  const re = new RegExp(DURATION_RE.source, 'gi')
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    const raw = match[1]
    const unit = match[2].toLowerCase()
    const isHour = unit.startsWith('小时') || unit === 'h'
    let minutes: number | null = null
    if (raw === '半') {
      minutes = isHour ? 30 : null // 「半小时」= 30 分钟
    } else {
      const value = parseCnNumber(raw)
      if (value && value > 0) minutes = isHour ? value * 60 : value
    }
    if (!minutes || minutes <= 0 || minutes > 180) continue
    const after = text.slice(re.lastIndex, re.lastIndex + 10)
    const isConstraint =
      raw === '半' ||
      isHour ||
      /^\s*(以内|以下|之内|左右|之内)/.test(after) ||
      /^\s*内/.test(after) ||
      /^\s*(的)?\s*(视频|教程|教学)/.test(after)
    if (isConstraint) return minutes
  }
  return undefined
}

/* ------------------------------ 意图识别 ------------------------------ */

const PLATFORM_HINTS: { id: VideoPlatform; re: RegExp }[] = [
  { id: 'bilibili', re: /哔哩哔哩|bilibili|哔站|b站/i },
  { id: 'douyin', re: /抖音/ },
  { id: 'xiaohongshu', re: /小红书/ },
  { id: 'xigua', re: /西瓜视频|ixigua/i },
]

/** 句子在「要视频」而非普通闲聊：找/搜/查/有没有/想看/推荐 + 视频/教程/教学 */
const VIDEO_REQUEST_RES: RegExp[] = [
  /(?:帮|替|给)我\s*(?:找|搜|查)(?:一下)?[^，。！？!?]{0,20}?(?:视频|教程|教学)/,
  /(?:找|搜|查)(?:一下)?[^，。！？!?]{0,24}?(?:视频|教程|教学)/,
  /(?:有没有|有木有|有无|有吗)[^，。！？!?]{0,12}?(?:视频|教程|教学)/,
  /(?:想看|看看|看下|来点|来一个|来几个|推荐)[^，。！？!?]{0,12}?(?:视频|教程|教学)/,
  /(?:怎么做|咋做|如何做|怎样做)[^，。！？!?]{0,18}?(?:视频|教程|教学)/,
  /视频(?:教程|教学|讲解)/,
  /有[^，。！？!?]{0,8}?视频[吗嘛？?]/,
]

/** 常见但不在菜品库里的菜名（保证「鱼香肉丝」这类请求能被识别） */
const EXTRA_DISH_NAMES = [
  '鱼香肉丝', '宫保鸡丁', '回锅肉', '夫妻肺片', '毛血旺', '蚂蚁上树', '川味香肠',
  '蜜汁叉烧', '白灼虾', '佛跳墙', '松鼠鳜鱼', '西湖醋鱼', '龙井虾仁', '干炸响铃',
  '剁椒鱼头', '辣椒炒肉', '口味虾', '糖醋鲤鱼', '九转大肠', '把子肉',
  '臭鳜鱼', '毛豆腐', '一品锅', '地三鲜', '锅包肉', '大盘鸡', '黄焖鸡',
  '糖醋排骨', '土豆丝', '醋溜白菜', '可乐鸡翅', '西红柿炒鸡蛋', '番茄炒蛋',
  '鸡蛋羹', '疙瘩汤', '手擀面', '韭菜盒子', '葱油饼', '蛋炒饭', '炒河粉',
].map((name) => name.trim())

/** 菜品名词典：菜品库 + 32 道菜系代表菜 + 常见菜名，按长度降序保证最长匹配 */
const DISH_NAMES: string[] = (() => {
  const names = new Set<string>()
  for (const dish of dishDatabase) names.add(dish.name)
  for (const cuisine of cuisines) for (const dish of cuisine.representativeDishes) names.add(dish.name)
  for (const name of EXTRA_DISH_NAMES) names.add(name)
  return [...names].filter((name) => name.length >= 2).sort((a, b) => b.length - a.length)
})()

const CUISINE_WORD_MAP: Record<string, string> = {
  川菜: '川菜', 四川菜: '川菜', 粤菜: '粤菜', 广东菜: '粤菜',
  苏菜: '苏菜', 江苏菜: '苏菜', 鲁菜: '鲁菜', 山东菜: '鲁菜',
  湘菜: '湘菜', 湖南菜: '湘菜', 闽菜: '闽菜', 福建菜: '闽菜',
  浙菜: '浙菜', 浙江菜: '浙菜', 徽菜: '徽菜', 安徽菜: '徽菜',
  江南菜: '江南菜',
}

/** 泛美食主题（不是某道菜，但可以直接搜） */
const CATEGORY_QUERIES = [
  '街头小吃', '家常菜', '下饭菜', '减脂餐', '早餐', '夜宵', '便当', '火锅', '烧烤', '面食', '甜品', '凉菜', '主食', '小吃',
]

const DEICTIC = new Set(['这道菜', '这个菜', '这菜', '那个菜', '那道菜', '这道', '那个'])

const STOP_CANDIDATES = new Set([
  '相关', '这个', '那个', '这道', '那道', '什么', '哪些', '哪道', '这些', '那些',
  '东西', '玩意儿', '美食', '视频', '教程', '做法', '教学', '菜', '菜品', '一些',
  '有点', '今天', '明天', '家里', '自己', '一下', '一个', '几个', '看看', '想要',
])

const CONDITION_WORDS = /(适合|新手|入门|分钟|小时|左右|以内|以下|少油|少盐|正宗|快手|简单|详细|完整|家常)/

const LEAD_FILLER = /^(?:帮我|给我|替我|帮忙|请|麻烦|能不能|可以|你好|请问|我想|想要|想看|我要|要吃|来点|整点|来个|来几个|有没有|有木有|有无)+/
const VERB_FILLER = /^(?:找一下|搜一下|查一下|找|搜|查|看看|看下|看|来|学|做|要)+/
const TAIL_FILLER = /(?:怎么做|咋做|如何做|怎样做|的做法|做法|的教程|教程|的教学|教学|做菜|烹饪|视频|一下|一点|的|吧|呢|啊|吗|呀|哦|哈|简单点|快一点)+$/

function cleanCandidate(raw: string): string {
  let text = raw.trim().replace(/[「」『』“”"《》'’]/g, '')
  for (let i = 0; i < 4; i += 1) {
    const next = text.replace(LEAD_FILLER, '').replace(VERB_FILLER, '').replace(TAIL_FILLER, '').trim()
    if (next === text) break
    text = next
  }
  return text.trim()
}

/** 从句子中截取「关键词标记词」之前的部分，再清洗出疑似菜名 */
export function extractDishCandidate(text: string): string | null {
  const marker = /(?:的做法|做法|的教程|教程|的教学|教学|的做菜|做菜|烹饪|视频)/.exec(text)
  if (!marker) return null
  const head = text.slice(0, marker.index)
  const parts = head
    .split(/[，。！？!?；;、,.]/)
    .map((part) => cleanCandidate(part))
    .filter(Boolean)
  for (const candidate of parts) {
    if (isPlausibleCandidate(candidate) || DEICTIC.has(candidate)) return candidate
  }
  return null
}

function isPlausibleCandidate(candidate: string): boolean {
  if (!candidate || candidate.length < 2 || candidate.length > 10) return false
  if (STOP_CANDIDATES.has(candidate)) return false
  if (CONDITION_WORDS.test(candidate)) return false
  if (/^(这|那|哪|什|怎|多|很|太|我|你|它)/.test(candidate)) return false
  if (!/[\u4e00-\u9fa5A-Za-z0-9]/.test(candidate)) return false
  return true
}

/**
 * 解析视频搜索意图。
 * ctx.defaultSubject：当前聊天上下文的主体（角色名 / 菜系名），
 * 用于「帮我找这道菜的教学视频」这类指代。
 */
export function detectVideoIntent(text: string, ctx: { defaultSubject?: string | null } = {}): VideoIntent {
  const source = (text ?? '').trim()
  const platforms = PLATFORM_HINTS.filter((hint) => hint.re.test(source)).map((hint) => hint.id)

  const isVideoRequest = source
    ? VIDEO_REQUEST_RES.some((re) => re.test(source)) ||
      (platforms.length > 0 && /(找|搜|查|推荐|看看|想看|来点)/.test(source))
    : false

  const difficulty = /(新手|入门|小白|零基础)/.test(source)
    ? ('新手' as const)
    : /(进阶|大厨|高手)/.test(source)
      ? ('进阶' as const)
      : undefined

  const maxDuration = matchMaxDuration(source)

  const style: string[] = []
  if (/(正宗|地道|传统)/.test(source)) style.push('正宗')
  if (/(少油|少盐|低油|低脂|清淡|健康)/.test(source)) style.push('少油少盐')
  if (/(快手|快速|省时|懒人)/.test(source)) style.push('快手')

  // 1) 菜品词典最长匹配
  let dish: string | null = null
  for (const name of DISH_NAMES) {
    if (source.includes(name)) {
      dish = name
      break
    }
  }
  // 2) 句子模式提取（覆盖菜库外的菜品，如「鱼香肉丝」；菜系词归入 query）
  let query: string | null = null
  if (!dish) {
    const candidate = extractDishCandidate(source)
    if (candidate) {
      if (DEICTIC.has(candidate)) dish = ctx.defaultSubject ?? null
      else if (CUISINE_WORD_MAP[candidate]) query = CUISINE_WORD_MAP[candidate]
      else if (isPlausibleCandidate(candidate)) dish = candidate
    }
  }

  // 3) 非菜品主体：菜系名 → 泛美食主题
  if (!dish && !query) {
    for (const word of Object.keys(CUISINE_WORD_MAP)) {
      if (source.includes(word)) {
        query = CUISINE_WORD_MAP[word]
        break
      }
    }
    if (!query) query = CATEGORY_QUERIES.find((word) => source.includes(word)) ?? null
  }

  return { isVideoRequest, dish, query, platforms, difficulty, maxDuration, style }
}

/* ------------------------------ 关键词与入口 ------------------------------ */

/** 生成搜索关键词（确定性规则，最多 3 条；不经过模型，避免幻觉） */
export function buildVideoKeywords(base: string, intent: Pick<VideoIntent, 'difficulty' | 'style'>): string[] {
  const clean = base.trim()
  if (!clean) return []
  const keywords = [`${clean} 家常做法`]
  if (intent.difficulty === '新手') keywords.push(`${clean} 新手教程`)
  else if (intent.style.includes('正宗')) keywords.push(`正宗${clean}做法`)
  else keywords.push(`${clean} 教程`)
  if (intent.style.includes('少油少盐')) keywords.push(`${clean} 少油做法`)
  else if (intent.style.includes('快手')) keywords.push(`${clean} 快手做法`)
  else keywords.push(`${clean} 详细做法`)
  return [...new Set(keywords)].slice(0, 3)
}

/** 生成平台原生搜索页入口（明确标注为「搜索入口」而不是具体视频） */
export function buildSearchEntries(
  base: string,
  platforms: VideoPlatform[],
  keyword?: string,
): VideoSearchEntry[] {
  const word = (keyword ?? `${base.trim()} 家常做法`).trim()
  if (!word) return []
  return platforms.map((platform) => ({
    id: `${platform}-entry`,
    title: `在${VIDEO_PLATFORMS[platform].label}搜索更多`,
    platform,
    url: VIDEO_PLATFORMS[platform].searchUrl(word),
    sourceType: 'search-entry' as const,
  }))
}

/**
 * 当前聊天上下文对应的默认搜索主体：
 * 角色聊天 → 角色名（麻婆豆腐 / 烧烤 / 川菜…）；菜系聊天 → 菜系名；口味聊天 → 口味名。
 * 三种上下文分别解析，绝不把 tasteId 当作 cuisineId / characterId 使用。
 */
export function contextSubjectFor(
  ctx: { characterId?: string; cuisineId?: string; tasteId?: string } | undefined,
): string | null {
  if (ctx?.characterId) {
    const character = characterMap[ctx.characterId]
    if (character) return character.name
  }
  if (ctx?.cuisineId) {
    const cuisine = cuisines.find((item) => item.id === ctx.cuisineId)
    if (cuisine) return cuisine.name
  }
  if (ctx?.tasteId) {
    const taste = getTaste(ctx.tasteId)
    if (taste) return taste.name
  }
  return null
}

/** 聊天页「帮我找相关视频」按钮的固定文案（收发两端共用同一常量） */
export const VIDEO_REQUEST_TEXT = '帮我找相关视频'

/**
 * 客户端兜底：当 /api/videos/search 请求本身失败（网络中断等）时，
 * 生成一个如实说明的失败结果包——不编造任何视频，只保留平台搜索入口。
 */
export function buildFailedBundle(sourceText: string, message: string, subject: string | null): VideoSearchBundle {
  return {
    status: 'failed',
    note: message,
    query: subject,
    keywords: [],
    results: [],
    entries: subject ? buildSearchEntries(subject, VIDEO_PLATFORM_IDS) : [],
    providers: [],
    took: 0,
    searchedAt: Date.now(),
    sourceText,
  }
}
