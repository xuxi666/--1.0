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

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })

// --- 菜谱生成 ---
await page.locator('#recipe-lab').scrollIntoViewIfNeeded()
await page.locator('.quick-row__item').first().click()
await page.locator('#rw-dish').waitFor({ state: 'visible' })
console.log('dish input value:', await page.locator('#rw-dish').inputValue())
await page.locator('#recipe-lab button[type="submit"]').click()
await page.waitForSelector('.recipe-card', { timeout: 15000 })
await page.waitForTimeout(600)
await page.locator('.recipe-card').screenshot({ path: 'shots/recipe-result.png' })
console.log('recipe title:', await page.locator('.recipe-card__title').innerText())

// 份量调整
const amountBefore = await page.locator('.ingredient-list__amount').first().innerText()
await page.locator('.servings__control button').last().click()
await page.waitForTimeout(300)
const amountAfter = await page.locator('.ingredient-list__amount').first().innerText()
console.log('amount 2p -> 3p:', amountBefore, '->', amountAfter)

// --- 推荐 ---
await page.locator('#recommend').scrollIntoViewIfNeeded()
await page.locator('#recommend button[type="submit"]').click()
await page.waitForSelector('.dish-card', { timeout: 15000 })
await page.waitForTimeout(700)
await page.locator('.recommend__results').screenshot({ path: 'shots/recommend-result.png' })
console.log('recommend count:', await page.locator('.dish-card').count())

// --- 聊天 ---
await page.goto('http://127.0.0.1:5173/chat/mapo', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.locator('.chat-suggest').first().click()
await page.waitForTimeout(2500)
const bubbles = await page.locator('.msg__bubble').allInnerTexts()
console.log('chat bubbles:', bubbles.length)
console.log('assistant reply head:', (bubbles[1] ?? '').slice(0, 80).replace(/\n/g, ' '))
await page.screenshot({ path: 'shots/chat-reply.png' })

// 刷新后历史是否保留
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(800)
console.log('history kept after reload:', await page.locator('.msg__bubble').count())

// --- 导航跳转 ---
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.locator('.nav__link', { hasText: '美食社区' }).click()
await page.waitForTimeout(1200)
console.log('hash after nav click:', await page.evaluate(() => location.hash), 'scrollY:', await page.evaluate(() => Math.round(window.scrollY)))

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
