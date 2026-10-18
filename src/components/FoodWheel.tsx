import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { useReducedMotion } from '../lib/hooks'
import FoodPhoto from './FoodPhoto'
import type { TransitionOrigin } from './CircularTransition'

/**
 * FoodWheel — 通用环形转盘（首页「八大菜系 / 口味探索」两种模式共用的布局组件）
 * ------------------------------------------------------------
 * 三层结构保证「节点沿轨道旋转，但文字始终正向」：
 *   .orbit-rotor   匀速自转（θ）
 *   .orbit-slot    rotate(a) translate(r) rotate(-a)  -> 把节点摆到圆周上
 *   .orbit-counter rotate(-θ)                        -> 抵消父级自转
 * 悬停 / 聚焦时暂停动画并预览该节点；点击任意节点交给父组件决定跳转。
 *
 * 本组件只负责「转盘怎么转、怎么被操作」，节点数据、中心文案与跳转目标由父组件
 * （HomeFoodWheel）按模式提供——两种模式各自有独立的数据配置，组件本身不认菜系或口味。
 */
export type WheelItem = {
  /** 稳定 id（菜系 id 或口味 id） */
  id: string
  /** 展示名称（如「川菜」「麻辣」） */
  name: string
  /** 人格标签（第二行，如「热烈直球派」） */
  tag: string
  /** 第三行小字（菜系用地域；口味用代表菜摘要） */
  meta: string
  /** 序号（中心圆盘展示用，如 01） */
  index: string
  /** 中心圆盘预览里的代表菜摘要（已拼接好，如「代表菜：麻婆豆腐、水煮鱼」） */
  previewDishes: string
  /** 节点图片（菜系图或菜品图） */
  image: string
  /** 图片加载失败时的备用图 */
  fallbackImage?: string
  /** 图片本身是哪道菜（Photo 组件与 alt 使用；口味模式为对应菜品名） */
  photoName: string
  emoji: string
  palette?: { base: string; deep: string; light: string }
  /** 无障碍名称（完整描述这个节点是什么、点击后去哪） */
  ariaLabel: string
}

type Props = {
  items: WheelItem[]
  /**
   * 数据源标识：切换模式时变化，驱动整盘内容重建与入场动画，
   * 保证不会出现上一个模式的名称、图片或按钮残留。
   */
  sourceKey: string
  /** 转盘的无障碍名称 */
  ariaLabel: string
  /** 中心圆盘内容（active 为当前悬停 / 聚焦的节点；null 表示默认文案） */
  renderCenter: (active: WheelItem | null) => ReactNode
  /** 点击节点：id 为稳定节点 id，origin 为被点击圆形的屏幕位置（供圆形扩散转场使用） */
  onSelect: (id: string, origin: TransitionOrigin) => void
  /** 底部操作提示 */
  hint: ReactNode
}

export default function FoodWheel({
  items,
  sourceKey,
  ariaLabel,
  renderCenter,
  onSelect,
  hint,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = useReducedMotion()

  const active = items.find((item) => item.id === activeId) ?? null
  const step = 360 / Math.max(1, items.length)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']
      if (!keys.includes(event.key)) return
      const current = nodeRefs.current.findIndex((el) => el === document.activeElement)
      if (current < 0) return
      event.preventDefault()
      const dir = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
      const next = (current + dir + items.length) % items.length
      nodeRefs.current[next]?.focus()
    },
    [items.length],
  )

  const clearPreview = useCallback(() => {
    setPaused(false)
    setActiveId(null)
  }, [])

  return (
    <>
      <div className="wheel-stage wheel-in" key={sourceKey}>
        <div
          className={`orbit ${paused ? 'is-paused' : ''} ${reduced ? 'is-reduced' : ''}`}
          role="group"
          aria-label={ariaLabel}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={clearPreview}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) clearPreview()
          }}
          onKeyDown={handleKeyDown}
        >
          {/* 静态轨道 */}
          <div className="orbit-ring orbit-ring--outer" aria-hidden="true" />
          <div className="orbit-ring orbit-ring--main" aria-hidden="true" />
          <div className="orbit-ring orbit-ring--inner" aria-hidden="true" />
          <div className="orbit-ticks" aria-hidden="true" />
          <div className="orbit-glow" aria-hidden="true" />

          {/* 旋转层：节点列表（数据由父组件按模式提供） */}
          <div className="orbit-rotor">
            {items.map((item, index) => {
              const angle = -90 + index * step
              const isActive = item.id === activeId
              return (
                <div
                  key={item.id}
                  className="orbit-slot"
                  style={{ '--a': `${angle}deg` } as CSSProperties}
                >
                  <div className="orbit-counter">
                    <button
                      ref={(el) => {
                        nodeRefs.current[index] = el
                      }}
                      type="button"
                      className={`orbit-node ${isActive ? 'is-active' : ''}`}
                      aria-label={item.ariaLabel}
                      onClick={(event) => {
                        // 用被点击的圆形节点做转场圆心（不用数组下标 / 显示名判断对象）
                        const disc = event.currentTarget.querySelector('.orbit-node__disc')
                        const rect = (disc ?? event.currentTarget).getBoundingClientRect()
                        onSelect(item.id, {
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2,
                          r: Math.max(24, rect.width / 2),
                        })
                      }}
                      onMouseEnter={() => setActiveId(item.id)}
                      onFocus={() => setActiveId(item.id)}
                    >
                      <span className="orbit-node__disc">
                        <FoodPhoto
                          name={item.photoName}
                          src={item.image}
                          fallbackSrc={item.fallbackImage}
                          emoji={item.emoji}
                          palette={item.palette}
                          alt={`${item.name}代表菜`}
                          eager
                        />
                        <span className="orbit-node__halo" aria-hidden="true" />
                      </span>
                      <span className="orbit-node__meta">
                        <span className="orbit-node__name">{item.name}</span>
                        <span className="orbit-node__tag">{item.tag}</span>
                        <span className="orbit-node__region">{item.meta}</span>
                      </span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 中心圆盘 */}
          <div className="orbit-disc">
            <div
              className="orbit-disc__inner"
              key={`${sourceKey}:${active ? active.id : 'brand'}`}
              aria-live="polite"
            >
              {renderCenter(active)}
            </div>
          </div>
        </div>
      </div>

      <p className="orbit-hint">{hint}</p>
    </>
  )
}
