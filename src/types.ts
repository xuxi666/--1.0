export type RecipeIngredient = { name: string; amount: number; unit: string; note?: string }

export type RecipeStep = {
  order: number
  action: string
  heat?: string
  minutes?: number
  tip?: string
}

export type Recipe = {
  title: string
  servings: number
  prepMinutes: number
  cookMinutes: number
  difficulty: '简单' | '中等' | '进阶'
  flavor: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  tips: string[]
  substitutions: string[]
  allergens: string[]
}

export type RecipeResponse = {
  demo: boolean
  recipe: Recipe
  model?: string | null
  error?: string
}

export type RecommendInput = {
  mood?: string
  flavors?: string[]
  spicy?: number
  budget?: number
  people?: number
  minutes?: number
  region?: string
  /** 限定菜系（八大菜系 id，来自 cuisine 配置）；空字符串表示不限 */
  cuisine?: string
  avoid?: string[]
}

export type RecommendItem = { id: string; name: string; reason: string }

export type RecommendResponse = {
  demo: boolean
  model?: string | null
  results: RecommendItem[]
  error?: string
}

/* ------------------------------ 做菜视频搜索 ------------------------------ */

/** 支持检索的国内视频/内容平台（白名单，顺序即默认优先级） */
export type VideoPlatform = 'bilibili' | 'douyin' | 'xiaohongshu' | 'xigua'

/** 视频搜索意图解析结果（前后端共用同一套纯函数解析器） */
export type VideoIntent = {
  isVideoRequest: boolean
  /** 识别到的菜品名（可空） */
  dish: string | null
  /** 非菜品的搜索主体，如「川菜」「早餐」（可空） */
  query: string | null
  /** 用户显式指定的平台（空数组表示不限） */
  platforms: VideoPlatform[]
  difficulty?: '新手' | '进阶'
  /** 用户要求的最长时长（分钟） */
  maxDuration?: number
  /** 风格条件：正宗 / 少油少盐 / 快手 */
  style: string[]
}

/** 单条真实视频结果：可选字段缺失即不返回，绝不伪造 */
export type VideoResult = {
  id: string
  title: string
  platform: VideoPlatform
  url: string
  coverUrl?: string
  author?: string
  /** 时长（秒） */
  duration?: number
  description?: string
  /** 发布日期（ISO） */
  publishedAt?: string
  sourceType: 'video'
}

/** 平台关键词搜索入口（未开放搜索接口的平台只提供此形态） */
export type VideoSearchEntry = {
  id: string
  title: string
  platform: VideoPlatform
  url: string
  sourceType: 'search-entry'
}

/** 各平台本轮检索的实际情况（如实报告，便于前端解释） */
export type VideoProviderReport = {
  platform: VideoPlatform
  status: 'ok' | 'empty' | 'error' | 'skipped'
  count: number
  reason?: string
}

/** 一次视频检索的完整结果包（服务端 /api/videos/search 生成） */
export type VideoSearchBundle = {
  status: 'done' | 'clarify' | 'failed'
  /** 面向用户的说明文字（由真实结果确定性生成，不是模型编造） */
  note: string
  /** 搜索主体（菜品名 / 其他关键词），待澄清时为 null */
  query: string | null
  keywords: string[]
  results: VideoResult[]
  entries: VideoSearchEntry[]
  providers: VideoProviderReport[]
  /** 需要澄清时向用户提出的问题 */
  question?: string
  took: number
  searchedAt: number
  /** 触发检索的原始输入（客户端重试用） */
  sourceText?: string
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  /** 站内视频检索结果块（仅本地展示；发给服务端时只读取 role/content） */
  video?: VideoSearchBundle
  /** 视频检索进行中 */
  videoLoading?: boolean
}

export type AiStatus = { ai: 'live' | 'demo'; model: string | null }

export type RelatedDish = {
  name: string
  reason: string
  tag: string
  photo: string
  minutes?: number
  price?: number
  emoji?: string
}

export type RelatedDishesResponse = {
  demo: boolean
  model?: string | null
  items: RelatedDish[]
  error?: string
}
