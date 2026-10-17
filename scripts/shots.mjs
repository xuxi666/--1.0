import { chromium } from 'playwright-core'
import fs from 'node:fs'

const OUT = 'shots'
fs.mkdirSync(OUT, { recursive: true })

const routes = [
  { name: 'home', url: '/', full: true },
  { name: 'home-viewport', url: '/' },
  { name: 'personalities', url: '/personalities' },
  { name: 'category', url: '/personalities/mala' },
  { name: 'character', url: '/characters/mapo' },
  { name: 'chat', url: '/chat/mapo' },
  { name: 'recipe', url: '/recipe' },
  { name: 'recommend', url: '/recommend' },
  { name: 'community', url: '/community' },
]

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const page = await context.newPage()

const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

async function scrollThrough(p) {
  await p.addStyleTag({ content: 'html{scroll-behavior:auto !important}' })
  await p.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6)
    const height = document.documentElement.scrollHeight
    for (let y = 0; y <= height; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 220))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    await new Promise((r) => setTimeout(r, 400))
  })
}

for (const route of routes) {
  await page.goto(`http://127.0.0.1:5173${route.url}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  if (route.full) await scrollThrough(page)
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/${route.name}.png`, fullPage: Boolean(route.full) })
  console.log('shot', route.name)
}

// 移动端
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const mp = await mobile.newPage()
await mp.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await mp.waitForTimeout(1000)
await mp.screenshot({ path: `${OUT}/mobile-home.png` })
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
console.log('mobile horizontal overflow px:', overflow)

const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
console.log('desktop horizontal overflow px:', desktopOverflow)

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
