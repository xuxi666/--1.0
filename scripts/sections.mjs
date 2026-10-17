import { chromium } from 'playwright-core'
import fs from 'node:fs'

fs.mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' })
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.6)
  for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: 'instant' })
    await new Promise((r) => setTimeout(r, 200))
  }
  window.scrollTo({ top: 0, behavior: 'instant' })
})
await page.waitForTimeout(800)

const targets = ['#personalities', '#characters', '#recipe-lab', '#recommend', '#community', '#about']
for (const sel of targets) {
  const el = page.locator(sel)
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await el.screenshot({ path: `shots/sec${sel.replace('#', '-')}.png` })
  console.log('section', sel)
}

// 点击星环节点，检查中心圆盘是否切换
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
await page.waitForTimeout(400)
await page.locator('.orbit-node', { hasText: '粤菜' }).first().hover({ force: true })
const box = await page.locator('.orbit-node', { hasText: '粤菜' }).first().boundingBox()
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
await page.waitForTimeout(700)
const discText = await page.locator('.orbit-disc__inner').innerText()
console.log('disc after click:', discText.replace(/\n/g, ' | '))
await page.locator('#hero').screenshot({ path: 'shots/orbit-selected.png' })

// 检查节点是否真的在移动 + 文字是否保持正向
const before = await page.locator('.orbit-node').first().evaluate((el) => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y }
})
await page.waitForTimeout(1500)
const after = await page.locator('.orbit-node').first().evaluate((el) => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y }
})
console.log('node moved:', Math.abs(before.x - after.x) + Math.abs(before.y - after.y))

const transform = await page.locator('.orbit-node__name').first().evaluate((el) => getComputedStyle(el).transform)
console.log('label transform (should be none):', transform)

// 悬停暂停
await page.locator('.orbit').hover()
await page.waitForTimeout(300)
const p1 = await page.locator('.orbit-node').nth(2).evaluate((el) => el.getBoundingClientRect().x)
await page.waitForTimeout(1200)
const p2 = await page.locator('.orbit-node').nth(2).evaluate((el) => el.getBoundingClientRect().x)
console.log('paused drift (should be ~0):', Math.abs(p1 - p2))

await browser.close()
