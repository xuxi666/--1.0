/**
 * 做菜视频搜索 · 全链路自检（Playwright）
 * ------------------------------------------------------------
 * 前置：dev server 已启动（默认 http://127.0.0.1:5173），系统有 Chrome。
 * 覆盖：
 *  1. 角色聊天页「帮我找相关视频」按钮 → 真实检索（B 站）→ 结果卡片可点击；
 *  2. 卡片链接白名单校验 / target=_blank / rel=noopener；
 *  3. 语言触发（「只找B站的视频」）平台限定生效；
 *  4. 刷新后结果仍在（本地持久化），角色不会被切换；
 *  5. 菜系聊天：搜索视频不切换聊天对象、菜系之间上下文隔离；
 *  6. 空结果 / 缺字段（无封面作者时长）/ 不可信链接 / 请求失败 的 UI 降级（route mock，确定性）；
 *  7. 移动端无横向溢出；
 *  8. 全程无 JS 运行时错误。
 * 用法：node scripts/video-check.mjs
 */
import { chromium } from 'playwright-core'

const BASE = 'http://127.0.0.1:5173'

let failures = 0
const check = (label, ok, extra = '') => {
  console.log(`${ok ? '✓' : '✗'} ${label}${!ok && extra ? ` — ${extra}` : ''}`)
  if (!ok) failures += 1
}
const errors = []
const track = (page, tag) => {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${tag}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${tag}] ${e.message}`))
}

const ALLOWED_HOSTS = new Set(['www.bilibili.com', 'bilibili.com', 'm.bilibili.com'])

const GLOBAL_TIMEOUT = 40_000
const browser = await chromium.launch({ channel: 'chrome' })

async function waitVideoState(page, scopeSelector, index = -1) {
  await page.waitForFunction(
    ({ scope, idx }) => {
      const nodes = document.querySelectorAll(`${scope} [data-testid="video-search"]`)
      const node = idx === -1 ? nodes[nodes.length - 1] : nodes[idx]
      if (!node) return false
      const state = node.getAttribute('data-state')
      return state && state !== 'loading'
    },
    { scope: scopeSelector, idx: index },
    { timeout: GLOBAL_TIMEOUT },
  )
}

/* ---------- 准备 mock 数据（用于确定性 UI 降级检查） ---------- */

const makeBundle = (overrides = {}) => ({
  status: 'done',
  note: '已在哔哩哔哩实时检索到 1 条相关视频。搜索关键词：测试菜 家常做法。',
  query: '测试菜',
  keywords: ['测试菜 家常做法'],
  results: [
    {
      id: 'bilibili-BV1xx411c7mD',
      title: '测试菜 家常做法完整教程',
      platform: 'bilibili',
      url: 'https://www.bilibili.com/video/BV1xx411c7mD',
      sourceType: 'video',
    },
  ],
  entries: [
    {
      id: 'bilibili-entry',
      title: '在哔哩哔哩搜索更多',
      platform: 'bilibili',
      url: 'https://search.bilibili.com/all?keyword=test',
      sourceType: 'search-entry',
    },
    {
      id: 'douyin-entry',
      title: '在抖音搜索更多',
      platform: 'douyin',
      url: 'https://www.douyin.com/search/test',
      sourceType: 'search-entry',
    },
    {
      id: 'xiaohongshu-entry',
      title: '在小红书搜索更多',
      platform: 'xiaohongshu',
      url: 'https://www.xiaohongshu.com/search_result?keyword=test',
      sourceType: 'search-entry',
    },
    {
      id: 'xigua-entry',
      title: '在西瓜视频搜索更多',
      platform: 'xigua',
      url: 'https://www.ixigua.com/search/test/',
      sourceType: 'search-entry',
    },
  ],
  providers: [{ platform: 'bilibili', status: 'ok', count: 1 }],
  took: 100,
  searchedAt: Date.now(),
  sourceText: '',
  ...overrides,
})

/* ---------- 1. 桌面：角色聊天页真实检索 ---------- */

const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
track(page, 'chat')
await page.goto(`${BASE}/chat/mapo`, { waitUntil: 'networkidle' })

const quickbar = page.locator('.chat-quickbar__video')
check('聊天页有「帮我找相关视频」按钮', (await quickbar.count()) === 1 && (await quickbar.innerText()).includes('帮我找相关视频'))

// 给首次真实请求加 700ms 延迟，让「检索中」状态可稳定观察（route.continue 仍是真实请求）
let delayNextSearch = true
await page.route('**/api/videos/search', async (route) => {
  if (delayNextSearch) {
    delayNextSearch = false
    await new Promise((resolve) => setTimeout(resolve, 700))
  }
  await route.continue()
})
await quickbar.click()
const loadingSeen = await page
  .locator('[data-testid="video-search"][data-state="loading"]')
  .waitFor({ timeout: 3000 })
  .then(() => true)
  .catch(() => false)
check('点击后出现「检索中」状态块', loadingSeen)

await waitVideoState(page, '.chat-main')
const state1 = await page.locator('.chat-main [data-testid="video-search"]').last().getAttribute('data-state')
check('真实检索完成并展示结果（B 站可用）', state1 === 'results', `data-state=${state1}`)

const cards = page.locator('.chat-main [data-testid="video-card"]')
const cardCount = await cards.count()
check('至少渲染 1 张真实视频卡片', cardCount >= 1, `count=${cardCount}`)

const cardInfo = await cards.evaluateAll((nodes) =>
  nodes.map((node) => ({
    href: node.getAttribute('href') ?? '',
    target: node.getAttribute('target') ?? '',
    rel: node.getAttribute('rel') ?? '',
    platform: node.getAttribute('data-platform') ?? '',
    hasCta: Boolean(node.querySelector('.video-card__cta')),
  })),
)
check(
  '卡片链接全部指向 B 站白名单域名',
  cardInfo.length > 0 && cardInfo.every((item) => item.platform === 'bilibili' && ALLOWED_HOSTS.has(new URL(item.href).hostname)),
  cardInfo.map((item) => item.href).slice(0, 3).join(' '),
)
check('卡片以新标签页安全方式打开（target=_blank + rel=noopener）', cardInfo.every((item) => item.target === '_blank' && item.rel.includes('noopener')))
check('卡片有「观看视频」入口', cardInfo.every((item) => item.hasCta))

const entriesCount1 = await page.locator('.chat-main [data-testid="video-entry"]').count()
check('提供平台搜索入口（4 个平台）', entriesCount1 === 4, `count=${entriesCount1}`)

const headText = await page.locator('.chat-main .chat-head h1').innerText()
check('视频搜索不会切换当前角色（仍是麻婆豆腐）', headText.includes('麻婆豆腐') && page.url().endsWith('/chat/mapo'))

const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('fs-chat-mapo') || '[]'))
const storedVideo = stored.find((m) => m.video && m.video.results && m.video.results.length > 0)
check('搜索结果已写入本地历史（含真实结果）', Boolean(storedVideo) && storedVideo.video.status === 'done')
check('触发消息未被当成普通对话发给模型（本地记录为视频消息）', stored.some((m) => m.role === 'user' && m.content.includes('帮我找相关视频')))

await page.reload({ waitUntil: 'networkidle' })
await waitVideoState(page, '.chat-main')
const stateAfterReload = await page.locator('.chat-main [data-testid="video-search"]').last().getAttribute('data-state')
check('刷新后视频结果仍在（本地持久化）', stateAfterReload === 'results')
check('刷新后角色不变', (await page.locator('.chat-main .chat-head h1').innerText()).includes('麻婆豆腐'))
await page.screenshot({ path: 'shots/video-chat-desktop.png' })

/* ---------- 2. 语言触发 + 平台限定 ---------- */

await page.fill('.chat-main textarea', '只找B站的视频')
await page.click('.chat-composer button[type="submit"]')
await waitVideoState(page, '.chat-main', 1)
const state2 = await page.locator('.chat-main [data-testid="video-search"]').nth(1).getAttribute('data-state')
check('语言指定「只找B站」也能触发真实检索', state2 === 'results', `data-state=${state2}`)
const block2 = page.locator('.chat-main .msg').filter({ has: page.locator('[data-testid="video-search"]') }).nth(1)
const platform2 = await block2.locator('[data-testid="video-card"]').evaluateAll((nodes) => [...new Set(nodes.map((n) => n.getAttribute('data-platform')))])
check('限定平台后结果只来自 B 站', platform2.length === 1 && platform2[0] === 'bilibili', platform2.join())
const entries2 = await block2.locator('[data-testid="video-entry"]').count()
check('限定平台后搜索入口也只有 B 站', entries2 === 1, `count=${entries2}`)

const assistantTexts = await page.locator('.chat-main .msg--assistant .msg__bubble').allInnerTexts()
check('没有任何 AI 文本谎称「我已经为你找到视频」', assistantTexts.every((text) => !text.includes('我已经为你找到')))
check('视频块带有「站内视频搜索」真实结果标识', (await page.locator('.chat-main .video-search__badge').first().innerText()).includes('站内视频搜索'))
await ctx.close()

/* ---------- 3. 菜系聊天：搜索不换人、菜系间隔离 ---------- */

const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 940 }, deviceScaleFactor: 2 })
const page2 = await ctx2.newPage()
track(page2, 'cuisine')
await page2.goto(`${BASE}/cuisines/chuan`, { waitUntil: 'networkidle' })

await page2.fill('.cuisine-chat textarea', '帮我找鱼香肉丝的做法视频')
await page2.click('.cuisine-chat .chat-composer button[type="submit"]')
await waitVideoState(page2, '.cuisine-chat')
const state3 = await page2.locator('.cuisine-chat [data-testid="video-search"]').last().getAttribute('data-state')
check('菜系聊天里搜索视频返回真实结果', state3 === 'results', `data-state=${state3}`)
const chuanTitle = await page2.locator('.cuisine-chat__titles h2').innerText()
check('搜索视频不会切换菜系聊天对象（仍是川菜）', chuanTitle.includes('川菜'))
const chuanStored = await page2.evaluate(() => JSON.parse(localStorage.getItem('fs-cuisine-chat-chuan') || '[]'))
check('川菜聊天记录写入独立存储键', chuanStored.some((m) => m.video && m.video.results.length > 0))
check('川菜聊天存储未串入角色聊天键', (await page2.evaluate(() => localStorage.getItem('fs-chat-chuan'))) === null)

await page2.goto(`${BASE}/cuisines/yue`, { waitUntil: 'networkidle' })
check('粤菜聊天区为空（不串川菜上下文）', (await page2.locator('.cuisine-chat .chat-empty').count()) === 1)
check('粤菜聊天无视频结果泄漏', (await page2.locator('.cuisine-chat [data-testid="video-search"]').count()) === 0)

await page2.goto(`${BASE}/cuisines/chuan`, { waitUntil: 'networkidle' })
await waitVideoState(page2, '.cuisine-chat')
check('回到川菜页视频结果仍在（持久化）', (await page2.locator('.cuisine-chat [data-testid="video-search"]').last().getAttribute('data-state')) === 'results')
await page2.screenshot({ path: 'shots/video-cuisine.png' })
await ctx2.close()

/* ---------- 4. 确定性 UI 降级（route mock） ---------- */

const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 940 }, deviceScaleFactor: 2 })
const page3 = await ctx3.newPage()
track(page3, 'mock')
let retryHits = 0
await page3.route('**/api/videos/search', async (route) => {
  const body = route.request().postData() ?? ''
  const fulfill = (payload, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(payload) })

  if (body.includes('空结果测试')) {
    return fulfill(makeBundle({
      note: '这次没有检索到合适的单个视频。换个关键词试试，或直接用下面的平台搜索入口。',
      results: [],
      providers: [{ platform: 'bilibili', status: 'empty', count: 0 }],
    }))
  }
  if (body.includes('缺字段测试')) {
    return fulfill(makeBundle({
      results: [
        {
          id: 'bilibili-BV1xx411c7mE',
          title: '没有任何可选字段的视频条目（无封面无作者无时长）',
          platform: 'bilibili',
          url: 'https://www.bilibili.com/video/BV1xx411c7mE',
          sourceType: 'video',
        },
        {
          id: 'evil-1',
          title: '不可信来源伪造的视频',
          platform: 'bilibili',
          url: 'https://evil.example.com/fake-video',
          sourceType: 'video',
        },
      ],
      entries: [
        { id: 'bilibili-entry', title: '在哔哩哔哩搜索更多', platform: 'bilibili', url: 'https://search.bilibili.com/all?keyword=test', sourceType: 'search-entry' },
        { id: 'evil-entry', title: '伪造入口', platform: 'douyin', url: 'https://evil.example.com/search', sourceType: 'search-entry' },
      ],
    }))
  }
  if (body.includes('失败测试')) {
    retryHits += 1
    return fulfill({ error: '平台全部不可用（测试）' }, 500)
  }
  return fulfill(makeBundle())
})

await page3.goto(`${BASE}/chat/hongshaorou`, { waitUntil: 'networkidle' })

// 4.1 空结果
await page3.fill('.chat-main textarea', '帮我找空结果测试的视频')
await page3.click('.chat-composer button[type="submit"]')
await waitVideoState(page3, '.chat-main')
let state4 = await page3.locator('.chat-main [data-testid="video-search"]').last().getAttribute('data-state')
check('空结果显示诚实空状态（data-state=empty）', state4 === 'empty', `data-state=${state4}`)
check('空状态仍给出 4 个平台搜索入口', (await page3.locator('.chat-main [data-testid="video-entry"]').count()) === 4)
check('空状态提供「重试搜索」', (await page3.locator('.chat-main [data-state="empty"] .video-search__retry').count()) === 1)

// 4.2 缺字段 + 不可信链接
await page3.fill('.chat-main textarea', '帮我找缺字段测试的视频')
await page3.click('.chat-composer button[type="submit"]')
await waitVideoState(page3, '.chat-main', 1)
const block3 = page3.locator('.chat-main .msg').filter({ has: page3.locator('[data-testid="video-search"]') }).nth(1)
check('缺封面/作者/时长时卡片正常渲染', (await block3.locator('[data-testid="video-card"]').count()) === 1)
check('无封面时显示占位图而非报错', (await block3.locator('.video-card__cover-fallback').count()) === 1)
check('缺失的作者/时长不显示（不伪造）', (await block3.locator('.video-card__author').count()) === 0 && (await block3.locator('.video-card__duration').count()) === 0)
check('不可信域名（evil.example.com）的假视频不会被渲染', (await page3.locator('a[href*="evil.example"]').count()) === 0)
check('伪造的平台入口也被过滤', (await block3.locator('[data-testid="video-entry"]').count()) === 1)

// 4.3 请求失败
await page3.fill('.chat-main textarea', '帮我找失败测试的视频')
await page3.click('.chat-composer button[type="submit"]')
await waitVideoState(page3, '.chat-main', 2)
const block4 = page3.locator('.chat-main .msg').filter({ has: page3.locator('[data-testid="video-search"]') }).nth(2)
check('请求失败时显示错误状态与说明', (await block4.locator('[data-state="error"]').count()) === 1 && (await block4.innerText()).includes('暂时不可用'))
check('请求失败时仍提供平台搜索入口', (await block4.locator('[data-testid="video-entry"]').count()) === 4)
check('请求失败时提供重试按钮', (await block4.locator('.video-search__retry').count()) === 1)
const hitsBefore = retryHits
await block4.locator('.video-search__retry').click()
await page3.waitForTimeout(800)
check('点击重试会重新发起搜索请求', retryHits > hitsBefore, `before=${hitsBefore} after=${retryHits}`)
await ctx3.close()

/* ---------- 5. 移动端 ---------- */

const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page4 = await ctx4.newPage()
track(page4, 'mobile')
await page4.route('**/api/videos/search', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(makeBundle({
      results: [
        {
          id: 'bilibili-BV1xx411c7mF',
          title: '这是一个非常非常长的视频标题，用来验证移动端不会横向溢出，标题需要合理换行或者截断显示，保证布局稳定',
          platform: 'bilibili',
          url: 'https://www.bilibili.com/video/BV1xx411c7mF',
          author: '很长的作者名称测试',
          duration: 3723,
          sourceType: 'video',
        },
        {
          id: 'bilibili-BV1xx411c7mG',
          title: '第二条视频',
          platform: 'bilibili',
          url: 'https://www.bilibili.com/video/BV1xx411c7mG',
          sourceType: 'video',
        },
        {
          id: 'bilibili-BV1xx411c7mH',
          title: '第三条视频',
          platform: 'bilibili',
          url: 'https://www.bilibili.com/video/BV1xx411c7mH',
          sourceType: 'video',
        },
      ],
    })),
  })
})

await page4.goto(`${BASE}/chat/mapo`, { waitUntil: 'networkidle' })
check('移动端聊天页有找视频按钮', (await page4.locator('.chat-quickbar__video').count()) === 1)
await page4.click('.chat-quickbar__video')
await waitVideoState(page4, '.chat-main')
const mobileMetrics = await page4.evaluate(() => {
  const cards = document.querySelectorAll('[data-testid="video-card"]')
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    cards: cards.length,
    cardWidths: [...cards].map((node) => Math.round(node.getBoundingClientRect().width)),
    overflowCards: [...cards].filter((node) => node.getBoundingClientRect().right > window.innerWidth + 2).length,
  }
})
check('移动端渲染 3 张卡片', mobileMetrics.cards === 3)
check('移动端无横向溢出', mobileMetrics.scrollWidth <= mobileMetrics.innerWidth + 2, JSON.stringify(mobileMetrics))
check('移动端卡片不超出视口', mobileMetrics.overflowCards === 0)
check('移动端显示时长（1:02:03）', (await page4.locator('.video-card__duration').first().innerText()) === '1:02:03')
await page4.screenshot({ path: 'shots/video-chat-mobile.png', fullPage: false })
await ctx4.close()

/* ---------- 6. 汇总 ---------- */

const realErrors = errors.filter((line) => !/Failed to load resource|net::ERR_|favicon/i.test(line))
check('全程无 JS 运行时错误', realErrors.length === 0, realErrors.slice(0, 3).join(' | '))

await browser.close()

const summary = failures === 0 ? `\n全部通过（${failures} 项失败）` : `\n有 ${failures} 项未通过`
console.log(summary)
process.exit(failures === 0 ? 0 : 1)
