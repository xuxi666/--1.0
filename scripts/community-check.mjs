/**
 * 社区局域网同步自检：
 * 1. A 发帖 → 页面出现
 * 2. A 回复 + 点赞 → 成功
 * 3. B（全新浏览器环境，模拟舍友）能看到 A 的帖子、回复并参与
 * 4. A 刷新后能看到 B 的回复与点赞（服务端持久化）
 * 5. 收藏按钮已移除；首页社区区可用
 * 用法：先启动 dev server，再 node scripts/community-check.mjs
 */
import { chromium } from 'playwright-core'

const BASE = 'http://127.0.0.1:5173'
const browser = await chromium.launch({ channel: 'chrome' })
const errors = []
const track = (page, tag) => {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${tag}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${tag}] ${e.message}`))
}

const TITLE = '热点同步测试帖'
const BODY = '这条帖子应当被另一个浏览器（舍友）看到。'
let failures = 0
const check = (label, ok) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`)
  if (!ok) failures += 1
}

/* ---------- A：发布 ---------- */
const ctxA = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const pa = await ctxA.newPage()
track(pa, 'A')
await pa.goto(`${BASE}/community`, { waitUntil: 'networkidle' })
await pa.locator('.composer__nick').fill('测试发布者')
await pa.getByPlaceholder('标题（可选）').fill(TITLE)
await pa.locator('.composer textarea').fill(BODY)
await pa.locator('.composer button[type="submit"]').click()

const cardA = pa.locator('.fs-post', { hasText: TITLE })
await cardA.waitFor({ timeout: 8000 })
check('A 发布后立即可见', true)

/* ---------- A：回复 + 点赞 ---------- */
await cardA.getByLabel('回复').click()
await cardA.locator('.fs-reply-form textarea').fill('发布者的第一条回复')
await cardA.locator('.fs-reply-form button').click()
await cardA.locator('.fs-reply', { hasText: '发布者的第一条回复' }).waitFor({ timeout: 5000 })
check('A 回复成功', true)

await cardA.getByLabel('点赞').click()
await cardA.getByLabel('取消点赞').waitFor({ timeout: 5000 })
check('A 点赞成功', true)

/* ---------- 收藏按钮已移除 ---------- */
const actionCount = await cardA.locator('.fs-action').count()
const iconOnlyCount = await cardA.locator('.fs-post__actions .fs-action--icon').count()
check('动作按钮只剩点赞/回复（收藏已移除）', actionCount === 2 && iconOnlyCount === 0)

/* ---------- B：全新环境，模拟舍友 ---------- */
const ctxB = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const pb = await ctxB.newPage()
track(pb, 'B')
await pb.goto(`${BASE}/community`, { waitUntil: 'networkidle' })
await pb.locator('.composer__nick').fill('隔壁宿舍')
const cardB = pb.locator('.fs-post', { hasText: TITLE })
await cardB.waitFor({ timeout: 8000 })
check('B（新环境）能看到 A 的新帖', true)

await cardB.getByLabel('回复').click()
await cardB.locator('.fs-reply', { hasText: '发布者的第一条回复' }).waitFor({ timeout: 5000 })
check('B 能看到 A 的回复', true)

await cardB.locator('.fs-reply-form textarea').fill('舍友路过，也来一句')
await cardB.locator('.fs-reply-form button').click()
await cardB.locator('.fs-reply', { hasText: '舍友路过，也来一句' }).waitFor({ timeout: 5000 })
check('B 回复成功', true)

await cardB.getByLabel('点赞').click()
await cardB.getByLabel('取消点赞').waitFor({ timeout: 5000 })
check('B 点赞成功', true)

/* ---------- A：刷新后看到 B 的互动 ---------- */
await pa.reload({ waitUntil: 'networkidle' })
const cardA2 = pa.locator('.fs-post', { hasText: TITLE })
await cardA2.waitFor({ timeout: 8000 })
await cardA2.getByLabel('回复').click()
const replyCount = await cardA2.locator('.fs-reply').count()
const likeCount = await cardA2.locator('.fs-action').first().innerText()
check(`A 刷新后回复数 = ${replyCount}（应为 2）`, replyCount === 2)
check(`A 刷新后点赞数 = ${likeCount.trim()}（应为 2）`, likeCount.includes('2'))
const likedState = await cardA2.getByLabel('取消点赞').count()
check('A 的点赞状态在刷新后保留', likedState === 1)

/* ---------- 首页：能看到新帖并回复 ---------- */
await pa.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const homeCard = pa.locator('.community-home .fs-post', { hasText: TITLE })
await homeCard.waitFor({ timeout: 8000 })
check('首页社区区能看到新帖', true)
await homeCard.getByLabel('回复').click()
await homeCard.locator('.fs-reply-form textarea').fill('从首页回的')
await homeCard.locator('.fs-reply-form button').click()
await homeCard.locator('.fs-reply', { hasText: '从首页回的' }).waitFor({ timeout: 5000 })
check('首页可以直接回复', true)

/* ---------- 回到社区页确认首页回复已同步 ---------- */
await pa.goto(`${BASE}/community`, { waitUntil: 'networkidle' })
const cardA3 = pa.locator('.fs-post', { hasText: TITLE })
await cardA3.getByLabel('回复').click()
await cardA3.locator('.fs-reply', { hasText: '从首页回的' }).waitFor({ timeout: 5000 })
check('首页回复在社区页可见（同一数据源）', true)

/* ---------- 移动端无横向溢出 ---------- */
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const pm = await mobile.newPage()
track(pm, 'M')
await pm.goto(`${BASE}/community`, { waitUntil: 'networkidle' })
await pm.locator('.fs-post', { hasText: TITLE }).getByLabel('回复').click()
await pm.waitForTimeout(600)
const mobileOverflow = await pm.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
check(`移动端横向溢出 = ${mobileOverflow}px`, mobileOverflow <= 0)
await pm.screenshot({ path: 'shots/community-mobile-reply.png' })

console.log('\nconsole errors:', errors.length ? errors : 'none')
console.log(failures === 0 ? '\n全部通过 ✓' : `\n${failures} 项未通过 ✗`)
await browser.close()
process.exit(failures === 0 && errors.length === 0 ? 0 : 1)
