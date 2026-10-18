/**
 * 做菜视频搜索检查（node scripts/check-videos.mjs / npm run check:videos）
 * ------------------------------------------------------------
 * 通过 Vite 的 ssrLoadModule 直接加载前后端共用的 TS 模块，检查：
 *  1. 意图识别：识别「要视频」；菜品 / 平台 / 新手 / 时长 / 少油等条件解析；
 *  2. 关键词生成与平台搜索入口（sourceType 标注、域名、编码）；
 *  3. 链接校验：https + 域名白名单（拒 evil / javascript / 换平台域名）；
 *  4. B 站数据清洗：HTML 清洗、缺字段不伪造、非法数据丢弃；
 *  5. 检索编排（注入 mock fetch）：去重 / 排序 / 时长过滤 / 平台限定 /
 *     失败与空结果路径 / 412 会话刷新 / 缓存命中 / 信息不足先澄清；
 *  6. 真实网络检索：真实调用 B 站公开搜索接口，验证能拿到真实可点击结果；
 *  7. 接口冒烟（需 dev server 运行，未运行时自动跳过并提示）：
 *     /api/videos/search 的校验、限定平台、上下文默认菜品。
 *
 * 环境变量：CHECK_BASE（默认 http://127.0.0.1:5173）、CHECK_LOG（可选，写 UTF-8 报告）。
 */
import fs from 'node:fs'
import { createServer } from 'vite'

const ROOT = process.cwd()
const BASE = process.env.CHECK_BASE || 'http://127.0.0.1:5173'
const logLines = []

let total = 0
let failures = 0

function check(label, ok, extra = '') {
  total += 1
  if (!ok) failures += 1
  const line = `${ok ? '✓' : '✗'} ${label}${!ok && extra ? ` — ${extra}` : ''}`
  console.log(line)
  logLines.push(line)
}

function section(title) {
  const line = `\n== ${title} ==`
  console.log(line)
  logLines.push(line)
}

/* ------------------------------ 加载模块 ------------------------------ */

const vite = await createServer({
  configFile: false,
  root: ROOT,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

const intentMod = await vite.ssrLoadModule('/src/lib/videoIntent.ts')
const searchMod = await vite.ssrLoadModule('/server/services/videoSearch.ts')

const {
  detectVideoIntent,
  buildVideoKeywords,
  buildSearchEntries,
  sanitizeVideoUrl,
  sanitizeCoverUrl,
  formatDuration,
  parseCnNumber,
  matchMaxDuration,
  contextSubjectFor,
  VIDEO_REQUEST_TEXT,
} = intentMod
const {
  searchVideos,
  normalizeBilibiliItem,
  parseBilibiliDuration,
  durationBucketFor,
  VideoSearchInputError,
  clearVideoSearchCache,
} = searchMod

/* ------------------------------ mock 工具 ------------------------------ */

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const sessionResponse = () =>
  new Response('<html>ok</html>', {
    status: 200,
    headers: [
      ['set-cookie', 'buvid3=test-session; Path=/; Domain=.bilibili.com'],
      ['set-cookie', 'b_nut=1730000000; Path=/; Domain=.bilibili.com'],
      ['content-type', 'text/html'],
    ],
  })

const biliItem = (n, title, extra = {}) => ({
  type: 'video',
  bvid: `BV1xx411c7m${n}`,
  title,
  author: `UP${n}`,
  pic: `//i0.hdslb.com/bfs/archive/${n}.jpg`,
  duration: '3:36',
  pubdate: 1739591226,
  description: `描述${n}`,
  ...extra,
})

const biliPayload = (items) => ({ code: 0, data: { result: items } })

const keywordOf = (target) => new URL(target).searchParams.get('keyword') ?? ''

function makeFetch(handler) {
  const calls = []
  const impl = async (url, init) => {
    const target = String(url)
    calls.push(target)
    return handler(target, init ?? {})
  }
  impl.calls = calls
  return impl
}

/** 常规 mock：主页给会话，搜索按关键词返回 items */
function mockHandler(itemsForKeyword) {
  return (target) => {
    if (target === 'https://www.bilibili.com/') return Promise.resolve(sessionResponse())
    if (target.startsWith('https://api.bilibili.com/x/web-interface/search/type')) {
      return Promise.resolve(jsonResponse(biliPayload(itemsForKeyword(keywordOf(target)))))
    }
    return Promise.reject(new Error(`unexpected fetch: ${target}`))
  }
}

/* ------------------------------ 1. 意图识别 ------------------------------ */

section('意图识别')

const case1 = detectVideoIntent('帮我找鱼香肉丝的做法视频')
check('「帮我找鱼香肉丝的做法视频」→ 视频需求 + 菜品=鱼香肉丝', case1.isVideoRequest && case1.dish === '鱼香肉丝', JSON.stringify(case1))

const case2 = detectVideoIntent('帮我找这道菜的教学视频', { defaultSubject: '麻婆豆腐' })
check('「帮我找这道菜的教学视频」→ 指代解析为当前角色菜品（麻婆豆腐）', case2.isVideoRequest && case2.dish === '麻婆豆腐')

const case3 = detectVideoIntent('帮我找这道菜的教学视频')
check('无上下文时「这道菜」不会编造菜品', case3.isVideoRequest && case3.dish === null)

check('「有没有视频教程」识别为视频需求', detectVideoIntent('有没有视频教程').isVideoRequest)
check('「搜一下红烧肉的教程」识别为视频需求', detectVideoIntent('搜一下红烧肉的教程').isVideoRequest)
check('「看看B站有没有鱼香肉丝」识别为视频需求 + 平台=B站', (() => {
  const r = detectVideoIntent('看看B站有没有鱼香肉丝')
  return r.isVideoRequest && r.platforms.join() === 'bilibili' && r.dish === '鱼香肉丝'
})())

const case4 = detectVideoIntent('帮我找麻婆豆腐的视频，适合新手，十分钟以内，少油版')
check(
  '条件解析：新手 / 10 分钟内 / 少油少盐',
  case4.difficulty === '新手' && case4.maxDuration === 10 && case4.style.includes('少油少盐'),
  JSON.stringify(case4),
)

check('「只找B站的视频」→ 平台限定 bilibili', detectVideoIntent('只找B站的视频').platforms.join() === 'bilibili')
check('「抖音和小红书都看看」→ 平台 [douyin, xiaohongshu]', detectVideoIntent('抖音和小红书的做法视频都看看').platforms.join() === 'douyin,xiaohongshu')
check('「只找B站的视频」识别为视频需求', detectVideoIntent('只找B站的视频').isVideoRequest)

check('「怎么做红烧肉」不是视频需求（普通聊天/菜谱）', detectVideoIntent('怎么做红烧肉').isVideoRequest === false)
check('「我昨天看了个美食视频」不是视频需求', detectVideoIntent('我昨天看了个美食视频，真不错').isVideoRequest === false)
check('「推荐几道川菜」不是视频需求', detectVideoIntent('推荐几道川菜').isVideoRequest === false)
check('「帮我找菜谱」不是视频需求', detectVideoIntent('帮我找菜谱').isVideoRequest === false)
check('「帮我找酸菜鱼的做法」不是视频需求（没有视频/教程词）', detectVideoIntent('帮我找酸菜鱼的做法').isVideoRequest === false)

const case5 = detectVideoIntent('帮我找川菜的做法视频')
check('「帮我找川菜的做法视频」→ 菜系作为 query 而不是假菜品', case5.dish === null && case5.query === '川菜')

const case6 = detectVideoIntent('帮我找相关视频')
check('「帮我找相关视频」→ 视频需求但菜品待定', case6.isVideoRequest && case6.dish === null && case6.query === null)

check('按钮文案常量与请求文案一致', VIDEO_REQUEST_TEXT === '帮我找相关视频')

const ctxChuan = contextSubjectFor({ characterId: 'chuan' })
const ctxMapo = contextSubjectFor({ characterId: 'mapo' })
const ctxCuisine = contextSubjectFor({ cuisineId: 'yue' })
check('上下文主体：菜系人格=川菜 / 角色=麻婆豆腐 / 菜系聊天=粤菜', ctxChuan === '川菜' && ctxMapo === '麻婆豆腐' && ctxCuisine === '粤菜')

/* ------------------------------ 2. 条件小工具 ------------------------------ */

section('条件解析小工具')

check('中文数字：十五=15 / 二十三=23 / 十=10 / 半（单独处理）', parseCnNumber('十五') === 15 && parseCnNumber('二十三') === 23 && parseCnNumber('十') === 10)
check('时长解析：十分钟以内=10 / 半小时=30 / 15分钟左右的视频=15', matchMaxDuration('十分钟以内') === 10 && matchMaxDuration('半小时') === 30 && matchMaxDuration('15分钟左右的视频') === 15)
check('时长解析：无时长条件时为 undefined', matchMaxDuration('适合新手') === undefined)
check('时长格式：216→3:36 / 3723→1:02:03 / 0→空', formatDuration(216) === '3:36' && formatDuration(3723) === '1:02:03' && formatDuration(0) === '')

/* ------------------------------ 3. 关键词与入口 ------------------------------ */

section('关键词与平台搜索入口')

const kw1 = buildVideoKeywords('鱼香肉丝', { difficulty: '新手', style: [] })
check('新手关键词：家常做法 / 新手教程 / 详细做法', kw1.join('|') === '鱼香肉丝 家常做法|鱼香肉丝 新手教程|鱼香肉丝 详细做法', kw1.join('|'))
const kw2 = buildVideoKeywords('麻婆豆腐', { style: ['正宗'] })
check('正宗关键词：家常做法 / 正宗…做法 / 详细做法', kw2.join('|') === '麻婆豆腐 家常做法|正宗麻婆豆腐做法|麻婆豆腐 详细做法', kw2.join('|'))
const kw3 = buildVideoKeywords('酸菜鱼', { style: ['少油少盐', '快手'] })
check('少油关键词：家常做法 / 教程 / 少油做法', kw3.join('|') === '酸菜鱼 家常做法|酸菜鱼 教程|酸菜鱼 少油做法', kw3.join('|'))
check('关键词最多 3 条且去重', buildVideoKeywords('红烧肉', { style: [] }).length === 3)

const entries = buildSearchEntries('鱼香肉丝', ['bilibili', 'douyin', 'xiaohongshu', 'xigua'])
check('四个平台各一个搜索入口', entries.length === 4 && new Set(entries.map((e) => e.id)).size === 4)
check('入口 sourceType 全部为 search-entry（不伪装成具体视频）', entries.every((e) => e.sourceType === 'search-entry'))
check(
  '入口链接指向各平台官方搜索页且关键词已编码',
  entries[0].url.startsWith('https://search.bilibili.com/all?keyword=') &&
    entries[1].url.startsWith('https://www.douyin.com/search/') &&
    entries[2].url.startsWith('https://www.xiaohongshu.com/search_result?keyword=') &&
    entries[3].url.startsWith('https://www.ixigua.com/search/') &&
    decodeURIComponent(entries[0].url).includes('鱼香肉丝'),
)

/* ------------------------------ 4. 链接校验 ------------------------------ */

section('链接校验（域名白名单）')

check('B 站视频链接通过校验', Boolean(sanitizeVideoUrl('https://www.bilibili.com/video/BV1xx411c7mD', 'bilibili')))
check('协议相对链接补全为 https 并通过', (sanitizeVideoUrl('//www.bilibili.com/video/BV1xx411c7mD', 'bilibili') || '').startsWith('https://'))
check('http 链接升级为 https', (sanitizeVideoUrl('http://www.douyin.com/video/123', 'douyin') || '').startsWith('https://'))
check('非白名单域名被拒绝', sanitizeVideoUrl('https://evil.example.com/video/1', 'bilibili') === null)
check('冒名子域名（bilibili.com.evil.com）被拒绝', sanitizeVideoUrl('https://www.bilibili.com.evil.com/x', 'bilibili') === null)
check('javascript: 伪协议被拒绝', sanitizeVideoUrl('javascript:alert(1)', 'bilibili') === null)
check('跨平台域名不通用（B 站链接不能当小红书链接）', sanitizeVideoUrl('https://www.bilibili.com/video/BV1xx411c7mD', 'xiaohongshu') === null)
check('封面：B 站图床通过 / 未知域名拒绝', Boolean(sanitizeCoverUrl('//i0.hdslb.com/bfs/archive/x.jpg')) && sanitizeCoverUrl('https://evil.com/x.jpg') === null)

/* ------------------------------ 5. B 站数据清洗 ------------------------------ */

section('B 站数据清洗')

const cleaned = normalizeBilibiliItem({
  ...biliItem(1, '<em class="keyword">鱼香肉丝</em>家常做法 &amp; 下饭'),
  description: '肉丝滑嫩，酸甜适口',
})
check('清洗：id / 平台 / sourceType / BV 链接正确', cleaned.id === 'bilibili-BV1xx411c7m1' && cleaned.platform === 'bilibili' && cleaned.sourceType === 'video' && /^https:\/\/www\.bilibili\.com\/video\/BV1xx411c7m1$/.test(cleaned.url))
check('清洗：标题已去 HTML 标签并解开实体', !cleaned.title.includes('<') && cleaned.title.includes('鱼香肉丝家常做法') && cleaned.title.includes('& 下饭'))
check('清洗：封面补全 https 且域名受信', cleaned.coverUrl === 'https://i0.hdslb.com/bfs/archive/1.jpg')
check('清洗：时长 3:36 → 216 秒 / 发布日期转 ISO', cleaned.duration === 216 && cleaned.publishedAt === new Date(1739591226 * 1000).toISOString())
check('清洗：作者与描述保留', cleaned.author === 'UP1' && cleaned.description === '肉丝滑嫩，酸甜适口')

const minimal = normalizeBilibiliItem({ type: 'video', bvid: 'BV1xx411c7m2', title: '超简版鱼香肉丝' })
check(
  '缺封面/作者/时长/日期时不伪造字段',
  minimal && !('coverUrl' in minimal) && !('author' in minimal) && !('duration' in minimal) && !('publishedAt' in minimal),
)

check('非法 BV 号 / 非 video 类型直接丢弃', normalizeBilibiliItem({ type: 'video', bvid: 'XX1', title: 't' }) === null && normalizeBilibiliItem({ type: 'bangumi', bvid: 'BV1xx411c7m3', title: 't' }) === null)
check('标题为空的条目丢弃', normalizeBilibiliItem({ type: 'video', bvid: 'BV1xx411c7m4', title: '  ' }) === null)
const evilCover = normalizeBilibiliItem({ type: 'video', bvid: 'BV1xx411c7m5', title: 't', pic: 'https://evil.com/x.jpg', description: 't' })
check('不可信封面域名丢弃（描述与标题相同也丢弃）', evilCover && !('coverUrl' in evilCover) && !('description' in evilCover))
check('时长解析：3:36=216 / 6:4=364 / 1:02:03=3723 / 非法=0', parseBilibiliDuration('3:36') === 216 && parseBilibiliDuration('6:4') === 364 && parseBilibiliDuration('1:02:03') === 3723 && parseBilibiliDuration('abc') === 0)
check('10 分钟以内启用 B 站时长筛选（duration=1）', durationBucketFor(10) === '1' && durationBucketFor(30) === '0' && durationBucketFor(undefined) === '0')

/* ------------------------------ 6. 检索编排（mock） ------------------------------ */

section('检索编排（mock fetch）')

/* 6.1 去重 + 排序 + 条数上限 */
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(
    mockHandler((keyword) => [
      biliItem(1, `${keyword} 家常做法完整教程`),
      biliItem(1, `${keyword} 家常做法完整教程`), // 重复项（同 id）
      biliItem(2, `${keyword} 简单版`),
    ]),
  )
  const bundle = await searchVideos({ text: '帮我找红烧肉的视频', limit: 3 }, { fetchImpl })
  check('mock：结果去重（同 BV 号只留一条）', new Set(bundle.results.map((r) => r.id)).size === bundle.results.length)
  check('mock：条数不超过 limit', bundle.results.length <= 3 && bundle.results.length >= 1)
  check('mock：每条结果都带 sourceType=video 且链接可校验', bundle.results.every((r) => r.sourceType === 'video' && sanitizeVideoUrl(r.url, r.platform)))
  check('mock：bundle 携带关键词与如实说明', Array.isArray(bundle.keywords) && bundle.keywords.length >= 1 && bundle.note.includes('检索到'))
}

/* 6.2 时长过滤 */
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(
    mockHandler((keyword) => [biliItem(1, `${keyword} 三分钟快手版`, { duration: '3:00' }), biliItem(2, `${keyword} 超长完整版`, { duration: '35:00' })]),
  )
  const bundle = await searchVideos({ text: '帮我找红烧肉的视频，十分钟以内' }, { fetchImpl })
  check('mock：10 分钟内条件过滤掉 35 分钟的视频', bundle.results.length >= 1 && bundle.results.every((r) => (r.duration ?? 0) <= 600))
}
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(mockHandler((keyword) => [biliItem(1, `${keyword} 超长完整版`, { duration: '35:00' })]))
  const bundle = await searchVideos({ text: '帮我找红烧肉的视频，十分钟以内' }, { fetchImpl })
  check('mock：全部超时则放宽并如实说明', bundle.results.length === 1 && bundle.note.includes('没有完全符合'))
}

/* 6.3 排序：新手教程优先 */
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(
    mockHandler((keyword) => [
      biliItem(1, '红烧肉 硬核大酒店后厨完整流程'),
      biliItem(2, '红烧肉 新手零基础教程 一看就会'),
    ]),
  )
  const bundle = await searchVideos({ text: '帮我找红烧肉的视频，适合新手' }, { fetchImpl, config: { cacheTtlMs: 1 } })
  check('mock：新手需求下「零基础教程」排在前面', bundle.results[0].id === 'bilibili-BV1xx411c7m2', bundle.results.map((r) => r.id).join())
}

/* 6.4 平台限定：不用 B 站就不请求 B 站 */
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(() => Promise.reject(new Error('不应发生任何请求')))
  const bundle = await searchVideos({ text: '帮我找红烧肉的视频', platforms: ['douyin'] }, { fetchImpl })
  check('mock：限定抖音时不请求 B 站', fetchImpl.calls.length === 0 && bundle.results.length === 0)
  check('mock：限定抖音时入口只有抖音且如实标注', bundle.entries.length === 1 && bundle.entries[0].platform === 'douyin' && bundle.providers[0].status === 'skipped')
  check('mock：说明文字明确「只提供官方搜索页入口」', bundle.note.includes('抖音') && bundle.note.includes('搜索页'))
}

/* 6.5 未知平台 → 明确报错 */
clearVideoSearchCache()
{
  let threw = null
  try {
    await searchVideos({ text: '帮我找红烧肉的视频', platforms: ['youtube'] }, { fetchImpl: makeFetch(() => Promise.reject(new Error('no'))) })
  } catch (error) {
    threw = error
  }
  check('mock：未知平台（youtube）抛出明确错误', threw instanceof VideoSearchInputError && threw.message.includes('youtube'))
  let threwEmpty = false
  try {
    await searchVideos({ text: '' }, { fetchImpl: makeFetch(() => Promise.reject(new Error('no'))) })
  } catch (error) {
    threwEmpty = error instanceof VideoSearchInputError
  }
  check('mock：空输入抛出输入错误', threwEmpty)
}

/* 6.6 失败路径 */
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(() => Promise.reject(new Error('network down')))
  const bundle = await searchVideos({ text: '帮我找红烧肉的视频' }, { fetchImpl })
  check('mock：平台请求全部失败时如实报告', bundle.status === 'done' && bundle.results.length === 0)
  check('mock：失败说明包含「暂时无法取得具体视频」', bundle.note.includes('暂时无法取得具体视频'))
  check('mock：失败时仍提供 4 个平台搜索入口', bundle.entries.length === 4 && bundle.entries.every((e) => sanitizeVideoUrl(e.url, e.platform)))
  check('mock：providers 如实标记 B 站失败', bundle.providers.find((p) => p.platform === 'bilibili')?.status === 'error')
}

/* 6.7 空结果路径 */
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(mockHandler(() => []))
  const bundle = await searchVideos({ text: '帮我找红烧肉的视频' }, { fetchImpl })
  check('mock：空结果显示诚实的空说明', bundle.results.length === 0 && bundle.note.includes('没有检索到合适的单个视频'))
  check('mock：空结果 providers 标记 empty 且仍给入口', bundle.providers.find((p) => p.platform === 'bilibili')?.status === 'empty' && bundle.entries.length === 4)
}

/* 6.8 412 风控 → 刷新会话重试一次 */
clearVideoSearchCache()
{
  const perKeyword = new Map()
  const fetchImpl = makeFetch((target) => {
    if (target === 'https://www.bilibili.com/') return Promise.resolve(sessionResponse())
    if (target.startsWith('https://api.bilibili.com/x/web-interface/search/type')) {
      const keyword = keywordOf(target)
      const count = perKeyword.get(keyword) ?? 0
      perKeyword.set(keyword, count + 1)
      if (count === 0) return Promise.resolve(jsonResponse({ code: -412, message: 'request was banned' }))
      return Promise.resolve(jsonResponse(biliPayload([biliItem(1, `${keyword} 家常做法`)])))
    }
    return Promise.reject(new Error(`unexpected: ${target}`))
  })
  const bundle = await searchVideos({ text: '帮我找红烧肉的视频' }, { fetchImpl })
  const homepageCalls = fetchImpl.calls.filter((url) => url === 'https://www.bilibili.com/').length
  check('mock：首次 -412 后刷新匿名会话并重试成功', bundle.results.length >= 1 && homepageCalls >= 2, `homepageCalls=${homepageCalls}`)
}

/* 6.9 缓存命中 */
clearVideoSearchCache()
{
  let hits = 0
  const fetchImpl = makeFetch((target) => {
    hits += 1
    if (target === 'https://www.bilibili.com/') return Promise.resolve(sessionResponse())
    return Promise.resolve(jsonResponse(biliPayload([biliItem(1, '红烧肉 家常做法')])))
  })
  await searchVideos({ text: '帮我找红烧肉的视频' }, { fetchImpl })
  const firstHits = hits
  await searchVideos({ text: '帮我找红烧肉的视频' }, { fetchImpl })
  check('mock：相同关键词第二次命中缓存（不再请求平台）', hits === firstHits, `first=${firstHits} second=${hits}`)
}

/* 6.10 上下文默认主体 + 信息不足先澄清 */
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(mockHandler((keyword) => [biliItem(1, `${keyword} 家常做法`)]))
  const bundle = await searchVideos({ text: '帮我找这道菜的视频', contextCharacterId: 'mapo' }, { fetchImpl })
  check('mock：角色上下文「这道菜」→ 麻婆豆腐', bundle.query === '麻婆豆腐' && bundle.keywords[0].startsWith('麻婆豆腐'))
}
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(() => Promise.reject(new Error('不应请求')))
  const bundle = await searchVideos({ text: '帮我找相关视频' }, { fetchImpl })
  check('mock：信息不足时先澄清、不搜索、不编造', bundle.status === 'clarify' && bundle.results.length === 0 && Boolean(bundle.question) && fetchImpl.calls.length === 0)
}
clearVideoSearchCache()
{
  const fetchImpl = makeFetch(mockHandler((keyword) => [biliItem(1, `${keyword} 家常做法`)]))
  const bundle = await searchVideos({ text: '帮我找相关视频', contextCuisineId: 'yue' }, { fetchImpl })
  check('mock：菜系上下文「相关视频」→ 粤菜', bundle.query === '粤菜')
}

/* ------------------------------ 7. 真实网络检索 ------------------------------ */

section('真实网络检索（哔哩哔哩公开搜索接口）')

clearVideoSearchCache()
let realBundle = null
let realError = ''
try {
  realBundle = await searchVideos({ text: '帮我找鱼香肉丝的做法视频' })
} catch (error) {
  realError = String(error?.message ?? error)
}

if (realBundle) {
  check('真实检索返回 >= 1 条结果', realBundle.results.length >= 1, realError || `results=${realBundle.results?.length}`)
  check('真实结果全部来自 B 站且链接通过白名单', realBundle.results.every((r) => r.platform === 'bilibili' && sanitizeVideoUrl(r.url, 'bilibili')))
  check('真实结果链接为 bilibili.com/video 形态', realBundle.results.every((r) => r.url.startsWith('https://www.bilibili.com/video/BV')))
  check('真实结果标题非空且已去 HTML', realBundle.results.every((r) => r.title.length >= 4 && !r.title.includes('<') && !r.title.includes('&amp;')))
  check('真实结果无重复 id 且 <= limit(6)', new Set(realBundle.results.map((r) => r.id)).size === realBundle.results.length && realBundle.results.length <= 6)
  check('可选字段（时长/作者）来自真实数据，无伪造占位', realBundle.results.every((r) => (r.duration === undefined || r.duration > 0) && (r.author === undefined || r.author.length > 0)))
  if (realBundle.results[0]) {
    console.log(`   示例结果：《${realBundle.results[0].title}》 ${realBundle.results[0].url}`)
  }
} else {
  check('真实检索返回 >= 1 条结果', false, realError || '网络不可用')
}

/* 7.1 真实检索缓存（同一关键词第二次不再请求平台） */
clearVideoSearchCache()
{
  const original = globalThis.fetch
  let networkCalls = 0
  const counting = (url, init) => {
    networkCalls += 1
    return original(url, init)
  }
  await searchVideos({ text: '帮我找麻婆豆腐的做法视频' }, { fetchImpl: counting })
  const first = networkCalls
  await searchVideos({ text: '帮我找麻婆豆腐的做法视频' }, { fetchImpl: counting })
  check('真实检索缓存：第二次不再发起网络请求', networkCalls === first, `first=${first} second=${networkCalls}`)
}

/* ------------------------------ 8. 接口冒烟 ------------------------------ */

await vite.close()

section('接口冒烟（/api/videos/search）')

async function fetchJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* ignore */
  }
  return { status: res.status, data }
}

let serverUp = false
try {
  const status = await fetch(`${BASE}/api/status`, { signal: AbortSignal.timeout(4000) })
  serverUp = status.ok
} catch {
  serverUp = false
}

if (!serverUp) {
  check('dev server 可访问（跳过接口检查）', true)
  const note = `⚠ 未检测到 ${BASE} —— 接口冒烟已跳过。启动 dev server 后重新运行即可完整检查。`
  console.log(note)
  logLines.push(note)
} else {
  const ok = await fetchJson('/api/videos/search', { text: '帮我找麻婆豆腐的做法视频' })
  check('接口：真实检索麻婆豆腐返回 200 且有结果', ok.status === 200 && ok.data?.status === 'done' && ok.data?.results?.length >= 1, `status=${ok.status}`)
  check('接口：所有结果链接通过白名单校验', Array.isArray(ok.data?.results) && ok.data.results.every((r) => sanitizeVideoUrl(r.url, r.platform) && r.sourceType === 'video'))
  check('接口：返回平台搜索入口', Array.isArray(ok.data?.entries) && ok.data.entries.some((e) => e.sourceType === 'search-entry'))

  const badPlatform = await fetchJson('/api/videos/search', { text: '帮我找红烧肉的视频', platforms: ['youtube'] })
  check('接口：未知平台返回 400 明确错误', badPlatform.status === 400 && String(badPlatform.data?.error ?? '').includes('youtube'), `status=${badPlatform.status}`)

  const emptyText = await fetchJson('/api/videos/search', { text: '' })
  check('接口：空输入返回 400', emptyText.status === 400, `status=${emptyText.status}`)

  const restricted = await fetchJson('/api/videos/search', { text: '帮我找红烧肉的视频', platforms: ['douyin'] })
  check(
    '接口：限定抖音时 0 条视频、只给抖音入口并如实说明',
    restricted.status === 200 &&
      restricted.data?.results?.length === 0 &&
      restricted.data?.entries?.length === 1 &&
      restricted.data.entries[0].platform === 'douyin' &&
      String(restricted.data?.note ?? '').includes('搜索页'),
    `status=${restricted.status}`,
  )

  const ctx = await fetchJson('/api/videos/search', { text: '帮我找这道菜的视频', contextCharacterId: 'mapo' })
  check('接口：角色上下文「这道菜」解析为麻婆豆腐', ctx.status === 200 && ctx.data?.query === '麻婆豆腐', `query=${ctx.data?.query}`)

  const capped = await fetchJson('/api/videos/search', { text: '帮我找红烧肉的做法视频', limit: 999 })
  check('接口：limit 被服务端限制（<= 12）', capped.status === 200 && Array.isArray(capped.data?.results) && capped.data.results.length <= 12, `results=${capped.data?.results?.length}`)
}

/* ------------------------------ 汇总 ------------------------------ */

const summary = failures === 0 ? `\n全部通过（${total}/${total}）` : `\n有 ${failures} 项未通过（共 ${total} 项）`
console.log(summary)
logLines.push(summary)

if (process.env.CHECK_LOG) {
  fs.writeFileSync(process.env.CHECK_LOG, logLines.join('\n'), 'utf8')
}

process.exit(failures === 0 ? 0 : 1)
