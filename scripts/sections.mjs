import { chromium } from 'playwright-core'
import fs from 'node:fs'

/**
 * 开发辅助脚本（非回归套件）：
 * - 首页：悬停预览、节点自转 + 文字正向、悬停暂停
 * - 首页 → 菜系页：圆形扩散转场截图
 * - /explore：原首页各模块区块截图
 */
fs.mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

// 悬停预览（悬停不会触发转场跳转）
await page.locator('.orbit-node', { hasText: '粤菜' }).first().hover({ force: true })
await page.waitForTimeout(500)
const discText = await page.locator('.orbit-disc__inner').innerText()
console.log('disc after hover:', discText.replace(/\n/g, ' | '))
await page.locator('#hero').screenshot({ path: 'shots/orbit-selected.png' })
await page.mouse.move(10, 10)
await page.waitForTimeout(300)

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

// 首页点击节点 → 圆形揭示转场（冻结在扩张中途截图 + 落地菜系页）
await page.mouse.move(10, 10)
await page.waitForTimeout(200)
const nodeBox = await page.locator('.orbit-node', { hasText: '粤菜' }).first().boundingBox()
await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2)
// 等真实目标页挂载后把揭示动画冻结在 160ms 再截图（合成器动画，冻结后截图不受渲染占用影响）
const frozen = await (async () => {
  for (let i = 0; i < 200; i += 1) {
    const ok = await page.evaluate(() => {
      const overlay = document.querySelector('.circular-transition')
      if (!overlay || !overlay.querySelector('.theme-page')) return false
      for (const anim of overlay.getAnimations({ subtree: true })) {
        anim.pause()
        const props = anim.effect.getKeyframes().flatMap((k) => Object.keys(k))
        if (props.includes('opacity')) {
          anim.currentTime = Number(anim.effect.getTiming().duration) || 0
        } else {
          anim.currentTime = 160
        }
      }
      return true
    })
    if (ok) return true
    await page.waitForTimeout(8)
  }
  return false
})()
await page.screenshot({ path: 'shots/transition-mid.png' })
await page.evaluate(() => {
  const overlay = document.querySelector('.circular-transition')
  for (const anim of overlay?.getAnimations({ subtree: true }) ?? []) anim.play()
})
console.log('transition frozen:', frozen)
await page.waitForURL('**/cuisines/yue', { timeout: 8000 })
await page.waitForTimeout(600)
console.log('transition landed:', page.url())
await page.screenshot({ path: 'shots/transition-landed.png' })

// 探索页：滚动预热后逐区块截图
await page.goto('http://127.0.0.1:5173/explore', { waitUntil: 'networkidle' })
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

await browser.close()
