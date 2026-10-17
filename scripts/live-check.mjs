import { chromium } from 'playwright-core'
import fs from 'node:fs'

fs.mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console] ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))

// 1. 聊天
await page.goto('http://127.0.0.1:5173/chat/dongpo', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
console.log('status badge:', await page.locator('.chat-head__right .live-flag, .chat-head__right .demo-flag').innerText())
await page.locator('.chat-suggest').first().click()
await page.waitForTimeout(9000)
const bubbles = await page.locator('.msg__bubble').allInnerTexts()
console.log('assistant reply:', (bubbles[1] ?? '').slice(0, 120).replace(/\n/g, ' '))
await page.screenshot({ path: 'shots/chat-live.png' })

// 2. 菜谱
await page.goto('http://127.0.0.1:5173/recipe', { waitUntil: 'networkidle' })
await page.locator('#recipe-page-dish').fill('番茄牛腩')
await page.locator('#recipe-page-ing').fill('牛腩、番茄、洋葱')
await page.locator('button[type="submit"]').first().click()
await page.waitForSelector('.workbench__elapsed', { timeout: 15000 }).catch(() => {})
await page.screenshot({ path: 'shots/recipe-loading.png' })
await page.waitForSelector('.recipe-card', { timeout: 120000 })
await page.waitForTimeout(600)
console.log('recipe:', await page.locator('.recipe-card__title').innerText())
console.log('flag:', await page.locator('.recipe-card__flags').innerText())
await page.locator('.recipe-card').screenshot({ path: 'shots/recipe-live.png' })

// 3. 推荐
await page.goto('http://127.0.0.1:5173/recommend', { waitUntil: 'networkidle' })
await page.locator('#recommend-page-form button[type="submit"]').click()
await page.waitForSelector('.dish-card', { timeout: 60000 })
await page.waitForTimeout(500)
console.log('recommend flag:', await page.locator('.recommend__results-head').innerText())
await page.locator('.recommend__results').screenshot({ path: 'shots/recommend-live.png' })

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
