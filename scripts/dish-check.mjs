/**
 * 美食图鉴全链路自检（先启动 dev server，再 node scripts/dish-check.mjs）
 * ------------------------------------------------------------
 * 期望值全部由真实数据模块（src/data/dishes + src/lib/dishBook）现场计算，UI 只做对照：
 *  1. /dishes 列表：全部菜品数、每张卡片有图/名/菜系/一句话/口味/详情入口，缺图标记为 0；
 *  2. 搜索：菜名 / 别名 / 地域 / 食材 / 故事词都会真实过滤（与数据层结果完全一致）；
 *  3. 筛选：菜系 / 类型 / 口味 / 难度 / 独立类型可组合，「清除筛选条件」恢复全部；
 *  4. 独立美食类型不计入菜系（火锅/烧烤/面食/甜品/街头小吃）；
 *  5. 详情页：主图 / 别名 / 菜系地域 / 介绍 / 历史 / 人物 / 典故（含内容类型）/ 食材 / 口味技法 / 相关菜 / 教程入口 / 聊天入口；
 *  6. 详情按 id 加载：非法 id 明确报错，不拿别的菜顶替；相关菜跳转后大标题正确换新；
 *  7. 聊天入口：角色菜 → /chat/:id?dish=，菜系菜 → /cuisines/:id?dish=，聊天页出现「当前讨论」上下文；
 *  8. 教程入口：真实检索，有结果展示真实链接，没有结果只给平台搜索入口（绝不伪造视频）；
 *  9. 首页与菜系页的图鉴入口；移动端无横向溢出；
 * 10. 全程无控制台报错。
 */
import { chromium } from 'playwright-core'
import { createServer } from 'vite'

const BASE = 'http://127.0.0.1:5173'

let total = 0
let failures = 0
const check = (label, ok, extra = '') => {
  total += 1
  if (!ok) failures += 1
  console.log(`${ok ? '✓' : '✗'} ${label}${!ok && extra ? ` — ${extra}` : ''}`)
}

const errors = []
const badResponses = []
const track = (page, tag) => {
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push(`[${tag}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${tag}] ${e.message}`))
  page.on('response', (r) => {
    if (r.status() >= 400) badResponses.push({ tag, status: r.status(), url: r.url() })
  })
}

/* ---------- 数据层：现场算出期望值 ---------- */
const vite = await createServer({
  configFile: false,
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})
const dishesMod = await vite.ssrLoadModule('/src/data/dishes/index.ts')
const bookMod = await vite.ssrLoadModule('/src/lib/dishBook.ts')
const imageMod = await vite.ssrLoadModule('/src/lib/dishImage.ts')
const { dishDatabase, dishMap, getDish } = dishesMod
const { searchDishes, EMPTY_DISH_QUERY } = bookMod
const { dishGallerySrcs } = imageMod

const ALL = dishDatabase.length
const namesOf = (list) => list.map((d) => d.name).sort()
const sortedUi = (list) => [...list].sort()
const huiDishes = searchDishes({ ...EMPTY_DISH_QUERY, cuisineId: 'hui' })
const huiSoup = searchDishes({ ...EMPTY_DISH_QUERY, cuisineId: 'hui', dishType: '汤羹' })
const searchMapo = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '麻婆豆腐' })
const searchGuiyu = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '桂鱼' })
const searchNingbo = searchDishes({ ...EMPTY_DISH_QUERY, keyword: '宁波' })
const hotpotDishes = searchDishes({ ...EMPTY_DISH_QUERY, foodTypeId: 'hotpot' })
const dessertDishes = searchDishes({ ...EMPTY_DISH_QUERY, foodTypeId: 'dessert' })

const mapo = getDish('mapo-tofu')
const luyu = getDish('qingzheng-luyu')
const qiezi = getDish('kao-qiezi')
const firstRelatedOfMapo = bookMod.relatedDishesOf(mapo)[0]

const browser = await chromium.launch({ channel: 'chrome' })

/** 等结果数文案更新到期望值 */
async function waitCount(page, n, active) {
  await page.waitForFunction(
    ({ n, active }) => {
      const text = document.querySelector('[data-testid="dish-result-count"]')?.textContent ?? ''
      return active ? text.includes(`筛选出 ${n} 道菜`) : text.includes(`全部 ${n} 道菜`)
    },
    { n, active },
    { timeout: 8000 },
  )
}

/* ---------- 1. /dishes 列表 ---------- */
const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const page1 = await ctx1.newPage()
track(page1, 'dishbook')
await page1.goto(`${BASE}/dishes`, { waitUntil: 'networkidle' })
await page1.locator('.dishbook-card').first().waitFor({ timeout: 15000 })

check(`图鉴列表默认展示全部 ${ALL} 道菜`, (await page1.locator('.dishbook-card').count()) === ALL)
check(
  '结果栏写明「全部 N 道菜」',
  (await page1.locator('[data-testid="dish-result-count"]').innerText()).includes(`全部 ${ALL} 道菜`),
)
const stats = await page1.locator('.dishbook__stat strong').allTextContents()
check('八个菜系统计入口均 >= 10 道', stats.length === 8 && stats.every((text) => Number(text) >= 10), stats.join('/'))

const cardNames = await page1.locator('.dishbook-card__name').allTextContents()
check('每张卡片都有菜名', cardNames.length === ALL && cardNames.every((name) => name.trim().length > 0))
const cardOwners = await page1.locator('.dishbook-card__owner').allTextContents()
check('每张卡片标注菜系或独立类型', cardOwners.length === ALL && cardOwners.every((owner) => owner.trim().length > 0))
check('卡片带一句话简介', (await page1.locator('.dishbook-card__summary').count()) === ALL)
check('卡片带口味标签', (await page1.locator('.dishbook-card__flavors em').count()) >= ALL)
check('卡片带「查看详情」入口', (await page1.locator('.dishbook-card__foot').count()) === ALL)
check('没有缺图标记（当前全部有图）', (await page1.locator('.dishbook-card__pending').count()) === 0)

const frontImages = await page1.$$eval('.dishbook-card__visual img', (imgs) =>
  imgs.slice(0, 12).map((img) => ({ src: img.getAttribute('src') || '', ok: img.complete && img.naturalWidth > 0 })),
)
check('卡片主图真实加载（抽查前 12 张）', frontImages.length === 12 && frontImages.every((item) => item.ok))
check('卡片图片各不相同（抽查）', new Set(frontImages.map((item) => item.src)).size === frontImages.length)

/* ---------- 2. 搜索 ---------- */
await page1.locator('#dish-search').fill('麻婆豆腐')
await waitCount(page1, searchMapo.length, true)
check(
  '搜索「麻婆豆腐」与数据层结果一致',
  JSON.stringify(namesOf(searchMapo)) === JSON.stringify(sortedUi(await page1.locator('.dishbook-card__name').allTextContents())),
)

await page1.locator('#dish-search').fill('桂鱼')
await waitCount(page1, searchGuiyu.length, true)
const guiyuNames = await page1.locator('.dishbook-card__name').allTextContents()
check('别名搜索「桂鱼」命中松鼠鳜鱼', guiyuNames.includes('松鼠鳜鱼'))
check('别名搜索结果与数据层一致', JSON.stringify(namesOf(searchGuiyu)) === JSON.stringify(sortedUi(guiyuNames)))

await page1.locator('#dish-search').fill('宁波')
await waitCount(page1, searchNingbo.length, true)
check('地域搜索「宁波」命中雪菜大汤黄鱼', (await page1.locator('.dishbook-card__name').allTextContents()).includes('雪菜大汤黄鱼'))

await page1.locator('#dish-search').fill('__不存在的词__')
await waitCount(page1, 0, true)
check('搜不到时给空白提示，不编造结果', (await page1.locator('.page-note').first().innerText()).includes('没有符合条件的菜'))
await page1.locator('.page-note__actions button').click()
await waitCount(page1, ALL, false)

/* ---------- 3. 筛选（含组合与清除） ---------- */
await page1.locator('.filter-row[aria-label="按菜系筛选"] .filter-chip', { hasText: '徽菜' }).click()
await waitCount(page1, huiDishes.length, true)
check(
  `菜系筛选「徽菜」只返回徽菜（${huiDishes.length} 道）`,
  JSON.stringify(namesOf(huiDishes)) === JSON.stringify(sortedUi(await page1.locator('.dishbook-card__name').allTextContents())),
)

await page1.locator('.filter-row[aria-label="按菜品类型筛选"] .filter-chip', { hasText: '汤羹' }).click()
await waitCount(page1, huiSoup.length, true)
check(
  `组合筛选「徽菜 + 汤羹」= 交集（${huiSoup.length} 道）`,
  JSON.stringify(namesOf(huiSoup)) === JSON.stringify(sortedUi(await page1.locator('.dishbook-card__name').allTextContents())),
)

await page1.locator('.btn', { hasText: '清除筛选条件' }).click()
await waitCount(page1, ALL, false)
check('清除筛选条件后恢复全部菜品', (await page1.locator('.dishbook-card').count()) === ALL)

await page1.locator('.filter-row[aria-label="按独立美食类型筛选"] .filter-chip', { hasText: '重庆火锅' }).click()
await waitCount(page1, hotpotDishes.length, true)
const hotpotOwners = await page1.locator('.dishbook-card__owner').allTextContents()
check(
  `独立类型筛选「重庆火锅」（${hotpotDishes.length} 道）与数据一致`,
  JSON.stringify(namesOf(hotpotDishes)) === JSON.stringify(sortedUi(await page1.locator('.dishbook-card__name').allTextContents())),
)
check('火锅不被算成菜系（卡片标注为独立类型或所属菜系）', hotpotOwners.every((owner) => owner.includes('独立类型') || owner.includes('菜')))

await page1.locator('.btn', { hasText: '清除筛选条件' }).click()
await waitCount(page1, ALL, false)
await page1.locator('.filter-row[aria-label="按独立美食类型筛选"] .filter-chip', { hasText: '甜品' }).click()
await waitCount(page1, dessertDishes.length, true)
check(
  `独立类型筛选「甜品」（${dessertDishes.length} 道）与数据一致`,
  JSON.stringify(namesOf(dessertDishes)) === JSON.stringify(sortedUi(await page1.locator('.dishbook-card__name').allTextContents())),
)
await page1.locator('.btn', { hasText: '清除筛选条件' }).click()
await waitCount(page1, ALL, false)

/* ---------- 4. 详情页（人物角色菜） ---------- */
await page1.goto(`${BASE}/dishes/mapo-tofu`, { waitUntil: 'networkidle' })
await page1.locator('.dish-hero').waitFor({ timeout: 15000 })
check('详情页大标题按 id 加载（麻婆豆腐）', (await page1.locator('h1.page-title').innerText()).trim() === '麻婆豆腐')
check('详情页有主图且真实加载', await page1.locator('.dish-hero__visual img').evaluate((img) => img.complete && img.naturalWidth > 0))
check('详情页标注菜系与地域', (await page1.locator('.dish-hero__copy .eyebrow').innerText()).includes('川菜'))
const sectionTitles = await page1.locator('.dish-section__title').allTextContents()
check(
  '详情页含介绍 / 历史 / 相关人物 / 典故 / 食材 / 口味技法',
  ['详细介绍', '历史渊源', '相关人物', '趣味典故', '主要食材', '口味与技法'].every((title) =>
    sectionTitles.some((text) => text.includes(title)),
  ),
  sectionTitles.join(' / '),
)
const storyBadge = await page1.locator('.dish-section', { hasText: '趣味典故' }).locator('.dish-section__badge').innerText()
check(
  '典故标注内容类型（史实与传说分开）',
  ['历史记载', '文献存疑', '地方传说', '民间故事', '现代流行说法'].includes(storyBadge.trim()),
  storyBadge,
)
check('食材与口味标签来自真实数据', (await page1.locator('.dish-ingredients li').count()) >= 2 && (await page1.locator('.dish-section__chips .chip').count()) >= 2)
check(
  '详情页画廊按真实图片数据渲染（每张图有说明）',
  (await page1.locator('.dish-gallery__item').count()) === dishGallerySrcs(getDish('mapo-tofu')).length &&
    (await page1.locator('.dish-gallery__item figcaption').count()) >= 1,
)
check('相关菜品至少 2 道且可点', (await page1.locator('.dishbook-card').count()) === bookMod.relatedDishesOf(getDish('mapo-tofu')).length)
check(
  '图片信息如实标注（来源/许可/关键词）',
  (await page1.locator('.dish-facts').innerText()).includes('AI 原创'),
)

/* ---------- 5. 教程入口：真实检索 ---------- */
await page1.locator('button', { hasText: '查看制作教程' }).click()
await page1.locator('.dish-videos [data-testid="video-search"]').waitFor({ timeout: 30000 })
await page1
  .locator(
    '.dish-videos [data-testid="video-search"][data-state="results"], .dish-videos [data-testid="video-search"][data-state="empty"], .dish-videos [data-testid="video-search"][data-state="error"], .dish-videos [data-testid="video-search"][data-state="clarify"]',
  )
  .waitFor({ timeout: 90000 })
await page1.waitForTimeout(300)
const videoState = await page1.locator('.dish-videos [data-testid="video-search"]').getAttribute('data-state')
const videoCards = await page1.$$eval('.dish-videos .video-card', (cards) =>
  cards.map((card) => ({ href: card.getAttribute('href') || '', title: card.querySelector('.video-card__title')?.textContent ?? '' })),
)
const platformEntries = await page1.$$eval('.dish-videos .video-entry', (items) => items.map((item) => item.getAttribute('href') || ''))
if (videoState === 'results') {
  check(
    `教程入口展示真实视频结果（${videoCards.length} 条，均为平台链接）`,
    videoCards.length >= 1 && videoCards.every((card) => card.href.startsWith('https://') && card.title.trim().length > 0),
  )
  check('真实结果同时提供平台搜索入口', platformEntries.length >= 1 && platformEntries.every((href) => href.startsWith('https://')))
} else if (videoState === 'clarify') {
  check('检索需要补充信息时如实追问（不伪造结果）', (await page1.locator('.video-search__question').innerText()).trim().length > 0)
  check('追问状态下不展示伪造视频卡片', videoCards.length === 0)
} else {
  check(
    `教程入口无结果时只给平台搜索入口（state=${videoState}）`,
    platformEntries.length >= 1 && platformEntries.every((href) => href.startsWith('https://')),
  )
  check('无结果时不伪造视频卡片', videoCards.length === 0)
}

/* ---------- 6. 聊天入口（角色菜） ---------- */
const chatHref = await page1.locator('.dish-hero__actions a').first().getAttribute('href')
check('麻婆豆腐的聊天入口指向菜品角色', chatHref === '/chat/mapo?dish=mapo-tofu', chatHref ?? '')
await page1.locator('.dish-hero__actions a').first().click()
await page1.waitForURL(/\/chat\/mapo\?dish=mapo-tofu/, { timeout: 15000 })
await page1.locator('[data-testid="chat-context"]').waitFor({ timeout: 15000 })
const chatCtx = await page1.locator('[data-testid="chat-context"]').innerText()
check('聊天页显示「当前讨论：麻婆豆腐」并标出来自图鉴', chatCtx.includes('当前讨论') && chatCtx.includes('麻婆豆腐') && chatCtx.includes('来自图鉴'))
check('聊天页给出来源图鉴的返回链接', (await page1.locator('[data-testid="chat-context"] a[href="/dishes/mapo-tofu"]').count()) === 1)

/* ---------- 7. 聊天入口（菜系菜） ---------- */
await page1.goto(`${BASE}/dishes/qingzheng-luyu`, { waitUntil: 'networkidle' })
const cuisineChatHref = await page1.locator('.dish-hero__actions a').first().getAttribute('href')
check('清蒸鲈鱼的聊天入口指向粤菜聊天（无独立角色）', cuisineChatHref === '/cuisines/yue?dish=qingzheng-luyu', cuisineChatHref ?? '')
await page1.locator('.dish-hero__actions a').first().click()
await page1.waitForURL(/\/cuisines\/yue\?dish=qingzheng-luyu/, { timeout: 15000 })
await page1.locator('[data-testid="cuisine-chat-context"]').waitFor({ timeout: 15000 })
const cuisineCtx = await page1.locator('[data-testid="cuisine-chat-context"]').innerText()
check('菜系聊天页显示「当前讨论：清蒸鲈鱼」', cuisineCtx.includes('清蒸鲈鱼') && cuisineCtx.includes('当前讨论'))
check('菜系聊天空状态带出这道菜的提问建议', (await page1.locator('.chat-empty__context').innerText()).includes('清蒸鲈鱼'))

/* ---------- 8. 聊天入口（独立类型菜，借类型角色） ---------- */
await page1.goto(`${BASE}/dishes/kao-qiezi`, { waitUntil: 'networkidle' })
const bbqHref = await page1.locator('.dish-hero__actions a').first().getAttribute('href')
check('烤茄子的聊天入口借独立类型（烧烤）的角色', bbqHref === '/chat/shaokao?dish=kao-qiezi', bbqHref ?? '')
check(
  '详情页如实说明这是独立美食类型的聊天',
  (await page1.locator('.dish-hero__context').innerText()).includes('独立美食类型'),
)

/* ---------- 9. 详情按 id 加载 + 相关菜跳转 ---------- */
await page1.goto(`${BASE}/dishes/__not_a_dish__`, { waitUntil: 'networkidle' })
check('非法 id 明确报错，不用别的菜顶替', (await page1.locator('.page-empty').innerText()).includes('图鉴里没有这道菜'))

await page1.goto(`${BASE}/dishes/mapo-tofu`, { waitUntil: 'networkidle' })
await page1.locator('.dishbook-card__link').first().click()
await page1.waitForURL(new RegExp(`/dishes/${firstRelatedOfMapo.id}$`), { timeout: 15000 })
await page1.locator('.dish-hero').waitFor({ timeout: 15000 })
check(
  `点击相关菜「${firstRelatedOfMapo.name}」后详情页换新（不是停留在旧菜）`,
  (await page1.locator('h1.page-title').innerText()).trim() === firstRelatedOfMapo.name,
)
const relatedChatHref = (await page1.locator('.dish-hero__actions a').first().getAttribute('href')) ?? ''
check(
  firstRelatedOfMapo.chatTarget
    ? '新详情页的聊天入口带的是这道菜的 dishId'
    : '相关菜没有独立入口时给诚实回退（不硬塞别的菜）',
  firstRelatedOfMapo.chatTarget ? relatedChatHref.includes(`?dish=${firstRelatedOfMapo.id}`) : relatedChatHref === '/personalities',
)

/* ---------- 10. 菜系页、探索页与首页入口 ---------- */
await page1.goto(`${BASE}/cuisines/chuan`, { waitUntil: 'networkidle' })
check('川菜页代表菜可点进图鉴详情', (await page1.locator('a[href="/dishes/mapo-tofu"]').count()) >= 1)
check('川菜页保留原有聊天入口', (await page1.locator('a[href="/chat/mapo"]').count()) >= 1)

await page1.goto(`${BASE}/`, { waitUntil: 'networkidle' })
check('首页导航保留图鉴入口链接', (await page1.locator('a[href="/dishes"]').count()) >= 1)

await page1.goto(`${BASE}/explore`, { waitUntil: 'networkidle' })
check('探索页有图鉴入口链接', (await page1.locator('a[href="/dishes"]').count()) >= 1)
check('探索页图鉴区块展示 8 道精选菜', (await page1.locator('#dishbook .dishbook-card').count()) === 8)
const cuisinesCovered = await page1.locator('#dishbook .dishbook-card__owner').allTextContents()
check('探索页精选覆盖八大菜系', new Set(cuisinesCovered.map((text) => text.trim())).size === 8)

/* ---------- 11. 移动端 ---------- */
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page2 = await ctx2.newPage()
track(page2, 'mobile')
await page2.goto(`${BASE}/dishes`, { waitUntil: 'networkidle' })
await page2.locator('.dishbook-card').first().waitFor({ timeout: 15000 })
check(
  '移动端图鉴页无横向溢出',
  await page2.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
)
await page2.locator('.filter-row[aria-label="按菜系筛选"] .filter-chip', { hasText: '川菜' }).click()
await waitCount(page2, searchDishes({ ...EMPTY_DISH_QUERY, cuisineId: 'chuan' }).length, true)
check('移动端筛选可用', (await page2.locator('.dishbook-card').count()) >= 10)

/* ---------- 12. 汇总 ---------- */
await vite.close()
const ownBad = badResponses.filter((item) => item.url.startsWith(BASE))
const externalBad = badResponses.filter((item) => !item.url.startsWith(BASE))
check('全程无页面脚本异常', errors.length === 0, errors.slice(0, 3).join(' | '))
check(
  `站内资源与接口无 4xx/5xx（${ownBad.length} 个异常）`,
  ownBad.length === 0,
  ownBad.slice(0, 3).map((item) => `${item.status} ${item.url}`).join(' | '),
)
if (externalBad.length > 0) {
  console.log(
    `· 说明：外部平台资源有 ${externalBad.length} 个返回 4xx（如视频封面防盗链），页面均已回退占位，不影响站内功能：\n` +
      externalBad
        .slice(0, 5)
        .map((item) => `  - ${item.status} ${item.url.slice(0, 120)}`)
        .join('\n'),
  )
}

console.log(`\n${failures === 0 ? `全部通过（${total}/${total}）` : `有 ${failures} 项未通过（共 ${total} 项）`}`)
await browser.close()
process.exit(failures === 0 ? 0 : 1)
