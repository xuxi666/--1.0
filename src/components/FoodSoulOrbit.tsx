import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cuisines } from '../data/cuisines'
import { useReducedMotion } from '../lib/hooks'
import FoodPhoto from './FoodPhoto'

/**
 * FoodSoulOrbit — 八大菜系旋转星环
 * ------------------------------------------------------------
 * 三层结构保证「节点沿轨道旋转，但文字始终正向」：
 *   .orbit-rotor   匀速自转（θ）
 *   .orbit-slot    rotate(a) translate(r) rotate(-a)  -> 把节点摆到圆周上
 *   .orbit-counter rotate(-θ)                        -> 抵消父级自转
 * 悬停 / 聚焦时暂停动画并预览该菜系；点击任意菜系进入 /cuisines/:id 探索页。
 */
export default function FoodSoulOrbit() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = useReducedMotion()
  const navigate = useNavigate()

  const active = cuisines.find((cuisine) => cuisine.id === activeId) ?? null

  const step = 360 / cuisines.length

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']
    if (!keys.includes(event.key)) return
    const current = nodeRefs.current.findIndex((el) => el === document.activeElement)
    if (current < 0) return
    event.preventDefault()
    const dir = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
    const next = (current + dir + cuisines.length) % cuisines.length
    nodeRefs.current[next]?.focus()
  }, [])

  const clearPreview = useCallback(() => {
    setPaused(false)
    setActiveId(null)
  }, [])

  return (
    <div className="orbit-wrap">
      <div
        className={`orbit ${paused ? 'is-paused' : ''} ${reduced ? 'is-reduced' : ''}`}
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

        {/* 旋转层：八大菜系 */}
        <div className="orbit-rotor">
          {cuisines.map((cuisine, index) => {
            const angle = -90 + index * step
            const isActive = cuisine.id === activeId
            return (
              <div
                key={cuisine.id}
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
                    aria-label={`${cuisine.name}，${cuisine.personalityTag}，代表菜${cuisine.representativeDishes
                      .slice(0, 3)
                      .map((dish) => dish.name)
                      .join('、')}。进入菜系探索`}
                    onClick={() => navigate(`/cuisines/${cuisine.id}`)}
                    onMouseEnter={() => setActiveId(cuisine.id)}
                    onFocus={() => setActiveId(cuisine.id)}
                  >
                    <span className="orbit-node__disc">
                      <FoodPhoto
                        name={cuisine.name}
                        src={cuisine.image}
                        fallbackSrc={cuisine.fallbackImage}
                        emoji={cuisine.emoji}
                        palette={cuisine.palette}
                        alt={`${cuisine.name}代表菜`}
                        eager
                      />
                      <span className="orbit-node__halo" aria-hidden="true" />
                    </span>
                    <span className="orbit-node__meta">
                      <span className="orbit-node__name">{cuisine.name}</span>
                      <span className="orbit-node__tag">{cuisine.personalityTag}</span>
                      <span className="orbit-node__region">{cuisine.region}</span>
                    </span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 中心圆盘 */}
        <div className="orbit-disc">
          <div className="orbit-disc__inner" key={active?.id ?? 'brand'} aria-live="polite">
            <span className="orbit-disc__brand">FOOD SOUL</span>
            <span className="orbit-disc__label">
              {active ? `FOOD PERSONALITY · ${active.index}` : 'FOOD PERSONALITY'}
            </span>

            {active ? (
              <>
                <h2 className="orbit-disc__title">{active.name}</h2>
                <p className="orbit-disc__desc">
                  {active.personalityTag} · {active.region}
                  <span className="orbit-disc__quote">
                    代表菜：{active.representativeDishes.slice(0, 3).map((dish) => dish.name).join('、')}
                  </span>
                </p>
                <Link className="btn btn--dark btn--sm orbit-disc__cta" to={`/cuisines/${active.id}`}>
                  进入{active.name}探索 <span className="arrow">→</span>
                </Link>
              </>
            ) : (
              <>
                <h2 className="orbit-disc__title orbit-disc__title--brand">
                  每一道美食，
                  <br />
                  都有自己的灵魂
                </h2>
                <p className="orbit-disc__desc">八大菜系，万种风味。每一道菜，都值得被认识。</p>
                <Link className="btn btn--dark btn--sm orbit-disc__cta" to="/personalities#cuisines">
                  探索美食 <span className="arrow">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="orbit-hint">
        <span>悬停暂停并预览 · 点击菜系进入探索</span>
        <span className="orbit-hint__sep" aria-hidden="true">
          /
        </span>
        <span>← → 键可切换</span>
      </p>
    </div>
  )
}
