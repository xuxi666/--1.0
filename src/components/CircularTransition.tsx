import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { getVisualTheme, type VisualTheme } from '../data/visualThemes'
import { markWorldArrival } from '../lib/worldArrival'

/**
 * CircularTransition — 圆形揭示转场（真实目标页作为揭示层）
 * ------------------------------------------------------------------
 * 首页点击菜系 / 口味节点时，圆内透出的就是**将要落地的目标页本身**：
 *
 *   1. 点击的处理函数里同步创建揭示层 DOM（不经过 React、不等下一帧）：
 *      一个以点击点为圆心、直径 = 覆盖半径 × 2 的圆形容器，里面按点击点反向缩放
 *      一个视口大小的舞台；**两层都用 transform: scale() 做扩张**，只走合成器，
 *      不重绘页面内容 —— 主线程再忙（挂载目标页、切路由）圆边也不会卡顿；
 *   2. 舞台用等比例的逆变换抵消容器的缩放，所以圆内的页面始终 1:1 贴住视口、
 *      不发生位移或拉伸；圆形只是它的「取景框」；
 *   3. 首帧（小圆 + 世界底色）画出来之后，才把真实目标页挂载进舞台（由 App 注入
 *      renderPreview：同一套 <Routes> 渲染 /cuisines/:id 或 /tastes/:id）。
 *      挂载会占用主线程，但此时动画已经在合成器上跑，扩张不受影响；挂载完成后
 *      内容以 opacity 淡入（同样只动合成器属性）；
 *   4. 扩张走完（圆已盖满整屏）立刻 markWorldArrival + 切路由：真实页面在
 *      **已经被圆形完全覆盖**的位置挂载、完成首绘之后，直接移除揭示层 ——
 *      没有淡出等待、没有闪屏，落地即最终画面；挂载一完成就先放开指针事件，
 *      交互不必等揭示层摘除。
 *   5. 非聊天目标（如首页中央「开始探索」）没有可预览的真实页面，用同一个圆形容器
 *      载主题渐变兜底，节奏与揭示一致（420ms 覆盖 → 切路由 → 260ms 淡出）。
 *
 * 返回首页（back）不做任何转场：直接执行路由跳转。
 *
 * 防重：busyRef 锁 + runId 代际校验 + 6s 看门狗 + try/finally 收尾；
 * 降级：prefers-reduced-motion 时完全不做动画层，直接进入目标页。
 */

/** 支持「真实页面预览」揭示的目标路由（有可渲染的聊天页） */
const PREVIEW_PATH_RE = /^\/(?:cuisines|tastes)\/[^/?#]+$/

/** 圆形揭示时长：350–500ms 区间内的 420ms */
export const PREVIEW_EXPAND_MS = 420

/**
 * 揭示缓动控制点：起步就有速度（点击即扩张），中段持续推进，末段柔和收住。
 * 时间走到 82% 时半径已走完约 97%（覆盖四角），全程都能看到圆边在动，
 * 不会出现「一瞬间铺满、后面干等」的停顿。
 */
const EXPAND_BEZIER = [0.25, 0.35, 0.55, 1] as const
const EXPAND_EASING = `cubic-bezier(${EXPAND_BEZIER.join(', ')})`

/**
 * 内容淡入的完成时点（占扩张时长）：页面一挂载就开始淡入、按剩余时间缩短，
 * 保证圆边盖满整屏之前预览已经完全不透明。
 */
const CONTENT_FADE_BY_RATIO = 0.86
const CONTENT_FADE_BY_MS = Math.round(PREVIEW_EXPAND_MS * CONTENT_FADE_BY_RATIO)

/** 预览内容淡入上限（挂载完成后才开始，按剩余时间自适应缩短，落地前一定完成） */
const STAGE_FADE_MS = 200

/** 逆缩放关键帧的半径步进：每段半径增长 ≤4%，线性插值误差 <0.05%（亚像素级） */
const COUNTER_SCALE_STEP = 1.04

/** 与 CSS cubic-bezier 等价的三次贝塞尔求值（x → y） */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x: number) => {
    let t = x
    for (let i = 0; i < 8; i += 1) {
      const error = sampleX(t) - x
      if (Math.abs(error) < 1e-6) break
      const slope = slopeX(t)
      if (Math.abs(slope) < 1e-6) break
      t -= error / slope
    }
    return sampleY(Math.min(1, Math.max(0, t)))
  }
}

/** 单调缓动曲线的反解：给定 y 求 x（二分） */
function invertEase(ease: (x: number) => number): (y: number) => number {
  return (y: number) => {
    let low = 0
    let high = 1
    for (let i = 0; i < 26; i += 1) {
      const mid = (low + high) / 2
      if (ease(mid) < y) low = mid
      else high = mid
    }
    return (low + high) / 2
  }
}

const expandEase = cubicBezier(...EXPAND_BEZIER)
const expandEaseInverse = invertEase(expandEase)

/**
 * 舞台的逆缩放关键帧。
 *
 * 关键点：容器按 s(t) 放大，舞台必须按 1/s(t) 缩小，两者相乘恒为 1 ——
 * 1/s(t) 是双曲线，用「从 1/s0 线性补间到 1」会算错（中途内容会放大数倍）。
 * 这里沿扩张曲线求出一串采样点，让每段的半径增长 ≤8%，把双曲线近似到亚像素级；
 * 每段都是 linear，动画依旧整体跑在合成器上。
 */
function counterScaleKeyframes(startScale: number): Keyframe[] {
  const frames: Keyframe[] = [
    { offset: 0, transform: `scale(${1 / startScale})`, easing: 'linear' },
  ]
  let scale = startScale
  while (scale * COUNTER_SCALE_STEP < 1) {
    scale *= COUNTER_SCALE_STEP
    const progress = (scale - startScale) / (1 - startScale)
    frames.push({
      offset: Math.min(1, Math.max(0, expandEaseInverse(progress))),
      transform: `scale(${1 / scale})`,
      easing: 'linear',
    })
  }
  frames.push({ offset: 1, transform: 'scale(1)' })
  return frames
}

export type TransitionOrigin = {
  /** 被点击圆形的屏幕中心 X（px） */
  x: number
  /** 被点击圆形的屏幕中心 Y（px） */
  y: number
  /** 被点击圆形的半径（px） */
  r: number
}

export type StartTransitionRequest = {
  /** 目标路由（如 /cuisines/chuan） */
  to: string
  /** 主题 id（cuisineId / tasteId / brand）；未知 id 回退品牌主题 */
  themeId: string
  /** 点击位置；缺省时从视口中心出发 */
  origin?: TransitionOrigin | null
}

type TransitionApi = {
  /** 从点击位置圆形揭示进入目标页；转场进行中重复调用会被忽略 */
  start: (request: StartTransitionRequest) => void
  /** 返回首页（默认 '/'）：直接跳转，不做任何转场动画 */
  back: (to?: string) => void
  /** 是否有转场正在进行（供调用方做防重 / 视觉减权） */
  active: boolean
}

const CircularTransitionContext = createContext<TransitionApi | null>(null)

export function useCircularTransition(): TransitionApi {
  const ctx = useContext(CircularTransitionContext)
  if (!ctx) {
    throw new Error('useCircularTransition 必须在 <CircularTransitionProvider> 内使用')
  }
  return ctx
}

/** true 表示当前组件渲染在转场预览层里（真实页面组件的第二次挂载） */
const WorldPreviewContext = createContext(false)

/**
 * 预览层里的真实页面不应触发「只有落地后才该发生」的副作用
 * （例如聊天页 ?q= 的自动发送——预览层提前发送会消耗掉外部带入的问题）。
 */
export function useWorldPreview(): boolean {
  return useContext(WorldPreviewContext)
}

/** 覆盖视口四角所需半径：取点击点到四个角的最远距离 + 4% 余量 */
export function coverRadiusFor(x: number, y: number, vw: number, vh: number): number {
  const distances = [
    Math.hypot(x, y),
    Math.hypot(vw - x, y),
    Math.hypot(x, vh - y),
    Math.hypot(vw - x, vh - y),
  ]
  return Math.max(...distances) * 1.04 + 8
}

/** 点击点到最远视口角的距离（圆边越过它的那一刻，整屏都已被目标页盖住） */
export function farthestCornerDistance(x: number, y: number, vw: number, vh: number): number {
  return Math.max(
    Math.hypot(x, y),
    Math.hypot(vw - x, y),
    Math.hypot(x, vh - y),
    Math.hypot(vw - x, vh - y),
  )
}

type RevealMode = 'preview' | 'circle'

type OverlayState = {
  runId: number
  mode: RevealMode
  theme: VisualTheme
  target: string
  /** 预览舞台（真实页面由 portal 挂载到这里；兜底模式下为 null） */
  stage: HTMLDivElement | null
}

type RevealNodes = {
  shell: HTMLDivElement
  reveal: HTMLDivElement
  stage: HTMLDivElement | null
  grow: Animation
  counter: Animation | null
}

const waitFrames = (count: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve()
        return
      }
      window.requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })

/**
 * 等到当前帧绘制完成：rAF 回调在绘制前执行，所以再从回调里排一个宏任务，
 * 首帧（圆形 + 世界底色）就已经真正画到屏幕上了。
 */
const afterFirstPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.setTimeout(resolve, 0)
    })
  })

/** 动画时钟（ms）；浏览器兼容写法下 currentTime 可能是 CSSNumericValue */
const animTime = (anim: Animation): number => {
  const value = anim.currentTime
  return typeof value === 'number' ? value : 0
}

/**
 * 轮询一个条件（按帧），最多等 count 帧；超时也放行，避免任何情况卡死收尾
 */
const waitForCondition = (predicate: () => boolean, count: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => {
      if (left <= 0 || predicate()) {
        resolve()
        return
      }
      window.requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 同步创建揭示层并立刻启动扩张动画。
 *
 * 结构（只在预览模式下有舞台）：
 *   .circular-transition                     全屏壳，拦截点击、裁掉视口外
 *     .circular-transition__reveal           2R × 2R 圆形取景框，scale(s) 扩张
 *       .circular-transition__preview        视口大小舞台，scale(1/s) 抵消，页面 1:1
 */
function createRevealNodes(input: {
  mode: RevealMode
  theme: VisualTheme
  target: string
  origin: TransitionOrigin
  coverRadius: number
  startRadius: number
}): RevealNodes {
  const { mode, theme, target, origin, coverRadius, startRadius } = input
  const startScale = Math.min(1, Math.max(0.0001, startRadius / coverRadius))
  const counterScale = 1 / startScale

  const shell = document.createElement('div')
  shell.className = 'circular-transition'
  shell.setAttribute('aria-hidden', 'true')
  shell.dataset.mode = mode
  shell.dataset.target = target
  shell.dataset.themeId = theme.id
  shell.dataset.originX = String(origin.x)
  shell.dataset.originY = String(origin.y)
  shell.dataset.startRadius = String(startRadius)
  shell.dataset.coverRadius = String(coverRadius)

  const reveal = document.createElement('div')
  reveal.className = 'circular-transition__reveal'
  reveal.style.left = `${origin.x - coverRadius}px`
  reveal.style.top = `${origin.y - coverRadius}px`
  reveal.style.width = `${coverRadius * 2}px`
  reveal.style.height = `${coverRadius * 2}px`
  reveal.style.transform = `scale(${startScale})`
  if (mode === 'preview') {
    // 页面挂载完成前先露「世界的底色」：以点击点为原点的主题柔光 + 主题背景，
    // 避免出现与主题无关的纯色占位块
    reveal.style.background = `radial-gradient(circle at 50% 50%, ${theme.glowColor} 0%, transparent 58%), ${theme.background}`
  } else {
    reveal.classList.add('circular-transition__reveal--color')
    reveal.style.setProperty('--t-glow', theme.glowColor)
    reveal.style.background = theme.transitionGradient
  }
  shell.appendChild(reveal)

  let stage: HTMLDivElement | null = null
  if (mode === 'preview') {
    const vw = document.documentElement.clientWidth || window.innerWidth
    const vh = document.documentElement.clientHeight || window.innerHeight
    stage = document.createElement('div')
    stage.className = 'circular-transition__preview'
    stage.setAttribute('inert', '')
    stage.dataset.target = target
    stage.dataset.themeId = theme.id
    // 舞台放在「视口原点」在容器里的对应位置，并以点击点为中心做逆缩放：
    // 与容器的缩放严格同源，合成后恒等于 1:1 且不发生位移
    stage.style.left = `${-(origin.x - coverRadius)}px`
    stage.style.top = `${-(origin.y - coverRadius)}px`
    stage.style.width = `${vw}px`
    stage.style.height = `${vh}px`
    stage.style.transformOrigin = `${origin.x}px ${origin.y}px`
    stage.style.transform = `scale(${counterScale})`
    stage.style.opacity = '0'
    reveal.appendChild(stage)
  }

  document.body.appendChild(shell)

  // 动画在点击的同一个任务里启动：首帧就能看到圆开始扩张
  const grow = reveal.animate(
    [{ transform: `scale(${startScale})` }, { transform: 'scale(1)' }],
    { duration: PREVIEW_EXPAND_MS, easing: EXPAND_EASING, fill: 'forwards' },
  )
  const counter = stage
    ? stage.animate(counterScaleKeyframes(startScale), {
        duration: PREVIEW_EXPAND_MS,
        fill: 'forwards',
      })
    : null

  return { shell, reveal, stage, grow, counter }
}

export type CircularTransitionProviderProps = {
  children: ReactNode
  /**
   * 渲染目标页面的真实预览（由 App 注入，避免 Provider 与页面组件相互 import）：
   * 收到目标 location 字符串，返回该路由的真实页面元素（主题背景 / 角色 / 聊天界面）。
   * 缺省或目标不是聊天页时，退化为主题渐变圆形覆盖转场。
   */
  renderPreview?: (to: string) => ReactNode
}

export function CircularTransitionProvider({ children, renderPreview }: CircularTransitionProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = useRef(location)
  locationRef.current = location

  const [overlay, setOverlay] = useState<OverlayState | null>(null)
  const [active, setActive] = useState(false)

  const renderPreviewRef = useRef(renderPreview)
  renderPreviewRef.current = renderPreview

  const busyRef = useRef(false)
  const runIdRef = useRef(0)
  const mountedRef = useRef(true)
  const watchdogRef = useRef<number | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const animationsRef = useRef<Animation[]>([])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      document.body.classList.remove('is-transitioning')
      if (watchdogRef.current !== null) {
        window.clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      const shell = shellRef.current
      shellRef.current = null
      if (shell?.parentNode) shell.parentNode.removeChild(shell)
      const animations = animationsRef.current
      animationsRef.current = []
      for (const anim of animations) {
        try {
          anim.cancel()
        } catch {
          /* 已结束 / 已取消 */
        }
      }
    }
  }, [])

  const finish = useCallback((runId: number) => {
    if (runIdRef.current !== runId) return
    // 作废本次运行：所有 async 分支之后都会自行退出
    runIdRef.current += 1
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
    busyRef.current = false
    document.body.classList.remove('is-transitioning')

    // 先摘掉揭示层，再取消动画：取消还原的是被覆盖后的画面，不会被看到
    const shell = shellRef.current
    shellRef.current = null
    if (shell?.parentNode) shell.parentNode.removeChild(shell)
    const animations = animationsRef.current
    animationsRef.current = []
    for (const anim of animations) {
      try {
        anim.cancel()
      } catch {
        /* 已结束 / 已取消 */
      }
    }

    if (mountedRef.current) {
      setOverlay(null)
      setActive(false)
    }
  }, [])

  const start = useCallback(
    (request: StartTransitionRequest) => {
      if (busyRef.current) return
      const target = request.to
      const pathname = target.split(/[?#]/)[0]
      const canPreview = Boolean(renderPreviewRef.current) && PREVIEW_PATH_RE.test(pathname)

      // 减少动态效果：不做任何遮罩与扩散，直接进入目标页
      if (prefersReducedMotion()) {
        navigate(target)
        return
      }

      const runId = ++runIdRef.current
      const theme = getVisualTheme(request.themeId)
      const vw = window.innerWidth
      const vh = window.innerHeight
      const origin = request.origin ?? { x: vw / 2, y: vh / 2, r: 46 }
      const coverRadius = coverRadiusFor(origin.x, origin.y, vw, vh)
      const startRadius = Math.min(Math.max(origin.r, 24), coverRadius)
      const fromPath = locationRef.current.pathname
      const mode: RevealMode = canPreview ? 'preview' : 'circle'
      const alive = () => mountedRef.current && runIdRef.current === runId

      busyRef.current = true
      document.body.classList.add('is-transitioning')
      setActive(true)

      // 同步建层并启动动画：点击 → 圆形开始扩张之间不插入任何等待
      const nodes = createRevealNodes({ mode, theme, target, origin, coverRadius, startRadius })
      shellRef.current = nodes.shell
      animationsRef.current = nodes.counter ? [nodes.grow, nodes.counter] : [nodes.grow]

      // 兜底看门狗：任何 promise 未按时收场都强制清理，绝不留下永久遮罩
      watchdogRef.current = window.setTimeout(() => finish(runId), 6000)

      const fadeOutAndLeave = async () => {
        const fade = nodes.reveal.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 220,
          easing: 'ease-out',
          fill: 'forwards',
        })
        animationsRef.current.push(fade)
        await fade.finished
      }

      void (async () => {
        try {
          if (mode === 'preview' && nodes.stage) {
            const stage = nodes.stage

            // 1) 首帧（小圆 + 世界底色）先上屏，再挂载真实页面：
            //    挂载会占主线程，但扩张已经在合成器上，圆边不会因此卡住
            await afterFirstPaint()
            if (!alive()) return
            setOverlay({ runId, mode, theme, target, stage })

            // 2) 内容一到位就开始淡入（只动 opacity；时长按剩余时间自适应，
            //    在圆边覆盖四角之前完成，落地时不会看到半透明的页面）
            await waitForCondition(() => stage.childElementCount > 0, 90)
            if (!alive()) return
            const remaining = Math.round(CONTENT_FADE_BY_MS - animTime(nodes.grow))
            const fadeMs = Math.max(90, Math.min(STAGE_FADE_MS, remaining))
            const fade = stage.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: fadeMs,
              easing: 'ease-out',
              fill: 'forwards',
            })
            animationsRef.current.push(fade)

            // 3) 扩张走完（圆已盖满整屏）→ 立刻切路由：
            //    真实页面的挂载、布局与首绘全部发生在被圆形完全覆盖的位置上
            await nodes.grow.finished.catch(() => undefined)
            if (!alive()) return

            if (locationRef.current.pathname !== fromPath) {
              // 揭示期间路由被别的操作切走：不抢导航，淡出收场
              await fadeOutAndLeave()
              return
            }

            markWorldArrival(pathname)
            navigate(target)

            // 4) 等真实页面挂载完成 → 立刻放开指针事件（交互不必等揭示层摘除）
            //    → 再等几帧让它完成首绘 → 直接移除揭示层（不做淡出）
            await waitForCondition(
              () =>
                [...document.querySelectorAll('.theme-page')].some(
                  (el) => !el.closest('.circular-transition'),
                ),
              120,
            )
            if (!alive()) return
            nodes.shell.style.pointerEvents = 'none'
            await waitFrames(3)
            return
          }

          // 兜底：没有真实页面可预览（如首页中央「开始探索」）→ 主题渐变圆形覆盖
          await nodes.grow.finished.catch(() => undefined)
          if (!alive()) return
          if (locationRef.current.pathname !== fromPath) {
            await fadeOutAndLeave()
            return
          }
          navigate(target)
          await waitFrames(2)
          if (!alive()) return
          const fade = nodes.reveal.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 260,
            easing: 'cubic-bezier(0.32, 0, 0.24, 1)',
            fill: 'forwards',
          })
          animationsRef.current.push(fade)
          await fade.finished
        } catch {
          /* AbortError / 动画被取消 / 页面卸载：交由 finally 收尾 */
        } finally {
          finish(runId)
        }
      })()
    },
    [finish, navigate],
  )

  /** 返回首页：直接跳转，不使用圆形／遮罩转场（进入动画只保留在「进入聊天页」方向） */
  const back = useCallback(
    (to = '/') => {
      navigate(to)
    },
    [navigate],
  )

  const api = useMemo<TransitionApi>(() => ({ start, back, active }), [start, back, active])

  /**
   * 预览层里的真实页面：portal 到同步创建的舞台节点里，
   * 这样动画在点击的同一帧就开始，页面挂载晚一帧也不会拖慢扩张。
   */
  const renderPreviewContent = renderPreviewRef.current
  const previewPortal =
    overlay?.mode === 'preview' && overlay.stage && renderPreviewContent
      ? createPortal(
          <WorldPreviewContext.Provider value={true}>
            {renderPreviewContent(overlay.target)}
          </WorldPreviewContext.Provider>,
          overlay.stage,
        )
      : null

  return (
    <CircularTransitionContext.Provider value={api}>
      {children}
      {previewPortal}
    </CircularTransitionContext.Provider>
  )
}
