/**
 * 口味探索全链路自检（node scripts/taste-check.mjs，需先启动 dev server）
 * ------------------------------------------------------------
 * 1. 首页默认「八大菜系」模式：8 个菜系节点、中心文案与 CTA 与原有行为一致，
 *    切换控件位于转盘上方、可访问名称完整；
 * 2. 点击「口味探索」：节点、图片、人格标签、中心文案与按钮全部切换为 8 种口味，
 *    与菜系模式零残留、图片零复用；可随时切回八大菜系；
 * 3. 点击口味节点 → /tastes/:id：风味介绍、代表菜（真实菜品与图片）、聊天区身份正确；
 * 4. 口味聊天独立上下文：fs-taste-chat-<id> 隔离存储、不写菜系存储（fs-cuisine-chat-mala 为空）；
 *    服务端 /api/taste-chat 只认 tasteId（chuan 被拒绝），/api/cuisine-chat 也只认 cuisineId（mala 被拒绝）；
 * 5. 代表菜跳转：图鉴详情 / 菜品角色聊天 / ?dish= 上下文（不属于该口味的菜不会注入上下文）；
 * 6. 键盘：切换控件可用 Enter / 方向键操作；转盘节点 ← → 键可移动；
 * 7. 移动端 / 平板：无横向溢出，切换控件可点；reduced-motion 下双模式转盘都静止；
 * 8. 原有功能冒烟：菜系页 / 角色聊天页 / 图鉴详情 / 推荐页 / 社区页。
 */
import fs from 'node:fs'
import { chromium } from 'playwright-core'

const BASE = 'http://127.0.0.1:5173'
const CUISINE_NAMES = ['川菜', '粤菜', '苏菜', '鲁菜', '湘菜', '闽菜', '浙菜', '徽菜']
const TASTE_NAMES = ['麻辣', '酸辣', '清鲜', '咸香', '酱香浓郁', '鲜香浓郁', '香甜', '清淡温润']
const TASTE_TAGS = ['热烈直球派', '鲜活爽快派', '清爽讲究派', '踏实可靠派', '沉稳醇厚派', '丰盛满足派', '温柔治愈派', '温柔细腻派']

fs.mkdirSync('shots', { recursive: true })

let failures = 0
let total = 0
const check = (label, ok) => {
  total += 1
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

/* ---------- 1. 桌面端：默认菜系模式 + 切换控件 ---------- */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
track(page, 'desktop')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.locator('.orbit-node').first().waitFor({ timeout: 8000 })

const modeButtons = page.locator('.wheel-mode__btn')
check('切换控件存在，含两个选项', (await modeButtons.count()) === 2)
check(
  '选项文案为「八大菜系 / 口味探索」',
  JSON.stringify(await modeButtons.allTextContents()) === JSON.stringify(['八大菜系', '口味探索']),
)
check(
  '默认选中八大菜系（aria-pressed）',
  (await modeButtons.nth(0).getAttribute('aria-pressed')) === 'true' &&
    (await modeButtons.nth(1).getAttribute('aria-pressed')) === 'false',
)
check(
  '切换控件有明确的可访问名称',
  (await page.locator('.wheel-mode').getAttribute('aria-label')) === '首页转盘浏览模式' &&
    (await modeButtons.nth(0).getAttribute('aria-label')) === '切换到八大菜系模式' &&
    (await modeButtons.nth(1).getAttribute('aria-label')) === '切换到口味探索模式',
)

const switchBox = await page.locator('.wheel-mode').boundingBox()
const orbitBoxTop = await page.locator('.orbit').boundingBox()
check('切换控件位于转盘上方（不遮挡转盘）', switchBox !== null && orbitBoxTop !== null && switchBox.y + switchBox.height <= orbitBoxTop.y + 2)

const defaultNames = await page.locator('.orbit-node__name').allTextContents()
check('默认模式仍是八大菜系 8 个节点', JSON.stringify(defaultNames) === JSON.stringify(CUISINE_NAMES))
const defaultBrand = await page.locator('.orbit-disc__inner').innerText()
check(
  '默认中心文案保留原样（每一道美食 + 八大菜系，万种风味）',
  defaultBrand.includes('每一道美食') && defaultBrand.includes('都有自己的灵魂') && defaultBrand.includes('八大菜系，万种风味'),
)
check(
  '默认 CTA 指向 /personalities#cuisines',
  (await page.locator('.orbit-disc__cta').getAttribute('href')) === '/personalities#cuisines',
)
const cuisineImgs = await page.$$eval('.orbit-node img', (imgs) =>
  imgs.map((img) => ({ src: img.getAttribute('src') || '', ok: img.complete && img.naturalWidth > 0 })),
)
check('菜系模式 8 张图片全部真实加载且互不相同', cuisineImgs.length === 8 && cuisineImgs.every((i) => i.ok) && new Set(cuisineImgs.map((i) => i.src)).size === 8)

/* ---------- 2. 切换到口味探索 ---------- */
await modeButtons.nth(1).click()
await page.waitForTimeout(600)
check(
  '点击后 aria-pressed 更新',
  (await modeButtons.nth(0).getAttribute('aria-pressed')) === 'false' &&
    (await modeButtons.nth(1).getAttribute('aria-pressed')) === 'true',
)
const tasteNames = await page.locator('.orbit-node__name').allTextContents()
check('转盘切换为 8 种口味', JSON.stringify(tasteNames) === JSON.stringify(TASTE_NAMES))
const tasteTags = await page.locator('.orbit-node__tag').allTextContents()
check('8 种口味人格标签正确', JSON.stringify(tasteTags) === JSON.stringify(TASTE_TAGS))
const tasteImgs = await page.$$eval('.orbit-node img', (imgs) =>
  imgs.map((img) => ({ src: img.getAttribute('src') || '', ok: img.complete && img.naturalWidth > 0 })),
)
check('口味模式 8 张图片全部真实加载且互不相同', tasteImgs.length === 8 && tasteImgs.every((i) => i.ok) && new Set(tasteImgs.map((i) => i.src)).size === 8)
check(
  '口味图片与菜系图片零复用',
  tasteImgs.every((i) => !cuisineImgs.some((c) => c.src === i.src)),
)
const tasteAria = await page.locator('.orbit-node').first().getAttribute('aria-label')
check('口味节点无障碍名说明「进入口味探索」', Boolean(tasteAria && tasteAria.includes('进入口味探索')))
const tasteCenter = await page.locator('.orbit-disc__inner').innerText()
check(
  '中心文案切换为口味文案（TASTE PERSONALITY + 你的口味 + 味蕾契合）',
  tasteCenter.includes('TASTE PERSONALITY') &&
    tasteCenter.includes('你的口味') &&
    tasteCenter.includes('藏着你的美食灵魂') &&
    tasteCenter.includes('从麻辣鲜香到清甜温润'),
)
check(
  '菜系中心文案无残留（不再出现八大菜系，万种风味）',
  !tasteCenter.includes('八大菜系，万种风味') && !tasteCenter.includes('每一道美食'),
)
const tasteCtaText = await page.locator('.orbit-disc__cta').innerText()
check(
  '中心按钮变为「探索我的口味」且指向 /tastes',
  tasteCtaText.includes('探索我的口味') && (await page.locator('.orbit-disc__cta').getAttribute('href')) === '/tastes',
)
const wheelText = await page.locator('.orbit-wrap').innerText()
check(
  '口味模式转盘区域不出现菜系名称',
  !['川菜', '粤菜', '苏菜', '鲁菜', '湘菜', '闽菜', '浙菜', '徽菜'].some((name) => wheelText.includes(name)),
)

/* 悬停预览：麻辣 */
const orbitBox = await page.locator('.orbit').boundingBox()
await page.mouse.move(orbitBox.x + orbitBox.width / 2, orbitBox.y + orbitBox.height / 2)
await page.waitForTimeout(200)
check('悬停后口味转盘暂停', (await page.locator('.orbit.is-paused').count()) === 1)
await page.locator('.orbit-node', { hasText: '麻辣' }).first().hover({ force: true })
await page.waitForTimeout(250)
const tastePreview = await page.locator('.orbit-disc__inner').innerText()
check('悬停麻辣节点预览口味人格（热烈直球派 + 代表菜）', tastePreview.includes('麻辣') && tastePreview.includes('热烈直球派') && tastePreview.includes('麻婆豆腐'))
check(
  '悬停预览 CTA 指向 /tastes/mala',
  (await page.locator('.orbit-disc__cta').innerText()).includes('麻辣') &&
    (await page.locator('.orbit-disc__cta').getAttribute('href')) === '/tastes/mala',
)
await page.mouse.move(10, 10)
await page.waitForTimeout(200)
check('移出转盘后恢复口味默认文案', (await page.locator('.orbit-disc__inner').innerText()).includes('你的口味'))

/* 快速连续切换：最终状态与数据一致，无错乱 */
await modeButtons.nth(0).click()
await modeButtons.nth(1).click()
await modeButtons.nth(0).click()
await modeButtons.nth(1).click()
await page.waitForTimeout(600)
const rapidNames = await page.locator('.orbit-node__name').allTextContents()
const rapidCenter = await page.locator('.orbit-disc__inner').innerText()
check('快速连续切换后仍为口味模式且布局不错乱', JSON.stringify(rapidNames) === JSON.stringify(TASTE_NAMES) && rapidCenter.includes('TASTE PERSONALITY'))
await page.screenshot({ path: 'shots/taste-home-desktop.png' })

/* 切回八大菜系：原样恢复 */
await modeButtons.nth(0).click()
await page.waitForTimeout(600)
const backNames = await page.locator('.orbit-node__name').allTextContents()
const backCenter = await page.locator('.orbit-disc__inner').innerText()
check('切回八大菜系后节点与文案恢复', JSON.stringify(backNames) === JSON.stringify(CUISINE_NAMES) && backCenter.includes('八大菜系，万种风味'))
await page.locator('.orbit-node', { hasText: '浙菜' }).first().hover({ force: true })
await page.waitForTimeout(250)
check(
  '菜系预览行为保持不变（浙菜 → /cuisines/zhe）',
  (await page.locator('.orbit-disc__cta').innerText()).includes('和浙菜 AI 聊聊天') &&
    (await page.locator('.orbit-disc__cta').getAttribute('href')) === '/cuisines/zhe',
)
await ctx.close()

/* ---------- 3. reduced-motion：静态转盘 + 点击口味节点 ---------- */
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const page2 = await ctx2.newPage()
track(page2, 'reduced')
await page2.goto(`${BASE}/`, { waitUntil: 'networkidle' })
check('reduced-motion 下转盘自转关闭', (await page2.$eval('.orbit-rotor', (el) => getComputedStyle(el).animationName)) === 'none')
await page2.locator('.wheel-mode__btn', { hasText: '口味探索' }).click()
await page2.waitForTimeout(200)
check(
  'reduced-motion 下入场动画关闭',
  (await page2.$eval('.wheel-in', (el) => getComputedStyle(el).animationName)) === 'none',
)
await page2.locator('.orbit-node', { hasText: '麻辣' }).first().click()
await page2.waitForURL('**/tastes/mala')
check('点击口味节点 → 进入 /tastes/mala', page2.url().endsWith('/tastes/mala'))

/* ---------- 4. 口味详情页 ---------- */
const h1 = await page2.locator('h1.page-title').innerText()
check('口味页标题正确（麻辣）', h1 === '麻辣')
const tasteMain = await page2.locator('main').innerText()
check('口味页含人格标签与风味介绍', tasteMain.includes('热烈直球派') && tasteMain.includes('麻、辣、鲜、香交织'))
check('口味页明确标注「不是菜系」', tasteMain.includes('口味探索 · 不是菜系'))
const heroOk = await page2.$eval('.cat-hero__visual img', (img) => img.complete && img.naturalWidth > 0)
check('口味主图真实加载（重庆火锅）', heroOk)
const heroSrc = await page2.$eval('.cat-hero__visual img', (img) => img.getAttribute('src'))
check('口味主图来自菜品库图片（重庆火锅.jpg）', Boolean(heroSrc && decodeURIComponent(heroSrc).includes('重庆火锅')))

const repCards = await page2.locator('.cuisine-dish').count()
check('麻辣页展示 4 道代表菜', repCards === 4)
const repImgs = await page2.$$eval('.cuisine-dish img', (imgs) =>
  imgs.map((img) => ({ src: img.getAttribute('src') || '', ok: img.complete && img.naturalWidth > 0 })),
)
check('代表菜图片全部真实加载', repImgs.length === 4 && repImgs.every((i) => i.ok))
check('代表菜含麻婆豆腐 / 水煮鱼 / 重庆火锅 / 口味虾', ['麻婆豆腐', '水煮鱼', '重庆火锅', '口味虾'].every((name) => tasteMain.includes(name)))
check('代表菜提供图鉴详情入口（麻婆豆腐）', (await page2.locator('a[href="/dishes/mapo-tofu"]').count()) >= 1)
check('代表菜提供菜品角色聊天入口（麻婆豆腐 → /chat/mapo）', (await page2.locator('a[href="/chat/mapo"]').count()) >= 1)
check('代表菜提供菜谱入口（>= 4 个）', (await page2.locator('a[href*="/recipe?dish="]').count()) >= 4)

const chatHead = await page2.locator('.taste-chat__head, .cuisine-chat__head').first().innerText()
check(
  '口味聊天区身份正确（麻辣 · 热烈直球派 · 可跨菜系）',
  chatHead.includes('麻辣') && chatHead.includes('热烈直球派') && chatHead.includes('可跨菜系'),
)
const tasteGreeting = await page2.locator('.taste-chat .chat-empty__greeting').innerText()
check('口味聊天欢迎语非空', tasteGreeting.length > 20)
check('口味聊天提供 >= 3 条推荐问题', (await page2.locator('.taste-chat .chat-suggest').count()) >= 3)
const tastePlaceholder = await page2.locator('.taste-chat textarea').getAttribute('placeholder')
check('输入框占位提示当前口味', Boolean(tastePlaceholder && tastePlaceholder.includes('麻辣')))

/* 主按钮锚点滚动到聊天区 */
await page2.locator('.cat-hero__actions a', { hasText: '聊聊天' }).click()
await page2.waitForTimeout(900)
const chatBox = await page2.locator('.taste-chat').boundingBox()
check('「和麻辣口味聊聊天」滚动到聊天区', page2.url().includes('#taste-chat') && chatBox !== null && chatBox.y < 500)

/* 真实发送一条消息（live 模式走 GLM 流式；demo 模式为本地模板，都会流式返回） */
await page2.locator('.taste-chat textarea').fill('你好，简单介绍一下你自己')
await page2.locator('.taste-chat .chat-composer button[type="submit"]').click()
await page2.waitForFunction(
  () => {
    const bubble = document.querySelector('.taste-chat .msg--assistant .msg__bubble')
    return Boolean(bubble && (bubble.textContent ?? '').trim().length > 10)
  },
  { timeout: 90000 },
)
await page2.waitForFunction(() => !document.querySelector('.taste-chat .is-typing'), { timeout: 90000 })
const tasteReply = await page2.locator('.taste-chat .msg--assistant .msg__bubble').last().innerText()
check('口味聊天收到流式回复且围绕口味身份', /麻辣|口味/.test(tasteReply))
const storedTaste = await page2.evaluate(() => localStorage.getItem('fs-taste-chat-mala'))
check('对话写入口味独立存储（fs-taste-chat-mala）', Boolean(storedTaste && storedTaste.includes('你好')))
const cuisineBleed = await page2.evaluate(() => localStorage.getItem('fs-cuisine-chat-mala'))
check('口味聊天绝不写入菜系存储（fs-cuisine-chat-mala 为空）', !cuisineBleed)

/* 口味之间互不串上下文 */
await page2.goto(`${BASE}/tastes/qingdan`, { waitUntil: 'networkidle' })
check('清炖口味聊天区为空（不串麻辣上下文）', (await page2.locator('.taste-chat .chat-empty').count()) === 1)
const storedQingdan = await page2.evaluate(() => localStorage.getItem('fs-taste-chat-qingdan'))
check('清淡温润口味尚未产生会话记录', !storedQingdan || storedQingdan === '[]')
check('清淡温润口味身份为温柔细腻派', (await page2.locator('.cuisine-chat__head').innerText()).includes('温柔细腻派'))
await page2.screenshot({ path: 'shots/taste-qingdan.png', fullPage: false })

/* ---------- 5. ?dish= 上下文校验（属于该口味才注入） ---------- */
await page2.goto(`${BASE}/tastes/mala?dish=mapo-tofu`, { waitUntil: 'networkidle' })
check('合法菜品上下文注入（麻婆豆腐 ∈ 麻辣）', (await page2.locator('[data-testid="taste-chat-context"]').count()) === 1)
const ctxText = await page2.locator('[data-testid="taste-chat-context"]').innerText()
check('上下文标注口味与菜品', ctxText.includes('麻婆豆腐') && ctxText.includes('麻辣'))
await page2.goto(`${BASE}/tastes/mala?dish=baiqieji`, { waitUntil: 'networkidle' })
check('不属于该口味的菜不会注入上下文（白切鸡 ∉ 麻辣）', (await page2.locator('[data-testid="taste-chat-context"]').count()) === 0)

/* ---------- 6. 代表菜 → 图鉴详情 / 菜品角色聊天 ---------- */
await page2.goto(`${BASE}/tastes/mala`, { waitUntil: 'networkidle' })
await page2.locator('a[href="/dishes/mapo-tofu"]').first().click()
await page2.waitForURL('**/dishes/mapo-tofu')
check('从口味页进入菜品图鉴详情（麻婆豆腐）', page2.url().endsWith('/dishes/mapo-tofu'))
await page2.goto(`${BASE}/tastes/mala`, { waitUntil: 'networkidle' })
await page2.locator('a[href="/chat/mapo"]').first().click()
await page2.waitForURL('**/chat/mapo')
check('从口味页进入菜品角色聊天（麻婆豆腐角色）', page2.url().endsWith('/chat/mapo'))
check('角色聊天页仍可用', (await page2.locator('textarea, input[type="text"]').count()) > 0)

/* ---------- 7. 键盘操作 ---------- */
await page2.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const tasteBtn = page2.locator('.wheel-mode__btn', { hasText: '口味探索' })
await tasteBtn.focus()
await page2.keyboard.press('Enter')
await page2.waitForTimeout(300)
check(
  '键盘 Enter 可切换到口味模式',
  (await page2.locator('.wheel-mode__btn', { hasText: '口味探索' }).getAttribute('aria-pressed')) === 'true' &&
    JSON.stringify(await page2.locator('.orbit-node__name').allTextContents()) === JSON.stringify(TASTE_NAMES),
)
await page2.keyboard.press('ArrowLeft')
await page2.waitForTimeout(300)
const backPressed = await page2.locator('.wheel-mode__btn', { hasText: '八大菜系' }).getAttribute('aria-pressed')
const focusText = await page2.evaluate(() => document.activeElement?.textContent ?? '')
check('方向键可切回八大菜系且焦点跟随', backPressed === 'true' && focusText.includes('八大菜系'))
await page2.locator('.orbit-node').first().focus()
await page2.keyboard.press('ArrowRight')
await page2.keyboard.press('Enter')
await page2.waitForURL('**/cuisines/yue')
check('转盘节点 ← → 键 + Enter 行为不变（粤菜页）', page2.url().endsWith('/cuisines/yue'))

/* ---------- 8. 服务端上下文隔离（真实请求） ---------- */
const post = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  return { status: res.status, text }
}
const badTaste = await post('/api/taste-chat', { tasteId: 'chuan', messages: [{ role: 'user', content: 'hi' }] })
check('服务端拒绝把菜系 id 当口味（/api/taste-chat + chuan → 400）', badTaste.status === 400)
const unknownTaste = await post('/api/taste-chat', { tasteId: 'unknown', messages: [{ role: 'user', content: 'hi' }] })
check('未知口味 id 明确 400（不静默回退）', unknownTaste.status === 400)
const badCuisine = await post('/api/cuisine-chat', { cuisineId: 'mala', messages: [{ role: 'user', content: 'hi' }] })
check('服务端拒绝把口味 id 当菜系（/api/cuisine-chat + mala → 400）', badCuisine.status === 400)

let streamState = 'empty'
let streamTail = ''
const probeOnce = async () => {
  const streamRes = await fetch(`${BASE}/api/taste-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasteId: 'mala', messages: [{ role: 'user', content: '用一句话回答：你是谁？' }] }),
  })
  const streamText = await streamRes.text()
  streamTail = streamText.slice(-160)
  if (streamRes.status !== 200) return 'bad-status'
  if (streamText.includes('"type":"delta"') && streamText.includes('"type":"done"')) return 'complete'
  if (streamText.includes('"type":"error"')) return 'rate-limited'
  return 'malformed'
}
streamState = await probeOnce()
/* GLM 免费额度偶发限流（「缓一分钟」）：间隔 35 秒重试一次；
   仍限流则接受「服务端如实转发的 error 事件」——完整「delta → done」的端到端流式已由
   上面浏览器内的真实对话检查覆盖，这里额外确认的是合法 id 放行与 SSE 回包格式 */
if (streamState === 'rate-limited') {
  await new Promise((resolve) => setTimeout(resolve, 35000))
  streamState = await probeOnce()
}
check(
  '合法口味请求走 SSE 流式回包（完整流；模型限流时如实报错而非 500 / 静默回退）',
  streamState === 'complete' || streamState === 'rate-limited',
)
if (streamState !== 'complete') console.log(`SSE 状态: ${streamState}，尾部内容:`, JSON.stringify(streamTail))

/* ---------- 9. 移动端 ---------- */
const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const page3 = await ctx3.newPage()
track(page3, 'mobile')
await page3.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const overflowMobile = await page3.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check('移动端首页无横向溢出（菜系模式）', overflowMobile <= 1)
const mobileBtnBox = await page3.locator('.wheel-mode__btn', { hasText: '口味探索' }).boundingBox()
check('移动端切换控件可见且可点（高度 >= 28px）', mobileBtnBox !== null && mobileBtnBox.height >= 28)
await page3.locator('.wheel-mode__btn', { hasText: '口味探索' }).tap()
await page3.waitForTimeout(400)
check('移动端可切换到口味模式（8 个口味节点）', JSON.stringify(await page3.locator('.orbit-node__name').allTextContents()) === JSON.stringify(TASTE_NAMES))
const overflowMobile2 = await page3.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check('移动端口味模式无横向溢出', overflowMobile2 <= 1)
await page3.screenshot({ path: 'shots/taste-home-mobile.png' })
await page3.goto(`${BASE}/tastes/xiangtian`, { waitUntil: 'networkidle' })
const overflowTaste = await page3.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check('移动端口味详情页无横向溢出（香甜）', overflowTaste <= 1)
check('移动端口味页标题正确（香甜）', (await page3.locator('h1.page-title').innerText()) === '香甜')
await page3.screenshot({ path: 'shots/taste-xiangtian-mobile.png' })
await ctx3.close()

/* ---------- 10. 平板 ---------- */
const ctx4 = await browser.newContext({ viewport: { width: 834, height: 1112 }, deviceScaleFactor: 2 })
const page4 = await ctx4.newPage()
track(page4, 'tablet')
await page4.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const overflowTablet = await page4.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check('平板端首页无横向溢出', overflowTablet <= 1)
await page4.screenshot({ path: 'shots/taste-home-tablet.png' })
await ctx4.close()

/* ---------- 11. 口味总览页与 404 ---------- */
const ctx5 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page5 = await ctx5.newPage()
track(page5, 'overview')
await page5.goto(`${BASE}/tastes`, { waitUntil: 'networkidle' })
const tiles = await page5.locator('.cat-tile h3').allTextContents()
check('口味总览页列出 8 个口味', JSON.stringify(tiles) === JSON.stringify(TASTE_NAMES))
check('总览页说明口味与菜系的关系', (await page5.locator('main').innerText()).includes('多对多'))
await page5.goto(`${BASE}/tastes/unknown`, { waitUntil: 'networkidle' })
check('未知口味显示引导块', (await page5.locator('.page-empty').innerText()).includes('没有找到这个口味'))
await ctx5.close()

/* ---------- 12. 原有功能冒烟 ---------- */
const ctx6 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page6 = await ctx6.newPage()
track(page6, 'regression')
await page6.goto(`${BASE}/cuisines/chuan`, { waitUntil: 'networkidle' })
check('川菜页未受影响（3 位相关角色 + 聊天区）', (await page6.locator('.char-card').count()) === 3 && (await page6.locator('.cuisine-chat').count()) === 1)
check('川菜页仍是菜系聊天身份（不是口味）', (await page6.locator('.cuisine-chat__head').innerText()).includes('代表整个川菜菜系'))
check('川菜页代表菜聊天入口保持不变', (await page6.locator('a[href="/chat/mapo"]').count()) > 0)
await page6.goto(`${BASE}/chat/mapo`, { waitUntil: 'networkidle' })
check('菜品角色聊天页仍可打开', (await page6.locator('textarea, input[type="text"]').count()) > 0)
check('角色聊天页仍标注所属菜系（川菜）', (await page6.locator('.chat-head__cuisine').innerText()).includes('川菜'))
await page6.goto(`${BASE}/dishes/mapo-tofu`, { waitUntil: 'networkidle' })
check('菜品图鉴详情页仍可打开', (await page6.locator('h1').count()) >= 1)
await page6.goto(`${BASE}/recipe?dish=${encodeURIComponent('麻婆豆腐')}`, { waitUntil: 'networkidle' })
check('菜谱页仍可打开', (await page6.locator('main').count()) === 1)
await page6.goto(`${BASE}/recommend`, { waitUntil: 'networkidle' })
check('推荐页仍可打开', (await page6.locator('main').count()) === 1)
await page6.goto(`${BASE}/community`, { waitUntil: 'networkidle' })
check('社区页仍可打开', (await page6.locator('.community').count()) === 1)
await ctx6.close()

await browser.close()

check('全程无控制台错误', errors.length === 0)
if (errors.length) console.log(errors.slice(0, 10).join('\n'))

console.log(`\n${failures === 0 ? `全部通过（${total}/${total}）✔` : `存在 ${failures} 项失败（共 ${total} 项）✘`}`)
process.exit(failures === 0 ? 0 : 1)
