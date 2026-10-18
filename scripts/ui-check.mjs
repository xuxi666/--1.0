/**
 * UI 改版自检：全屏首页 + 圆形揭示转场（真实目标页）+ 菜系/口味专属主题
 * ------------------------------------------------------------
 * 1. 桌面 / 移动 / 横屏：首页占满首屏、不露后续模块、转盘与切换完整可见、无横向溢出
 * 2. /explore：原首页模块全部搬家到位，导航与入口链接一致
 * 3. 主题数据自检（浏览器内直接 import 真实模块）：17 条主题字段齐全，16 个菜系/口味主色互不重复
 * 4. 圆形揭示：从点击位置出发、用 transform 在合成器上扩张（反向缩放让圆内页面 1:1）、
 *    半径按视口计算能覆盖四角、扩张期间圆内是真实目标页（主题页 + 聊天区）而圆外仍是原首页、无纯色遮罩
 * 5. 无缝衔接：420ms 揭示 → 切路由 → 落地页跳过入场编排（与预览层同画面）→ 卸层无闪屏
 * 6. 进入世界的分层入场（直接加载时：名称 / 介绍 / AI 人格头 / 欢迎语 / 输入框）+ 头像光效 + 无循环动效
 * 7. 返回首页直接跳转（不再有圆形转场）、恢复交互、保留口味模式
 * 8. 快速连点只发生一次转场；浏览器返回键 / 刷新后无残留
 * 9. reduced-motion：不做动画层，直接进入目标页
 * 10. 16 个主题页逐个核对 data-theme-id 与 --t-primary 生效
 * 用法：先启动 dev server，再 node scripts/ui-check.mjs
 */
import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'

const BASE = 'http://127.0.0.1:5173'
const CUISINE_IDS = ['chuan', 'yue', 'su', 'lu', 'xiang', 'min', 'zhe', 'hui']
const TASTE_IDS = ['mala', 'suanla', 'qingxian', 'xianxiang', 'jiangxiang', 'xiannong', 'xiangtian', 'qingdan']
const TASTE_NAMES = ['麻辣', '酸辣', '清鲜', '咸香', '酱香浓郁', '鲜香浓郁', '香甜', '清淡温润']

let failures = 0
const results = []
const check = (label, ok, extra = '') => {
  console.log(`${ok ? '✓' : '✗'} ${label}${extra ? ` — ${extra}` : ''}`)
  results.push({ ok, label, extra })
  if (!ok) failures += 1
}

const errors = []
const badResponses = []
const track = (page, tag) => {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${tag}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${tag}] ${e.message}`))
  page.on('response', (res) => {
    if (res.url().startsWith(BASE) && res.status() >= 400) badResponses.push(`${res.status()} ${res.url()}`)
  })
}

const browser = await chromium.launch({ channel: 'chrome' })

/**
 * 安装圆形揭示捕捉器：逐帧采样揭示层
 * （点击 / 揭示层出现 / 圆内真实页 / 圆外首页 / 纯色圆 / 几何 / 动画 / 反向缩放）
 */
const installRevealProbe = (page) =>
  page.evaluate(() => {
    const now = () => performance.now()
    window.__reveal = {
      mounted: 0,
      clickAt: null,
      t0: null,
      navT: null,
      startPath: location.pathname,
      samples: [],
      anim: null,
      animStart: null,
      mounts: 0,
      overlayPos: null,
      overlayZ: 0,
      mode: null,
      geometry: null,
      rect: null,
    }
    window.__overlayMounts = 0
    window.addEventListener(
      'pointerdown',
      () => {
        window.__reveal.clickAt = now()
      },
      true,
    )
    const base = () => window.__reveal.clickAt ?? window.__reveal.t0 ?? now()
    const rec = () => {
      const r = window.__reveal
      const overlay = document.querySelector('.circular-transition')
      const reveal = overlay?.querySelector('.circular-transition__reveal')
      const stage = overlay?.querySelector('.circular-transition__preview')
      if (overlay) {
        if (r.t0 === null) {
          r.t0 = now()
          r.mounted = 1
          window.__overlayMounts += 1
          r.overlayPos = getComputedStyle(overlay).position
          r.overlayZ = parseInt(getComputedStyle(overlay).zIndex, 10) || 0
          r.mode = overlay.dataset.mode ?? null
          r.geometry = {
            x: Number(overlay.dataset.originX),
            y: Number(overlay.dataset.originY),
            startRadius: Number(overlay.dataset.startRadius),
            coverRadius: Number(overlay.dataset.coverRadius),
          }
          if (reveal) {
            const box = reveal.getBoundingClientRect()
            r.rect = { x: box.left + box.width / 2, y: box.top + box.height / 2, radius: box.width / 2 }
          }
        }
        if (reveal && !r.anim) {
          const anim = reveal.getAnimations()[0]
          if (anim && anim.effect) {
            const timing = anim.effect.getTiming()
            const frames = anim.effect.getKeyframes()
            r.anim = {
              duration: timing.duration,
              easing: timing.easing,
              properties: Object.keys(frames[0]).filter(
                (k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k),
              ),
              firstTransform: frames[0].transform,
              lastTransform: frames[frames.length - 1].transform,
              keyframes: frames.length,
            }
          }
        }
        if (reveal && r.animStart === null) {
          const anim = reveal.getAnimations()[0]
          if (anim && typeof anim.startTime === 'number') r.animStart = anim.startTime
        }
        const scaleOf = (el) => {
          if (!el) return null
          const m = /matrix\(([-\d.]+)/.exec(getComputedStyle(el).transform)
          return m ? Number(m[1]) : null
        }
        r.samples.push({
          t: Math.round(now() - base()),
          scale: scaleOf(reveal),
          stageScale: scaleOf(stage),
          themed: overlay.querySelectorAll('.theme-page[data-theme-id]').length,
          themeId: overlay.querySelector('.theme-page[data-theme-id]')?.getAttribute('data-theme-id') ?? null,
          heroTitle: overlay.querySelector('.page-title')?.textContent ?? null,
          chat: overlay.querySelectorAll('.cuisine-chat').length,
          home: document.querySelectorAll('#hero').length,
          pure: overlay.querySelectorAll('.circular-transition__reveal--color').length,
          mode: overlay.dataset.mode ?? null,
        })
      }
      if (r.mounted && r.navT === null && location.pathname !== r.startPath) {
        r.navT = Math.round(now() - base())
      }
      if (now() - (window.__probeAt ?? now()) < 12000) requestAnimationFrame(rec)
    }
    window.__probeAt = now()
    rec()
  })

/** 解析 scale(s) 关键帧 */
const scaleOfKeyframe = (transform) => {
  const m = /scale\(([\d.]+)\)/.exec(transform || '')
  return m ? parseFloat(m[1]) : null
}

/** 圆（圆心 + 半径）是否覆盖视口四角 */
const circleCoversViewport = (x, y, r, vw, vh) =>
  Number.isFinite(x) &&
  Number.isFinite(y) &&
  r >=
    Math.max(
      Math.hypot(x, y),
      Math.hypot(vw - x, y),
      Math.hypot(x, vh - y),
      Math.hypot(vw - x, vh - y),
    )

/** 取节点圆盘的真实中心（转盘暂停时使用，保证点击点稳定） */
const nodeDiscCenter = (page, text) =>
  page.evaluate((t) => {
    const node = [...document.querySelectorAll('.orbit-node')].find((n) => n.textContent.includes(t))
    if (!node) return null
    const disc = node.querySelector('.orbit-node__disc') || node
    const r = disc.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }
  }, text)

/** 悬停转盘暂停旋转后点击指定节点（避免取到旋转中的旧坐标） */
const hoverPauseAndClick = async (page, text) => {
  const orbitBox = await page.locator('.orbit').boundingBox()
  await page.mouse.move(orbitBox.x + orbitBox.width / 2, orbitBox.y + orbitBox.height / 2)
  await page.waitForTimeout(320)
  const nodeBox = await page.locator('.orbit-node', { hasText: text }).first().boundingBox()
  await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2)
}

/* ============================ 1. 桌面全屏首页 ============================ */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
track(page, 'desktop')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.locator('.orbit-node').first().waitFor({ timeout: 8000 })

const heroBox = await page.locator('#hero').boundingBox()
check('首页 hero 占满整个视口（100dvh）', heroBox.height >= 900 - 2, `height=${Math.round(heroBox.height)}`)
check(
  '首页首屏不出现后续模块（人格 / 图鉴 / 社区 / 菜谱 / 推荐）',
  (await page.locator('#personalities, #dishbook, #recipe-lab, #recommend, .community-home, .bento, .char-grid').count()) === 0,
)
check(
  '首页保留：导航 + 模式切换 + 转盘 + 中央圆盘 + 探索入口',
  (await page.locator('.nav').count()) === 1 &&
    (await page.locator('.wheel-mode').count()) === 1 &&
    (await page.locator('.orbit').count()) === 1 &&
    (await page.locator('.orbit-disc').count()) === 1 &&
    (await page.locator('.hero__explore').count()) === 1,
)
const firstScreenContent = await page.evaluate(() => {
  const rectOk = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.top >= -2 && r.left >= -2 && r.bottom <= window.innerHeight + 2 && r.right <= window.innerWidth + 2
  }
  const nodesOk = [...document.querySelectorAll('.orbit-node__disc')].every((el) => {
    const r = el.getBoundingClientRect()
    return r.top >= -2 && r.left >= -2 && r.bottom <= window.innerHeight + 2 && r.right <= window.innerWidth + 2
  })
  return { switchOk: rectOk('.wheel-mode'), discOk: rectOk('.orbit-disc'), nodesOk }
})
check('中央标题圆盘 + 模式切换完整可见', firstScreenContent.switchOk && firstScreenContent.discOk)
check('八个外围节点全部在首屏内、不越界', firstScreenContent.nodesOk)

const navLinks = await page.$$eval('.nav__links a', (as) =>
  as.map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href') })),
)
check(
  '导航把「美食人格 / AI 菜谱 / 智能推荐 / 美食社区」指向探索页区块',
  ['美食人格#personalities', 'AI 菜谱#recipe-lab', '智能推荐#recommend', '美食社区#community'].every((pair) => {
    const [label, hash] = pair.split('#')
    return navLinks.some((l) => l.text === label && l.href === `/explore#${hash}`)
  }),
)
await page.screenshot({ path: 'shots/ui-home-desktop.png' })

/* ============================ 2. 主题数据自检 ============================ */
const themeData = await page.evaluate(async () => {
  const mod = await import('/src/data/visualThemes.ts')
  const map = mod.visualThemeMap
  const ids = Object.keys(map)
  const required = [
    'background',
    'primary',
    'secondary',
    'accent',
    'text',
    'mutedText',
    'transitionGradient',
    'glowColor',
    'chatBackground',
    'bubbleStyle',
    'buttonStyle',
  ]
  const missing = []
  for (const id of ids) {
    for (const key of required) if (map[id][key] === undefined || map[id][key] === '') missing.push(`${id}.${key}`)
    if (typeof map[id].bubbleStyle?.background !== 'string') missing.push(`${id}.bubbleStyle.background`)
    if (typeof map[id].bubbleStyle?.userBackground !== 'string') missing.push(`${id}.bubbleStyle.userBackground`)
    if (typeof map[id].buttonStyle?.background !== 'string') missing.push(`${id}.buttonStyle.background`)
  }
  return {
    ids,
    missing,
    cuisineIds: Object.keys(mod.cuisineThemes),
    tasteIds: Object.keys(mod.tasteThemes),
    primaries: ids.map((id) => map[id].primary.toUpperCase()),
    gradients: ids.map((id) => map[id].transitionGradient),
    kinds: Object.fromEntries(ids.map((id) => [id, map[id].kind])),
    expected: Object.fromEntries(ids.map((id) => [id, { primary: map[id].primary, bg: map[id].background }])),
    fallbackId: mod.getVisualTheme('__not_a_theme__').id,
    chuanKind: mod.getVisualTheme('chuan').kind,
    malaKind: mod.getVisualTheme('mala').kind,
    validity: mod.isThemeId('chuan') === true && mod.isThemeId('mala') === true && mod.isThemeId('烧烤') === false,
  }
})
check('主题总表 17 条（品牌 + 8 菜系 + 8 口味）', themeData.ids.length === 17, `ids=${themeData.ids.length}`)
check('八大菜系主题齐全', CUISINE_IDS.every((id) => themeData.cuisineIds.includes(id)) && themeData.cuisineIds.length === 8)
check('八种口味主题齐全', TASTE_IDS.every((id) => themeData.tasteIds.includes(id)) && themeData.tasteIds.length === 8)
check('每条主题字段齐全（含渐变 / 光效 / 气泡 / 按钮 / 聊天背景）', themeData.missing.length === 0, themeData.missing.slice(0, 4).join(', '))
check('16 个菜系/口味主色互不重复', new Set(themeData.primaries).size === themeData.ids.length, `unique=${new Set(themeData.primaries).size}/${themeData.ids.length}`)
check('16+1 条转场渐变互不重复', new Set(themeData.gradients).size === themeData.ids.length)
check(
  '菜系主题与口味主题没有共用同一条记录（kind 正确）',
  CUISINE_IDS.every((id) => themeData.kinds[id] === 'cuisine') &&
    TASTE_IDS.every((id) => themeData.kinds[id] === 'taste') &&
    themeData.kinds.brand === 'brand',
)
check('未知 id 回退品牌主题（不崩）', themeData.fallbackId === 'brand')
check('isThemeId 用稳定 id 判断（不是显示名）', themeData.validity)

/* 覆盖四角数学：从不同位置出发都必须覆盖四角 */
const coverCases = await page.evaluate(async () => {
  const { coverRadiusFor } = await import('/src/components/CircularTransition.tsx')
  const { width: vw, height: vh } = { width: window.innerWidth, height: window.innerHeight }
  const corners = [
    [0, 0],
    [vw, 0],
    [0, vh],
    [vw, vh],
  ]
  const points = [
    [0, 0],
    [vw, 0],
    [0, vh],
    [vw, vh],
    [vw / 2, 10],
    [17, vh - 9],
    [vw - 5, vh / 3],
    [vw / 2, vh / 2],
  ]
  return points.map(([x, y]) => {
    const r = coverRadiusFor(x, y, vw, vh)
    const farthest = Math.max(...corners.map(([cx, cy]) => Math.hypot(cx - x, cy - y)))
    return { x, y, ok: r >= farthest }
  })
})
check(
  '覆盖半径计算：8 个不同出发位置都能盖住视口四角',
  coverCases.every((c) => c.ok),
)

/* ============================ 3. 圆形揭示（川菜）：合成器圆形扩张 + 圆内提前出现真实目标页 ============================ */
await installRevealProbe(page)
const chuanDisc = await (async () => {
  const orbitBox = await page.locator('.orbit').boundingBox()
  await page.mouse.move(orbitBox.x + orbitBox.width / 2, orbitBox.y + orbitBox.height / 2)
  await page.waitForTimeout(320)
  return nodeDiscCenter(page, '川菜')
})()
await page.mouse.click(chuanDisc.x, chuanDisc.y)
await page.locator('.circular-transition').waitFor({ timeout: 2000 })

// 等到「圆内已有真实页面」的那一帧（关键帧本身也会被采集成证据）
await page.waitForFunction(
  () => Boolean(window.__reveal?.samples?.some((s) => s.themed > 0 && s.home > 0)),
  null,
  { timeout: 4000 },
)

const revealMid = await page.evaluate(() => {
  const r = window.__reveal
  return {
    first: r.samples[0],
    withPage: r.samples.find((s) => s.themed > 0) ?? null,
    mid: r.samples[Math.min(11, r.samples.length - 1)],
    overlayPos: r.overlayPos,
    overlayZ: r.overlayZ,
    anim: r.anim,
    animStart: r.animStart,
    clickAt: r.clickAt,
    mode: r.mode,
    geometry: r.geometry,
    rect: r.rect,
    nets: r.samples.filter((s) => s.scale && s.stageScale).map((s) => s.scale * s.stageScale),
    viewport: { w: window.innerWidth, h: window.innerHeight },
  }
})
check(
  '揭示层固定定位、位于页面内容之上但不遮挡站点导航',
  revealMid.overlayPos === 'fixed' && revealMid.overlayZ > 100 && revealMid.overlayZ < 300,
  `z=${revealMid.overlayZ}`,
)
check(
  '揭示层在点击后 1–2 帧内出现（不再等目标页挂载完才起动画）',
  revealMid.first.t <= 120,
  `firstSample=${revealMid.first.t}ms`,
)
check(
  '圆形从被点击的节点位置出发（揭示圆圆心 = 节点圆盘中心）',
  Boolean(revealMid.rect) &&
    Math.abs(revealMid.rect.x - chuanDisc.x) < 4 &&
    Math.abs(revealMid.rect.y - chuanDisc.y) < 4,
  revealMid.rect
    ? `(${Math.round(revealMid.rect.x)}, ${Math.round(revealMid.rect.y)}) vs 节点 (${Math.round(chuanDisc.x)}, ${Math.round(chuanDisc.y)})`
    : 'no rect',
)
check(
  '初始圆为节点大小（不是一上来就铺满）',
  Boolean(revealMid.geometry) &&
    Math.abs(revealMid.rect.radius - revealMid.geometry.startRadius) < 4 &&
    revealMid.geometry.startRadius <= Math.max(chuanDisc.r, 24) + 2 &&
    revealMid.geometry.startRadius < 120,
  revealMid.geometry ? `r=${Math.round(revealMid.geometry.startRadius)}px` : 'no geometry',
)
check(
  '扩张动画只有 transform（合成器动画，不重绘页面）、350–500ms、点击即起步',
  Boolean(revealMid.anim) &&
    JSON.stringify(revealMid.anim.properties) === '["transform"]' &&
    revealMid.anim.keyframes === 2 &&
    revealMid.anim.duration >= 350 &&
    revealMid.anim.duration <= 500 &&
    revealMid.anim.easing.includes('cubic-bezier(0.25, 0.35, 0.55, 1)') &&
    revealMid.animStart !== null &&
    revealMid.animStart - revealMid.clickAt <= 64,
  revealMid.anim
    ? `${revealMid.anim.duration}ms ${revealMid.anim.easing} keys=${revealMid.anim.properties.join(',')} start+${Math.round(revealMid.animStart - revealMid.clickAt)}ms`
    : 'missing',
)
const startScale = scaleOfKeyframe(revealMid.anim?.firstTransform)
const endScale = scaleOfKeyframe(revealMid.anim?.lastTransform)
check(
  '起止倍率与几何一致：从节点半径 / 覆盖半径 → 1（反向缩放同步到 1）',
  Boolean(revealMid.geometry) &&
    startScale !== null &&
    Math.abs(startScale - revealMid.geometry.startRadius / revealMid.geometry.coverRadius) < 0.002 &&
    endScale === 1,
  `scale ${startScale} → ${endScale}`,
)
check(
  '扩张终点半径按视口计算、能覆盖四角（无白边）',
  Boolean(revealMid.geometry) &&
    circleCoversViewport(
      revealMid.geometry.x,
      revealMid.geometry.y,
      revealMid.geometry.coverRadius,
      revealMid.viewport.w,
      revealMid.viewport.h,
    ),
  revealMid.geometry ? `r=${Math.round(revealMid.geometry.coverRadius)}px` : 'missing',
)
const nets = revealMid.nets.filter((n) => Number.isFinite(n))
const netOk = nets.filter((n) => Math.abs(n - 1) < 0.02).length
check(
  '圆的扩张与舞台逆缩放严格互补：圆内页面始终 1:1（不缩放 / 不抖动）',
  nets.length >= 5 && netOk >= Math.ceil(nets.length * 0.8),
  `1:1 ${netOk}/${nets.length} 帧，最差 ${nets.length ? Math.max(...nets.map((n) => Math.abs(n - 1))).toFixed(4) : '-'}`,
)
check(
  '扩张期间圆内已能看到真实目标页（川菜主题 + 角色名 + 聊天界面，不是纯色遮罩）',
  Boolean(revealMid.withPage) &&
    revealMid.withPage.themeId === 'chuan' &&
    revealMid.withPage.chat === 1 &&
    (revealMid.withPage.heroTitle || '').includes('川菜') &&
    revealMid.withPage.scale !== null &&
    revealMid.withPage.scale < 0.995,
  revealMid.withPage
    ? `@${revealMid.withPage.t}ms scale=${revealMid.withPage.scale} id=${revealMid.withPage.themeId} title=${revealMid.withPage.heroTitle}`
    : 'missing',
)
check(
  '扩张期间圆外仍是原首页（首页仍在、没有被纯色圆形盖住）',
  revealMid.mid.home === 1 &&
    revealMid.mid.pure === 0 &&
    revealMid.mode === 'preview' &&
    revealMid.first.pure === 0,
  `home=${revealMid.mid.home} pure=${revealMid.mid.pure} mode=${revealMid.mode}`,
)

await page.waitForURL('**/cuisines/chuan', { timeout: 6000 })
const navInfo = await page.evaluate(() => {
  const r = window.__reveal
  const last = [...r.samples].reverse().find((s) => s.t <= (r.navT ?? Infinity)) ?? null
  return {
    navT: r.navT,
    lastThemed: last?.themed ?? 0,
    lastHome: last?.home ?? 0,
    lastScale: last?.scale ?? null,
    themedNow: document.querySelectorAll('.theme-page[data-theme-id="chuan"]').length,
  }
})
check(
  '扩张走完才切换路由（约 420ms，不额外等待；切换时圆已铺满）',
  navInfo.navT !== null && navInfo.navT >= 400 && navInfo.navT <= 1000 && navInfo.lastThemed === 1,
  `navT=${navInfo.navT}ms scale=${navInfo.lastScale}`,
)
check(
  '切换瞬间圆内仍是真实目标页、圆外仍是首页（无占位色块 / 无白屏）',
  navInfo.lastThemed === 1 && navInfo.lastHome === 1 && navInfo.themedNow >= 1,
  `themed=${navInfo.lastThemed} home=${navInfo.lastHome} now=${navInfo.themedNow}`,
)
await page.locator('.circular-transition').waitFor({ state: 'detached', timeout: 6000 })
check('转场结束后揭示层完全卸载（无残留遮罩）', (await page.locator('.circular-transition').count()) === 0)
check('转场类已从 body 移除', await page.evaluate(() => !document.body.classList.contains('is-transitioning')))

/* 无缝衔接：落地页与预览层同一画面——不重播入场编排、不重播路由淡入 */
const arrivalState = await page.evaluate(() => ({
  titleAnim: getComputedStyle(document.querySelector('.theme-page .page-title')).animationName,
  titleOpacity: getComputedStyle(document.querySelector('.theme-page .page-title')).opacity,
  chatHeadAnim: getComputedStyle(document.querySelector('.theme-page .cuisine-chat__head')).animationName,
  routeFade: document.querySelector('.route-fade')?.className ?? '',
  revealTransition: getComputedStyle(document.querySelector('.theme-page .reveal')).transitionDuration,
}))
check(
  '落地即最终画面：跳过入场编排（世界名 / 聊天头不再从 0 淡入，无闪屏）',
  arrivalState.titleAnim === 'none' && arrivalState.chatHeadAnim === 'none' && arrivalState.titleOpacity === '1',
  `title anim=${arrivalState.titleAnim} opacity=${arrivalState.titleOpacity}`,
)
check('落地页跳过路由淡入（route-fade--skip）', arrivalState.routeFade.includes('route-fade--skip'), arrivalState.routeFade)
check('落地瞬间滚动渐入元素已呈现（无切换空窗）', arrivalState.revealTransition === '0s', arrivalState.revealTransition)

/* 主题表现：头像光效 / 发送按钮 / 装饰层 / 无循环动效 */
const worldFx = await page.evaluate(() => {
  const avatar = document.querySelector('.theme-page .chat-head__avatar')
  const sendBtn = document.querySelector('.theme-page .chat-composer .btn--primary')
  const deco = getComputedStyle(document.querySelector('.theme-page'), '::after')
  const running = document.getAnimations().filter((a) => {
    const el = a.effect && a.effect.target
    return a.playState === 'running' && el && el.closest && el.closest('.theme-page')
  })
  return {
    avatarShadow: avatar ? getComputedStyle(avatar).boxShadow : 'none',
    sendBg: sendBtn ? getComputedStyle(sendBtn).backgroundImage : '',
    decoBg: deco.backgroundImage,
    infinite: running.filter((a) => a.effect.getTiming().iterations === Infinity).length,
  }
})
check('AI 头像带主题光效（box-shadow 取主题 glow）', worldFx.avatarShadow.includes('232, 104, 58'), worldFx.avatarShadow.slice(0, 44))
check('聊天发送按钮跟随世界主题渐变（川菜赤红）', worldFx.sendBg.includes('200, 64, 44'), worldFx.sendBg.slice(0, 60))
check('主题轻量装饰层生效（::after 角落柔光）', worldFx.decoBg.includes('radial-gradient'))
check('落地后无循环装饰动画干扰阅读', worldFx.infinite === 0)

/* 分层入场：直接加载 / 刷新时播放（转场落地由圆形揭示完成，不重播） */
await page.goto(`${BASE}/cuisines/chuan`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(950)
const worldEntrance = await page.evaluate(() => {
  const selectors = {
    backRow: '.theme-page .page-back-row',
    title: '.theme-page .page-title',
    sub: '.theme-page .page-sub',
    chatHead: '.theme-page .cuisine-chat__head',
    composer: '.theme-page .chat-composer',
  }
  const anim = {}
  const opacity = {}
  for (const [key, sel] of Object.entries(selectors)) {
    const el = document.querySelector(sel)
    anim[key] = el ? getComputedStyle(el).animationName : 'missing'
    opacity[key] = el ? getComputedStyle(el).opacity : '0'
  }
  return { anim, opacity, routeFade: document.querySelector('.route-fade')?.className ?? '' }
})
check(
  '直接加载时：名称 / 介绍 / AI 人格头 / 输入框逐层入场（动画已挂上）',
  ['backRow', 'title', 'sub', 'chatHead', 'composer'].every((k) => worldEntrance.anim[k] && worldEntrance.anim[k] !== 'none'),
  JSON.stringify(worldEntrance.anim),
)
check(
  '入场收尾：世界名 / 输入框完全清晰（无半透明残留）',
  worldEntrance.opacity.title === '1' && worldEntrance.opacity.composer === '1',
  `title=${worldEntrance.opacity.title}`,
)
check('直接加载不套用落地页跳过（入场编排照常播放）', !worldEntrance.routeFade.includes('route-fade--skip'), worldEntrance.routeFade)
const chuanTheme = await page.evaluate((expected) => {
  const root = document.querySelector('.theme-page')
  const style = getComputedStyle(root)
  return {
    id: root.getAttribute('data-theme-id'),
    primary: style.getPropertyValue('--t-primary').trim(),
    bg: style.backgroundColor,
    chat: document.querySelectorAll('.cuisine-chat').length,
    expected,
  }
}, themeData.expected.chuan)
check('落地页主题 = 川菜（data-theme-id）', chuanTheme.id === 'chuan')
check('页面注入川菜主题主色（--t-primary）', chuanTheme.primary.toUpperCase() === chuanTheme.expected.primary.toUpperCase(), `${chuanTheme.primary} vs ${chuanTheme.expected.primary}`)
check('聊天区在主题页内正常渲染', chuanTheme.chat === 1)
await page.screenshot({ path: 'shots/ui-cuisine-chuan-themed.png' })

/* ============================ 4. 返回首页：直接跳转、不再有圆形转场 ============================ */
await page.evaluate(() => {
  window.__overlayMounts = 0
})
const backStart = Date.now()
await page.locator('.back-link--home').click()
await page.waitForURL((url) => url.pathname === '/', { timeout: 4000 })
const backMs = Date.now() - backStart
await page.waitForTimeout(500)
check('「回到首页」直接返回首页（无转场等待）', page.url() === `${BASE}/` || new URL(page.url()).pathname === '/', `${backMs}ms`)
const backOverlay = await page.evaluate(() => window.__overlayMounts)
check('返回首页不再触发圆形 / 遮罩转场（全过程没有出现转场层）', backOverlay === 0, `mounts=${backOverlay}`)
check('返回后无残留遮罩', (await page.locator('.circular-transition').count()) === 0)
await hoverPauseAndClick(page, '粤菜')
/* 证据帧：把揭示动画冻结在 150ms 再截图——确定的「圆内已是目标页、圆外还是首页」画面
   （截图会短暂占用渲染线程，冻结后不受影响；此处不做时长断言） */
const frozenFrame = await (async () => {
  for (let i = 0; i < 200; i += 1) {
    const state = await page.evaluate(() => {
      const overlay = document.querySelector('.circular-transition')
      const reveal = overlay?.querySelector('.circular-transition__reveal')
      const stage = overlay?.querySelector('.circular-transition__preview')
      if (!overlay || !reveal || !stage || !overlay.querySelector('.theme-page')) return null
      for (const anim of overlay.getAnimations({ subtree: true })) {
        anim.pause()
        const props = anim.effect.getKeyframes().flatMap((k) => Object.keys(k))
        if (props.includes('opacity')) {
          const timing = anim.effect.getTiming()
          anim.currentTime = Number(timing.duration) || 0
        } else {
          anim.currentTime = 150
        }
      }
      const box = reveal.getBoundingClientRect()
      return {
        radius: Math.round(box.width / 2),
        themeId: overlay.querySelector('.theme-page[data-theme-id]')?.getAttribute('data-theme-id') ?? null,
        home: document.querySelectorAll('#hero').length,
        pure: overlay.querySelectorAll('.circular-transition__reveal--color').length,
      }
    })
    if (state) return state
    await page.waitForTimeout(8)
  }
  return null
})()
await page.screenshot({ path: 'shots/world-reveal-mid.png' })
await page.evaluate(() => {
  const overlay = document.querySelector('.circular-transition')
  for (const anim of overlay?.getAnimations({ subtree: true }) ?? []) anim.play()
})
check(
  '扩张中途的画面可冻结取证（圆内目标页 / 圆外首页 / 无纯色圆）',
  Boolean(frozenFrame) &&
    frozenFrame.themeId === 'yue' &&
    frozenFrame.home === 1 &&
    frozenFrame.pure === 0 &&
    frozenFrame.radius > 100 &&
    frozenFrame.radius < 1050,
  frozenFrame ? `r=${frozenFrame.radius}px id=${frozenFrame.themeId}` : 'missing',
)
await page.waitForURL('**/cuisines/yue', { timeout: 6000 })
await page.locator('.circular-transition').waitFor({ state: 'detached', timeout: 6000 })
check('返回首页后转盘可正常继续点击（进入粤菜页）', page.url().endsWith('/cuisines/yue'))
check('粤菜页主题与川菜不同（无颜色残留）', await page.evaluate(() => {
  const primary = getComputedStyle(document.querySelector('.theme-page')).getPropertyValue('--t-primary').trim()
  return primary.toUpperCase() === '#2F8F66'
}))
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/ui-cuisine-yue-themed.png' })

/* 浏览器返回键：不走转场直接回首页，也必须无残留、可继续交互 */
await page.goBack()
await page.waitForURL((url) => url.pathname === '/', { timeout: 6000 })
await page.waitForTimeout(400)
check('浏览器返回键直回首页：无残留遮罩、转场类已清理', (await page.locator('.circular-transition').count()) === 0 && !(await page.evaluate(() => document.body.classList.contains('is-transitioning'))))

/* ============================ 5. 口味模式 + 模式记忆 + 直接返回 ============================ */
await page.locator('.wheel-mode__btn', { hasText: '口味探索' }).click()
await page.waitForTimeout(350)
check(
  '切换到口味探索模式（8 个口味节点）',
  JSON.stringify(await page.locator('.orbit-node__name').allTextContents()) === JSON.stringify(TASTE_NAMES),
)
await hoverPauseAndClick(page, '麻辣')
await page.waitForURL('**/tastes/mala', { timeout: 6000 })
await page.locator('.circular-transition').waitFor({ state: 'detached', timeout: 6000 })
const malaTheme = await page.evaluate((expected) => {
  const root = document.querySelector('.theme-page')
  return {
    id: root.getAttribute('data-theme-id'),
    primary: getComputedStyle(root).getPropertyValue('--t-primary').trim(),
    expected,
    chat: document.querySelectorAll('.cuisine-chat.taste-chat').length,
    route: location.pathname,
  }
}, themeData.expected.mala)
check('点击口味节点 → /tastes/mala（不是菜系页，也没有串到别的口味）', malaTheme.route === '/tastes/mala' && malaTheme.id === 'mala')
check('口味页使用麻辣专属主题（与菜系主题不共用颜色）', malaTheme.primary.toUpperCase() === malaTheme.expected.primary.toUpperCase() && malaTheme.primary.toUpperCase() !== chuanTheme.primary.toUpperCase())
check('口味聊天区正常渲染（taste-chat）', malaTheme.chat === 1)
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/ui-taste-mala-themed.png' })

/* 从口味页用导航「首页」直接回首页 → 模式保持口味探索 */
await page.evaluate(() => {
  window.__overlayMounts = 0
})
await page.locator('.nav__link', { hasText: '首页' }).click()
await page.waitForURL((url) => url.pathname === '/', { timeout: 4000 })
await page.waitForTimeout(400)
const navBackOverlay = await page.evaluate(() => window.__overlayMounts)
check('导航「首页」直接回首页（无圆形转场层）', navBackOverlay === 0 && (await page.locator('.circular-transition').count()) === 0, `mounts=${navBackOverlay}`)
const pressedMode = await page.locator('.wheel-mode__btn[aria-pressed="true"]').innerText()
check('返回首页后保留「口味探索」模式（不重置为默认）', pressedMode.trim() === '口味探索')

/* ============================ 6. 快速连点只发生一次转场 ============================ */
await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('.orbit-node')]
  const byText = (t) => buttons.find((b) => b.textContent.includes(t))
  byText('麻辣').click()
  window.setTimeout(() => byText('香甜').click(), 120)
})
await page.waitForURL('**/tastes/mala', { timeout: 6000 })
check('快速连点其他节点被忽略（落点是第一次点击的麻辣）', page.url().endsWith('/tastes/mala'))
await page.locator('.circular-transition').waitFor({ state: 'detached', timeout: 6000 })
check('连点后动画层仍正常清理', (await page.locator('.circular-transition').count()) === 0)

/* 刷新后无残留 */
await page.reload({ waitUntil: 'networkidle' })
check('转场页刷新后没有残留遮罩 / 类名', (await page.locator('.circular-transition').count()) === 0 && !(await page.evaluate(() => document.body.classList.contains('is-transitioning'))))

/* ============================ 7. 16 个主题页逐个生效 ============================ */
const themedErrors = []
for (const id of [...CUISINE_IDS, ...TASTE_IDS]) {
  const path = CUISINE_IDS.includes(id) ? `/cuisines/${id}` : `/tastes/${id}`
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' })
  await page.locator('.theme-page').waitFor({ timeout: 8000 })
  const info = await page.evaluate(() => {
    const root = document.querySelector('.theme-page')
    const style = getComputedStyle(root)
    return {
      id: root.getAttribute('data-theme-id'),
      primary: style.getPropertyValue('--t-primary').trim(),
      bg: style.getPropertyValue('--t-bg').trim(),
      chatBg: style.getPropertyValue('--t-chat-bg').trim(),
      overlay: document.querySelectorAll('.circular-transition').length,
    }
  })
  const expected = themeData.expected[id]
  const ok = info.id === id && info.primary.toUpperCase() === expected.primary.toUpperCase() && info.bg.toUpperCase() === expected.bg.toUpperCase() && info.chatBg.length > 20 && info.overlay === 0
  if (!ok) themedErrors.push(`${id}: ${JSON.stringify(info)} vs ${JSON.stringify(expected)}`)
}
check('16 个菜系/口味页逐个核对 data-theme-id 与主题变量（含聊天背景、无残留遮罩）', themedErrors.length === 0, themedErrors.slice(0, 2).join(' | '))

/* ============================ 8. 移动端：全屏 + 扩散覆盖 ============================ */
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const pm = await mobile.newPage()
track(pm, 'mobile')
await pm.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await pm.locator('.orbit-node').first().waitFor({ timeout: 8000 })
const mobileHero = await pm.locator('#hero').boundingBox()
check('移动端首页占满首屏（100dvh）', mobileHero.height >= 844 - 2, `height=${Math.round(mobileHero.height)}`)
check('移动端首页无横向溢出', await pm.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
const mobileLayout = await pm.evaluate(() => {
  const nodes = [...document.querySelectorAll('.orbit-node__disc')]
  const nodesOk = nodes.every((el) => {
    const r = el.getBoundingClientRect()
    return r.top >= -2 && r.left >= -2 && r.bottom <= window.innerHeight + 2 && r.right <= window.innerWidth + 2
  })
  const touchOk = nodes.every((el) => el.getBoundingClientRect().width >= 44)
  const switchBox = document.querySelector('.wheel-mode').getBoundingClientRect()
  const switchOk = switchBox.top >= 0 && switchBox.bottom <= window.innerHeight
  const discBox = document.querySelector('.orbit-disc').getBoundingClientRect()
  const discOk = discBox.top >= 0 && discBox.bottom <= window.innerHeight && discBox.left >= 0 && discBox.right <= window.innerWidth
  return { nodesOk, touchOk, switchOk, discOk }
})
check('移动端八个节点不重叠越界、未超出可视区域', mobileLayout.nodesOk)
check('移动端触控目标 ≥ 44px', mobileLayout.touchOk)
check('移动端模式切换 + 中央圆盘完整可见', mobileLayout.switchOk && mobileLayout.discOk)
await pm.screenshot({ path: 'shots/ui-home-mobile.png' })

await installRevealProbe(pm)
await hoverPauseAndClick(pm, '湘菜')
await pm.locator('.circular-transition').waitFor({ timeout: 2000 })
await pm.waitForFunction(
  () => Boolean(window.__reveal?.samples?.some((s) => s.themed > 0 && s.home > 0)),
  null,
  { timeout: 4000 },
)
const mobileReveal = await pm.evaluate(() => {
  const r = window.__reveal
  return {
    withPage: r.samples.find((s) => s.themed > 0) ?? null,
    mid: r.samples[Math.min(11, r.samples.length - 1)],
    geometry: r.geometry,
    anim: r.anim,
    viewport: { w: window.innerWidth, h: window.innerHeight },
  }
})
check(
  '移动端：圆形揭示从节点出发、按视口计算能覆盖四角',
  Boolean(mobileReveal.geometry) &&
    circleCoversViewport(
      mobileReveal.geometry.x,
      mobileReveal.geometry.y,
      mobileReveal.geometry.coverRadius,
      mobileReveal.viewport.w,
      mobileReveal.viewport.h,
    ) &&
    JSON.stringify(mobileReveal.anim?.properties) === '["transform"]',
  mobileReveal.geometry ? `r=${Math.round(mobileReveal.geometry.coverRadius)}px` : 'missing',
)
check(
  '移动端：圆内是真实湘菜页而圆外仍是首页',
  mobileReveal.withPage?.themeId === 'xiang' &&
    mobileReveal.withPage?.chat === 1 &&
    mobileReveal.withPage?.home === 1 &&
    mobileReveal.mid.home === 1,
  `id=${mobileReveal.withPage?.themeId} title=${mobileReveal.withPage?.heroTitle} home=${mobileReveal.mid.home}`,
)
check('移动端揭示过程中页面无横向溢出（不抖动）', await pm.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
await pm.waitForURL('**/cuisines/xiang', { timeout: 6000 })
await pm.locator('.circular-transition').waitFor({ state: 'detached', timeout: 6000 })
check('移动端进入湘菜页且无横向溢出', (await pm.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)) && pm.url().endsWith('/cuisines/xiang'))
await pm.waitForTimeout(600)
await pm.screenshot({ path: 'shots/ui-cuisine-xiang-mobile.png' })
await mobile.close()

/* 横屏手机 */
const landscape = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 })
const pl = await landscape.newPage()
track(pl, 'landscape')
await pl.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await pl.locator('.orbit-node').first().waitFor({ timeout: 8000 })
const landscapeLayout = await pl.evaluate(() => {
  const nodes = [...document.querySelectorAll('.orbit-node__disc')]
  return {
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    nodesOk: nodes.every((el) => {
      const r = el.getBoundingClientRect()
      return r.top >= -2 && r.left >= -2 && r.bottom <= window.innerHeight + 2 && r.right <= window.innerWidth + 2
    }),
    heroH: document.querySelector('#hero').getBoundingClientRect().height,
    switchVisible: (() => {
      const b = document.querySelector('.wheel-mode').getBoundingClientRect()
      return b.top >= 0 && b.bottom <= window.innerHeight
    })(),
  }
})
check('横屏手机：无横向溢出、节点不越界、切换可见', landscapeLayout.overflow <= 1 && landscapeLayout.nodesOk && landscapeLayout.switchVisible, `hero=${Math.round(landscapeLayout.heroH)}`)
await pl.screenshot({ path: 'shots/ui-home-landscape.png' })
await hoverPauseAndClick(pl, '苏菜')
await pl.waitForURL('**/cuisines/su', { timeout: 6000 })
await pl.locator('.circular-transition').waitFor({ state: 'detached', timeout: 6000 })
check('横屏手机：点击节点 → 苏菜页且无横向溢出', pl.url().endsWith('/cuisines/su') && (await pl.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)))
await landscape.close()

/* ============================ 9. reduced-motion：淡入淡出降级 ============================ */
const reducedCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const pr = await reducedCtx.newPage()
track(pr, 'reduced')
await pr.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await pr.locator('.orbit-node').first().waitFor({ timeout: 8000 })
await installRevealProbe(pr)
await hoverPauseAndClick(pr, '鲁菜')
await pr.waitForURL('**/cuisines/lu', { timeout: 4000 })
await pr.waitForTimeout(300)
const reducedState = await pr.evaluate(() => ({
  overlay: document.querySelectorAll('.circular-transition').length,
  mounts: window.__overlayMounts,
  themed: document.querySelectorAll('.theme-page[data-theme-id="lu"]').length,
}))
check(
  'reduced-motion：不做圆形揭示动画层，直接进入目标页',
  reducedState.mounts === 0 && reducedState.overlay === 0 && reducedState.themed === 1,
  `mounts=${reducedState.mounts}`,
)
const reducedWorld = await pr.evaluate(() => {
  const title = document.querySelector('.theme-page .page-title')
  const chatHead = document.querySelector('.theme-page .cuisine-chat__head')
  const deco = getComputedStyle(document.querySelector('.theme-page'), '::after')
  return {
    titleAnim: getComputedStyle(title).animationName,
    headAnim: getComputedStyle(chatHead).animationName,
    decoAnim: deco.animationName,
    titleOpacity: getComputedStyle(title).opacity,
  }
})
check(
  'reduced-motion：入场编排关闭、内容立即可见（不等待开场动画）',
  reducedWorld.titleAnim === 'none' && reducedWorld.headAnim === 'none' && reducedWorld.decoAnim === 'none' && reducedWorld.titleOpacity === '1',
)
check('reduced-motion：正确进入鲁菜页且无残留', pr.url().endsWith('/cuisines/lu') && (await pr.locator('.circular-transition').count()) === 0)
await reducedCtx.close()

/* ============================ 10. 探索页承接原首页模块 ============================ */
await page.goto(`${BASE}/explore`, { waitUntil: 'networkidle' })
check('探索页开场含原首页两个主入口', (await page.locator('.explore-hero__actions a[href="/personalities"]').count()) === 1 && (await page.locator('.explore-hero__actions a[href="/recommend"]').count()) === 1)
check(
  '探索页承接全部六个模块区块',
  (await page.locator('#personalities').count()) === 1 &&
    (await page.locator('#characters').count()) === 1 &&
    (await page.locator('#dishbook').count()) === 1 &&
    (await page.locator('#recipe-lab').count()) === 1 &&
    (await page.locator('#recommend').count()) === 1 &&
    (await page.locator('#community').count()) === 1,
)
check('探索页无横向溢出（桌面）', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
await page.screenshot({ path: 'shots/ui-explore-desktop.png' })

/* ============================ 汇总 ============================ */
await ctx.close()
check('全程无页面脚本异常', errors.length === 0, errors.slice(0, 3).join(' | '))
check('站内资源无 4xx/5xx', badResponses.length === 0, badResponses.slice(0, 3).join(' | '))

/* UTF-8 报告：Windows 控制台编码不稳定，失败清单以文件为准 */
writeFileSync(
  'tmp-ui-summary.txt',
  `${results.map((r) => `${r.ok ? 'PASS' : 'FAIL'} ${r.label}${r.extra ? ` — ${r.extra}` : ''}`).join('\n')}\nTOTAL=${results.length} FAIL=${failures}\n`,
  'utf8',
)

await browser.close()
console.log(failures === 0 ? '\n全部通过 ✓' : `\n${failures} 项未通过 ✗`)
process.exit(failures === 0 ? 0 : 1)
