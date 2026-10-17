import { chromium } from 'playwright-core'
import fs from 'node:fs'

fs.mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const routes = [
  ['/', 'home'],
  ['/personalities', 'personalities'],
  ['/personalities/mala', 'category'],
  ['/characters/dongpo', 'character'],
  ['/chat/mapo', 'chat'],
  ['/recipe', 'recipe'],
  ['/recommend', 'recommend'],
  ['/community', 'community'],
]

const errors = []
for (const [route, name] of routes) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${name}: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`${name}: pageerror ${e.message}`))
  await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(1200)

  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src')),
  )
  const total = await page.locator('img').count()
  console.log(`${name}: imgs=${total} broken=${broken.length}`, broken.slice(0, 3))
  await page.screenshot({ path: `shots/final-${name}.png`, fullPage: name === 'home' })
  await page.close()
}

// 移动端
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
for (const [route, name] of [['/', 'm-home'], ['/chat/mapo', 'm-chat']]) {
  await mobile.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle' })
  await mobile.waitForTimeout(3000)
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`${name}: overflow=${overflow}`)
  await mobile.screenshot({ path: `shots/${name}.png` })
}

console.log('errors:', errors.length ? errors.slice(0, 5) : 'none')
await browser.close()
