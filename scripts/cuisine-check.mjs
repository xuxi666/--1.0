/**
 * 八大菜系首页重构自检：
 * 1. 首页星环 = 川粤苏鲁湘闽浙徽 8 个菜系节点，名称唯一、图片各不相同且真实加载
 * 2. 中心圆盘：品牌文案 + 「探索美食」→ /personalities#cuisines；悬停节点预览菜系
 * 3. 点击节点 → /cuisines/:id；菜系页含名称/人格标签/地域/介绍/4 道代表菜/角色入口
 * 3b. 32 道代表菜全部有真实图片（无 emoji 占位），且图片可访问
 * 4. 无角色的菜系（鲁/湘/闽/徽）显示诚实的空状态，不伪造角色
 * 5. /personalities：八大菜系区块 + 更多美食类型标签 + 原有八种口味方向 + 17 位角色
 * 6. 键盘：聚焦节点后 Enter 进入菜系页
 * 7. 移动端 / 平板：无横向溢出，交互可用；reduced-motion 下星环静止
 * 8. 原有功能冒烟：聊天页 / 菜谱页 / 口味分类页 / 推荐页不报错
 * 用法：先启动 dev server，再 node scripts/cuisine-check.mjs
 */
import { chromium } from 'playwright-core'

const BASE = 'http://127.0.0.1:5173'
const EXPECTED = ['川菜', '粤菜', '苏菜', '鲁菜', '湘菜', '闽菜', '浙菜', '徽菜']
const CUISINE_IDS = ['chuan', 'yue', 'su', 'lu', 'xiang', 'min', 'zhe', 'hui']

let failures = 0
const check = (label, ok) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`)
  if (!ok) failures += 1
}
const errors = []
const track = (page, tag) => {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${tag}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${tag}] ${e.message}`))
}

const browser = await chromium.launch({ channel: 'chrome' })

/* ---------- 1. 桌面端：星环节点（正常动画 + 悬停暂停） ---------- */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
track(page, 'desktop')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.locator('.orbit-node').first().waitFor({ timeout: 8000 })

const names = await page.locator('.orbit-node__name').allTextContents()
check('星环正好 8 个节点', names.length === 8)
check('八个菜系齐全、顺序一致', JSON.stringify(names) === JSON.stringify(EXPECTED))
check('节点无重复', new Set(names).size === 8)

const tags = await page.locator('.orbit-node__tag').allTextContents()
check(
  '人格标签正确（热烈直球派/清鲜讲究派/温柔雅致派/豪爽可靠派/火辣倔强派/温润细腻派/清雅聪慧派/沉稳质朴派）',
  JSON.stringify(tags) ===
    JSON.stringify(['热烈直球派', '清鲜讲究派', '温柔雅致派', '豪爽可靠派', '火辣倔强派', '温润细腻派', '清雅聪慧派', '沉稳质朴派']),
)

const regions = await page.locator('.orbit-node__region').allTextContents()
check('每个节点显示地域说明', regions.length === 8 && regions.includes('四川、重庆') && regions.includes('安徽'))

const imgInfo = await page.$$eval('.orbit-node img', (imgs) =>
  imgs.map((img) => ({ src: img.getAttribute('src'), ok: img.complete && img.naturalWidth > 0 })),
)
check('8 张节点图片均已真实加载', imgInfo.length === 8 && imgInfo.every((item) => item.ok))
check('8 张节点图片各不相同', new Set(imgInfo.map((item) => item.src)).size === 8)

const brandText = await page.locator('.orbit-disc__inner').innerText()
check('中心圆盘含核心概念文案', brandText.includes('每一道美食') && brandText.includes('都有自己的灵魂'))
check('中心圆盘含「八大菜系，万种风味」', brandText.includes('八大菜系，万种风味'))
const ctaHref = await page.locator('.orbit-disc__cta').getAttribute('href')
check('「探索美食」按钮指向 /personalities#cuisines', ctaHref === '/personalities#cuisines')

/* 悬停暂停 + 预览 */
const orbitBox = await page.locator('.orbit').boundingBox()
await page.mouse.move(orbitBox.x + orbitBox.width / 2, orbitBox.y + orbitBox.height / 2)
await page.waitForTimeout(200)
check('悬停后星环暂停', await page.locator('.orbit.is-paused').count() === 1)
await page.locator('.orbit-node', { hasText: '浙菜' }).first().hover({ force: true })
await page.waitForTimeout(250)
const previewText = await page.locator('.orbit-disc__inner').innerText()
check('悬停节点时圆盘预览菜系（浙菜）', previewText.includes('浙菜') && previewText.includes('清雅聪慧派'))
check('预览含进入探索按钮', (await page.locator('.orbit-disc__cta').innerText()).includes('探索'))
await page.mouse.move(10, 10)
await page.waitForTimeout(200)
check('移出星环后恢复品牌文案', (await page.locator('.orbit-disc__inner').innerText()).includes('八大菜系，万种风味'))

await page.screenshot({ path: 'shots/cuisine-home-desktop.png' })
await ctx.close()

/* ---------- 2. reduced-motion：静态星环 + 点击进入菜系页 ---------- */
const ctx2 = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
})
const page2 = await ctx2.newPage()
track(page2, 'reduced')
await page2.goto(`${BASE}/`, { waitUntil: 'networkidle' })

const rotorAnim = await page2.$eval('.orbit-rotor', (el) => getComputedStyle(el).animationName)
check('reduced-motion 下星环自转关闭', rotorAnim === 'none')

await page2.locator('.orbit-node', { hasText: '川菜' }).first().click()
await page2.waitForURL('**/cuisines/chuan')
check('点击菜系节点 → 进入 /cuisines/chuan', page2.url().endsWith('/cuisines/chuan'))

/* ---------- 3. 菜系详情页（遍历八个） ---------- */
for (const [index, id] of CUISINE_IDS.entries()) {
  await page2.goto(`${BASE}/cuisines/${id}`, { waitUntil: 'networkidle' })
  const h1 = await page2.locator('h1.page-title').innerText()
  const dishes = await page2.locator('.cuisine-dish').count()
  const heroOk = await page2.$eval('.cat-hero__visual img', (img) => img.complete && img.naturalWidth > 0)
  check(`${EXPECTED[index]} 菜系页：标题正确`, h1 === EXPECTED[index])
  check(`${EXPECTED[index]} 菜系页：4 道代表菜`, dishes === 4)
  check(`${EXPECTED[index]} 菜系页：主图真实加载`, heroOk)
}

/* ---------- 3b. 32 道代表菜全部有图片且可访问 ---------- */
const dishImageUrls = new Set()
let dishEmojiPlaceholders = 0
for (const id of CUISINE_IDS) {
  await page2.goto(`${BASE}/cuisines/${id}`, { waitUntil: 'networkidle' })
  const urls = await page2.$$eval('.cuisine-dish img', (imgs) => imgs.map((img) => img.getAttribute('src') || ''))
  urls.forEach((url) => dishImageUrls.add(url))
  dishEmojiPlaceholders += await page2.locator('.cuisine-dish__emoji').count()
}
check('8 个菜系页共渲染 32 张代表菜图片且各不相同', dishImageUrls.size === 32)
check('所有代表菜都有图片（无 emoji 占位）', dishEmojiPlaceholders === 0)
const dishProbe = await Promise.all(
  [...dishImageUrls].map(async (url) => {
    const res = await fetch(`${BASE}${url}`)
    return res.ok
  }),
)
check('32 张代表菜图片全部可访问（HTTP 200）', dishProbe.length === 32 && dishProbe.every(Boolean))

await page2.goto(`${BASE}/cuisines/chuan`, { waitUntil: 'networkidle' })
check('川菜页含 3 位相关角色（川菜/麻婆豆腐/水煮鱼）', await page2.locator('.char-card').count() === 3)
const chuanText = await page2.locator('main').innerText()
check('川菜页含地域「四川、重庆」', chuanText.includes('四川、重庆'))
check('川菜页含人格标签', chuanText.includes('热烈直球派'))
check('川菜页含代表菜名称', chuanText.includes('麻婆豆腐') && chuanText.includes('回锅肉') && chuanText.includes('宫保鸡丁'))
check('代表菜有聊天入口（麻婆豆腐）', (await page2.locator('a[href="/chat/mapo"]').count()) > 0)
check('代表菜有菜谱入口', (await page2.locator('a[href*="/recipe?dish="]').count()) >= 4)
await page2.screenshot({ path: 'shots/cuisine-chuan.png', fullPage: true })

await page2.goto(`${BASE}/cuisines/lu`, { waitUntil: 'networkidle' })
const luText = await page2.locator('main').innerText()
check('鲁菜页无角色时显示诚实空状态', luText.includes('专属角色还在酝酿') && (await page2.locator('.char-card').count()) === 0)
check('鲁菜页仍提供人格宇宙入口', (await page2.locator('a[href="/personalities"]').count()) > 0)
await page2.goto(`${BASE}/cuisines/zhe`, { waitUntil: 'networkidle' })
check('浙菜页关联到东坡肉角色', (await page2.locator('.char-card').count()) === 1)

/* ---------- 4. 不存在的菜系 → 404 卡片 ---------- */
await page2.goto(`${BASE}/cuisines/unknown`, { waitUntil: 'networkidle' })
check('未知菜系显示引导块', (await page2.locator('.page-empty').innerText()).includes('没有找到这个菜系'))
await ctx2.close()

/* ---------- 5. /personalities：菜系区块 + 更多美食类型 + 原有结构 ---------- */
const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page3 = await ctx3.newPage()
track(page3, 'personalities')
await page3.goto(`${BASE}/personalities`, { waitUntil: 'networkidle' })
check('人格宇宙含八大菜系区块', (await page3.locator('#cuisines').count()) === 1)
const tiles = await page3.locator('#cuisines .cat-tile h3').allTextContents()
check('菜系区块列出 8 个菜系', JSON.stringify(tiles) === JSON.stringify(EXPECTED))
check('更多美食类型标签存在', (await page3.locator('.food-types .cat-switch__item').count()) === 5)
const typeHrefs = await page3.$$eval('.food-types a', (as) => as.map((a) => a.getAttribute('href')))
check(
  '美食类型标签保留（火锅/烧烤/面食/甜品/街头小吃 → 对应角色）',
  ['huoguo', 'shaokao', 'mianshi', 'tianpin', 'jietou'].every((id) => typeHrefs.includes(`/characters/${id}`)),
)
check('原有八种口味方向保留', (await page3.locator('.cat-tile').count()) === 16)
check('原有 17 位角色保留', (await page3.locator('.char-card').count()) === 17)

/* 探索美食按钮真实可用 */
await page3.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page3.locator('.orbit-disc__cta').click()
await page3.waitForURL('**/personalities#cuisines')
await page3.waitForTimeout(700)
const cuisinesSection = await page3.locator('#cuisines').boundingBox()
check(
  '「探索美食」→ 人格宇宙菜系区块（滚动到位）',
  page3.url().includes('/personalities#cuisines') && cuisinesSection !== null && cuisinesSection.y < 400,
)
await page3.screenshot({ path: 'shots/cuisine-personalities.png' })

/* ---------- 6. 键盘操作 ---------- */
await page3.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page3.locator('.orbit-node').first().focus()
check('键盘聚焦节点会预览菜系', (await page3.locator('.orbit-disc__inner').innerText()).includes('川菜'))
await page3.keyboard.press('ArrowRight')
await page3.keyboard.press('Enter')
await page3.waitForURL('**/cuisines/yue')
check('聚焦 + 方向键 + Enter → 进入粤菜页', page3.url().endsWith('/cuisines/yue'))
await ctx3.close()

/* ---------- 7. 移动端 / 平板 ---------- */
const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page4 = await ctx4.newPage()
track(page4, 'mobile')
await page4.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const overflowMobile = await page4.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
check('移动端首页无横向溢出', overflowMobile <= 1)
check('移动端星环仍显示 8 个节点', (await page4.locator('.orbit-node').count()) === 8)
await page4.screenshot({ path: 'shots/cuisine-home-mobile.png', fullPage: false })

const mobileNode = page4.locator('.orbit-node', { hasText: '湘菜' }).first()
await page4.evaluate(() => {
  const el = document.querySelector('.orbit')
  if (!el) return
  const rect = el.getBoundingClientRect()
  const top = rect.top + window.scrollY - (window.innerHeight - rect.height) / 2
  window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
})
await page4.waitForTimeout(400)
const mobileOrbitBox = await page4.locator('.orbit').boundingBox()
await page4.mouse.move(mobileOrbitBox.x + mobileOrbitBox.width / 2, mobileOrbitBox.y + mobileOrbitBox.height / 2)
await page4.waitForTimeout(350)
const mobileBox = await mobileNode.boundingBox()
await page4.mouse.click(mobileBox.x + mobileBox.width / 2, mobileBox.y + mobileBox.height / 2)
await page4.waitForURL('**/cuisines/xiang')
const overflowMobile2 = await page4.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
check('移动端湘菜页可进入且无横向溢出', overflowMobile2 <= 1)
await page4.screenshot({ path: 'shots/cuisine-xiang-mobile.png', fullPage: false })
await ctx4.close()

const ctx5 = await browser.newContext({ viewport: { width: 834, height: 1112 }, deviceScaleFactor: 2 })
const page5 = await ctx5.newPage()
track(page5, 'tablet')
await page5.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const overflowTablet = await page5.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
check('平板端首页无横向溢出', overflowTablet <= 1)
await page5.screenshot({ path: 'shots/cuisine-home-tablet.png' })
await ctx5.close()

/* ---------- 8. 原有功能冒烟 ---------- */
const ctx6 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page6 = await ctx6.newPage()
track(page6, 'regression')
await page6.goto(`${BASE}/chat/mapo`, { waitUntil: 'networkidle' })
check('角色聊天页仍可打开', (await page6.locator('textarea, input[type="text"]').count()) > 0)
await page6.goto(`${BASE}/recipe?dish=${encodeURIComponent('麻婆豆腐')}`, { waitUntil: 'networkidle' })
check('菜谱页仍可打开', (await page6.locator('main').count()) === 1)
await page6.goto(`${BASE}/personalities/mala`, { waitUntil: 'networkidle' })
check('口味分类页仍可打开', (await page6.locator('.cat-hero').count()) === 1)
await page6.goto(`${BASE}/recommend`, { waitUntil: 'networkidle' })
check('推荐页仍可打开', (await page6.locator('main').count()) === 1)
await page6.goto(`${BASE}/characters/jiangnan`, { waitUntil: 'networkidle' })
check('江南菜角色页仍可打开', (await page6.locator('h1').count()) >= 1)
await ctx6.close()

await browser.close()

check('全程无控制台错误', errors.length === 0)
if (errors.length) console.log(errors.slice(0, 10).join('\n'))

console.log(`\n${failures === 0 ? '全部通过 ✔' : `存在 ${failures} 项失败 ✘`}`)
process.exit(failures === 0 ? 0 : 1)
