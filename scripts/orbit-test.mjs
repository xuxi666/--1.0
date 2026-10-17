import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const pos = async () =>
  page.locator('.orbit-node').nth(1).evaluate((el) => {
    const r = el.getBoundingClientRect()
    return [Math.round(r.x), Math.round(r.y)]
  })

console.log('start', await pos())
await page.waitForTimeout(1200)
console.log('after 1.2s', await pos())

await page.mouse.move(760, 420)
await page.waitForTimeout(500)
console.log('paused class:', await page.locator('.orbit').getAttribute('class'))
const a = await pos()
await page.waitForTimeout(1200)
const b = await pos()
console.log('paused drift:', Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]))

// 点击节点（用坐标点击，模拟真人）
const box = await page.locator('.orbit-node').nth(1).boundingBox()
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
await page.waitForTimeout(600)
console.log('disc:', (await page.locator('.orbit-disc__inner').innerText()).replace(/\n/g, ' | '))

await browser.close()
