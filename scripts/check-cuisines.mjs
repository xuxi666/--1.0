/**
 * 八大菜系数据一致性检查（node scripts/check-cuisines.mjs / npm run check:cuisines）
 * ------------------------------------------------------------
 * 通过 Vite 的 ssrLoadModule 直接加载 TS 数据模块，检查：
 *  1. 八大菜系 ID 唯一、完整，isCuisineId 白名单行为正确；
 *  2. 每个菜系都有独立的人格标签、知识范围、欢迎语、推荐问题与 systemPrompt（互不相同）；
 *  3. 代表菜：数量、稳定 id 唯一性、简介、照片文件真实存在、characterId 指向真实角色；
 *  4. cuisineId → 配置 → 代表菜 → 角色 的解析关系正确（含反向 cuisineOfCharacter）；
 *  5. 口味分类的代言角色（featuredCharacterId）真实存在且属于该分类（防「浓香派却和烧烤聊天」类错配）；
 *  6. 菜品库的 cuisineId / characterId 合法，限定的菜系在库里有真实候选；
 *  7. 接口冒烟（需 dev server 运行，未运行时自动跳过并提示）：
 *     /api/cuisine-chat 校验白名单、/api/chat 拒绝菜系 id、/api/recommend 遵守菜系限定。
 * 环境变量：CHECK_BASE（默认 http://127.0.0.1:5173）、CHECK_LOG（可选，把 UTF-8 报告写入该文件）。
 */
import fs from 'node:fs'
import nodePath from 'node:path'
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

/* ------------------------------ 数据层 ------------------------------ */

const vite = await createServer({
  configFile: false,
  root: ROOT,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

const cuisinesMod = await vite.ssrLoadModule('/src/data/cuisines.ts')
const charactersMod = await vite.ssrLoadModule('/src/data/characters.ts')
const categoriesMod = await vite.ssrLoadModule('/src/data/categories.ts')
const dishesMod = await vite.ssrLoadModule('/src/data/dishes/index.ts')

const {
  CUISINE_IDS,
  cuisines,
  cuisineMap,
  isCuisineId,
  getCuisine,
  foodTypeTags,
  allCuisineDishes,
  relatedCharactersOfCuisine,
  cuisineOfCharacter,
} = cuisinesMod
const { characters, characterMap } = charactersMod
const { categories, categoryMap, featuredCharacterOfCategory, charactersOfCategory } = categoriesMod
const { dishDatabase } = dishesMod

/* 1. 菜系基础 */
section('菜系基础')
check('八大菜系 id 恰好 8 个且唯一', CUISINE_IDS.length === 8 && new Set(CUISINE_IDS).size === 8)
check('cuisines 数组与 CUISINE_IDS 一一对应', cuisines.length === 8 && cuisines.every((c, i) => c.id === CUISINE_IDS[i]))
const expectedNames = ['川菜', '粤菜', '苏菜', '鲁菜', '湘菜', '闽菜', '浙菜', '徽菜']
check(`八个菜系名称与预期一致（${expectedNames.join('、')}）`, cuisines.map((c) => c.name).join() === expectedNames.join())
check(
  'isCuisineId 白名单行为正确（chuan ✓ / nongxiang ✗ / shaokao ✗）',
  isCuisineId('chuan') && !isCuisineId('nongxiang') && !isCuisineId('shaokao') && !isCuisineId('') && !isCuisineId(null),
)
check(
  'getCuisine 只解析合法 id，非法 id 返回 undefined（不静默回退）',
  CUISINE_IDS.every((id) => getCuisine(id) === cuisineMap[id]) && getCuisine('nongxiang') === undefined && getCuisine('') === undefined,
)

/* 2. 人格配置 */
section('八大菜系人格配置')
check(
  '每个菜系有人格标签 / 地域 / 介绍 / 欢迎语',
  cuisines.every((c) => c.personalityTag && c.region && c.description && c.greeting && c.greeting.length >= 10),
)
check('每个菜系 >= 3 条推荐问题', cuisines.every((c) => Array.isArray(c.suggestedQuestions) && c.suggestedQuestions.length >= 3 && c.suggestedQuestions.every(Boolean)))
check('每个菜系 >= 4 条知识范围', cuisines.every((c) => Array.isArray(c.knowledge) && c.knowledge.length >= 4))
const prompts = cuisines.map((c) => c.systemPrompt)
check('每个 systemPrompt 都是 > 200 字的完整提示词', prompts.every((p) => typeof p === 'string' && p.length > 200))
check('每个 systemPrompt 都包含自己的菜系名', cuisines.every((c) => c.systemPrompt.includes(c.name)))
check('八个 systemPrompt 互不相同', new Set(prompts).size === 8)
check(
  'systemPrompt 明确「不冒充其他菜系、不切换成独立美食类型」',
  prompts.every((p) => p.includes('不冒充其他菜系') && p.includes('独立美食类型')),
)

/* 3. 代表菜 */
section('代表菜')
check('每个菜系 >= 4 道代表菜', cuisines.every((c) => c.representativeDishes.length >= 4))
check(`全部代表菜共 ${allCuisineDishes.length} 道且 id 全局唯一`, allCuisineDishes.length === cuisines.reduce((n, c) => n + c.representativeDishes.length, 0) && new Set(allCuisineDishes.map((d) => d.id)).size === allCuisineDishes.length)
check('每道代表菜有名称 / 简介 / 占位图标', allCuisineDishes.every((d) => d.name && d.desc && d.emoji))
const missingPhotos = allCuisineDishes.filter((d) => !d.photo || !fs.existsSync(nodePath.join(ROOT, 'public', 'images', 'photos', `${d.photo}.jpg`)))
check('每道代表菜都有照片且文件真实存在', missingPhotos.length === 0, missingPhotos.map((d) => d.name).join('、'))
const badDishChars = allCuisineDishes.filter((d) => d.characterId && !characterMap[d.characterId])
check('代表菜的 characterId 均指向真实角色', badDishChars.length === 0, badDishChars.map((d) => d.id).join('、'))
const missingCuisineImgs = cuisines.filter((c) => {
  const file = (url) => nodePath.join(ROOT, 'public', decodeURIComponent(url.replace(/^\//, '')))
  return !fs.existsSync(file(c.image)) || !fs.existsSync(file(c.fallbackImage))
})
check('菜系主图与备用图文件真实存在', missingCuisineImgs.length === 0, missingCuisineImgs.map((c) => c.id).join('、'))

/* 4. 解析关系 */
section('菜系 → 角色 解析关系')
check('cuisine.characterId（如有）指向真实角色', cuisines.every((c) => !c.characterId || Boolean(characterMap[c.characterId])))
const badRelated = cuisines.filter((c) => relatedCharactersOfCuisine(c).some((ch) => !ch))
check('relatedCharactersOfCuisine 结果无无效角色', badRelated.length === 0, badRelated.map((c) => c.id).join('、'))
check(
  'cuisineOfCharacter 反向解析正确（麻婆豆腐→川菜 / 东坡肉→浙菜 / 江南菜→苏菜）',
  cuisineOfCharacter('mapo')?.id === 'chuan' &&
    cuisineOfCharacter('shuizhuyu')?.id === 'chuan' &&
    cuisineOfCharacter('dongpo')?.id === 'zhe' &&
    cuisineOfCharacter('jiangnan')?.id === 'su' &&
    cuisineOfCharacter('chuan')?.id === 'chuan',
)
check(
  '独立美食类型角色不会被解析成菜系角色（重庆火锅 / 烧烤 / 甜品）',
  cuisineOfCharacter('huoguo') === undefined &&
    cuisineOfCharacter('shaokao') === undefined &&
    cuisineOfCharacter('tianpin') === undefined,
)

/* 5. 口味分类（防错配） */
section('口味分类 · 代言角色')
check('八种口味分类完整且 id 唯一', categories.length === 8 && new Set(categories.map((c) => c.id)).size === 8)
const badFeatured = categories.filter((c) => {
  const featured = featuredCharacterOfCategory(c.id)
  return !featured || featured.categoryId !== c.id
})
check('每个分类的代言角色存在且确实属于该分类', badFeatured.length === 0, badFeatured.map((c) => c.id).join('、'))
check('浓香派代言角色是东坡肉而不是烧烤', featuredCharacterOfCategory('nongxiang')?.id === 'dongpo')
check(
  '分类页主图/主按钮同源（代言角色在成员列表中）',
  categories.every((c) => charactersOfCategory(c.id).some((ch) => ch.id === c.featuredCharacterId)),
)

/* 6. 角色与菜品库 */
section('角色与菜品库')
check(`原有 ${characters.length} 位角色保留、id 唯一、分类合法`, characters.length >= 17 && new Set(characters.map((c) => c.id)).size === characters.length && characters.every((c) => Boolean(categoryMap[c.categoryId])))
const badDishCuisine = dishDatabase.filter((d) => d.cuisineId !== undefined && !isCuisineId(d.cuisineId))
check('菜品库 cuisineId 均为合法菜系 id', badDishCuisine.length === 0, badDishCuisine.map((d) => d.id).join('、'))
const badDishChars2 = dishDatabase.filter((d) => d.characterId && !characterMap[d.characterId])
check('菜品库 characterId 均为真实角色', badDishChars2.length === 0, badDishChars2.map((d) => d.id).join('、'))
const withCuisine = ['chuan', 'yue', 'su', 'zhe', 'xiang']
check(
  `有菜品标注的菜系在库里有真实候选（${withCuisine.join('/')}）`,
  withCuisine.every((id) => dishDatabase.some((d) => d.cuisineId === id)),
)
check(
  '五个独立美食类型保留且角色真实（重庆火锅 / 烧烤 / 面食 / 甜品 / 街头小吃）',
  foodTypeTags.length === 5 &&
    foodTypeTags.map((t) => t.name).join() === '重庆火锅,烧烤,面食,甜品,街头小吃' &&
    foodTypeTags.every((t) => Boolean(characterMap[t.characterId])),
)

await vite.close()

/* 7. 接口冒烟（需 dev server） */
section('接口冒烟（/api/*）')

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

async function readFirstSseFrame(res, timeoutMs = 45_000) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  const timer = setTimeout(() => void reader.cancel().catch(() => {}), timeoutMs)
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      if (buffer.includes('\n\n')) break
    }
  } finally {
    clearTimeout(timer)
    void reader.cancel().catch(() => {})
  }
  return buffer
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
  const bad1 = await fetchJson('/api/cuisine-chat', { cuisineId: 'nongxiang', messages: [{ role: 'user', content: '你好' }] })
  check('菜系聊天：非菜系 id（nongxiang）返回 400 明确错误', bad1.status === 400 && bad1.data?.error === 'unknown cuisine', `status=${bad1.status}`)
  const bad2 = await fetchJson('/api/cuisine-chat', { cuisineId: 'shaokao', messages: [{ role: 'user', content: '你好' }] })
  check('菜系聊天：角色 id（shaokao）不会被当成菜系', bad2.status === 400, `status=${bad2.status}`)
  const bad3 = await fetchJson('/api/cuisine-chat', { cuisineId: 'chuan', messages: [] })
  check('菜系聊天：空消息返回 400', bad3.status === 400, `status=${bad3.status}`)

  const ok = await fetch(`${BASE}/api/cuisine-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cuisineId: 'chuan', messages: [{ role: 'user', content: '川菜是不是只有辣？' }] }),
    signal: AbortSignal.timeout(90_000),
  })
  const contentType = ok.headers.get('content-type') ?? ''
  const frame = ok.status === 200 ? await readFirstSseFrame(ok) : ''
  let frameType = ''
  try {
    frameType = JSON.parse(frame.trim().replace(/^data:\s*/, '')).type
  } catch {
    frameType = ''
  }
  check('菜系聊天：合法 cuisineId 返回 SSE 流（首个数据帧合法）', ok.status === 200 && contentType.includes('text/event-stream') && (frameType === 'delta' || frameType === 'done'), `status=${ok.status} frame=${frameType || frame.slice(0, 40)}`)

  const charReject = await fetchJson('/api/chat', { characterId: 'su', messages: [{ role: 'user', content: '你好' }] })
  check('角色聊天：菜系 id（su）不被当成角色', charReject.status === 400 && charReject.data?.error === 'unknown character', `status=${charReject.status}`)

  const recChuan = await fetchJson('/api/recommend', { cuisine: 'chuan', spicy: 3, budget: 200, minutes: 120, people: 2 })
  const recOk =
    recChuan.status === 200 &&
    Array.isArray(recChuan.data?.results) &&
    recChuan.data.results.length >= 1 &&
    recChuan.data.results.every((item) => dishDatabase.some((d) => d.id === item.id && d.cuisineId === 'chuan'))
  check('推荐：限定川菜时结果全部属于川菜', recOk, `status=${recChuan.status} results=${recChuan.data?.results?.length}`)

  const recLu = await fetchJson('/api/recommend', { cuisine: 'lu', spicy: 3, budget: 200, minutes: 120, people: 2 })
  const recLuOk =
    recLu.status === 200 &&
    Array.isArray(recLu.data?.results) &&
    recLu.data.results.length >= 1 &&
    recLu.data.results.every((item) => dishDatabase.some((d) => d.id === item.id && d.cuisineId === 'lu'))
  check('推荐：限定鲁菜时结果全部属于鲁菜（图鉴已补鲁菜）', recLuOk, `status=${recLu.status} results=${recLu.data?.results?.length}`)

  const recBad = await fetchJson('/api/recommend', { cuisine: 'nongxiang' })
  check('推荐：非法菜系 id 返回 400', recBad.status === 400 && recBad.data?.error === 'unknown cuisine', `status=${recBad.status}`)
}

/* ------------------------------ 汇总 ------------------------------ */

const summary = failures === 0 ? `\n全部通过（${total}/${total}）` : `\n有 ${failures} 项未通过（共 ${total} 项）`
console.log(summary)
logLines.push(summary)

if (process.env.CHECK_LOG) {
  fs.writeFileSync(process.env.CHECK_LOG, logLines.join('\n'), 'utf8')
}

process.exit(failures === 0 ? 0 : 1)
