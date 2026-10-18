import { useEffect, useState } from 'react'

/**
 * worldArrival — 记录「圆形揭示转场」刚刚把用户送进的目标页
 * ------------------------------------------------------------
 * 转场落地时真实页面会在预览层之下重新挂载：预览层里展示的已经是世界的最终画面，
 * 因此落地页必须跳过自己的入场编排（world-enter）与路由淡入（route-fade），
 * 否则「移除预览层」的瞬间会露出一个还没淡入的页面，产生闪屏。
 *
 * 用「路由 + 时间戳」而不是一次性消费标记：
 * - 纯读取、幂等，StrictMode 双跑组件体也拿到一致结果；
 * - 只在很短的窗口内生效，之后同一路由的正常进入（刷新、普通链接）依旧播放入场动画。
 */
type Arrival = { path: string; at: number }

const ARRIVAL_WINDOW_MS = 2000
let lastArrival: Arrival | null = null

/** 转场即将落地时调用：标记目标 pathname（不含 query / hash） */
export function markWorldArrival(pathname: string) {
  lastArrival = { path: pathname, at: Date.now() }
}

/** 该 pathname 是否是刚刚由转场送进来的页面 */
export function isWorldArrival(pathname: string): boolean {
  return Boolean(lastArrival && lastArrival.path === pathname && Date.now() - lastArrival.at < ARRIVAL_WINDOW_MS)
}

/**
 * 转场落地页的额外类名：
 * - `no-enter`：永久关闭该实例的入场编排，与预览层保持同一画面；
 * - `skip-reveal`：落地后 900ms 内让滚动渐入元素直接呈现（避开切换瞬间的落差），
 *   随后移除，页面下半部分的滚动渐入恢复正常。
 */
export function useWorldArrivalClass(pathname: string): string {
  const [arrived] = useState(() => isWorldArrival(pathname))
  const [skipReveal, setSkipReveal] = useState(arrived)

  useEffect(() => {
    if (!skipReveal) return
    const timer = window.setTimeout(() => setSkipReveal(false), 900)
    return () => window.clearTimeout(timer)
  }, [skipReveal])

  if (!arrived) return ''
  return skipReveal ? 'no-enter skip-reveal' : 'no-enter'
}
