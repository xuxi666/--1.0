import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import FoodWheel, { type WheelItem } from './FoodWheel'
import { useCircularTransition } from './CircularTransition'
import { cuisines } from '../data/cuisines'
import { tastes } from '../data/tastes'
import { BRAND_THEME_ID } from '../data/visualThemes'

/**
 * HomeFoodWheel — 首页环形转盘（双模式：八大菜系 / 口味探索）
 * ------------------------------------------------------------
 * - 转盘上方的分段控件负责切换模式，默认「八大菜系」；
 * - 两种模式各有独立的数据配置（cuisines.ts / tastes.ts），共用 FoodWheel 布局组件：
 *   模式由类型约束的 WheelMode 决定，不用中文显示名判断，也不用数组下标决定跳转对象；
 * - 点击节点按当前模式走圆形扩散转场：八大菜系 → /cuisines/:id；口味探索 → /tastes/:id，
 *   转场主题 id 直接取稳定节点 id（cuisineId / tasteId），由 visualThemes 解析颜色；
 * - 切换模式时整盘以 key={mode} 重建，不会有上一模式的名称、图片或文案残留；
 * - 离开首页时的模式记在内存里：从聊天页返回时保留原来的模式，整页刷新后才回到默认。
 */
export type WheelMode = 'cuisine' | 'taste'

const MODE_ORDER: WheelMode[] = ['cuisine', 'taste']

const MODE_LABEL: Record<WheelMode, string> = {
  cuisine: '八大菜系',
  taste: '口味探索',
}

const MODE_ARIA: Record<WheelMode, string> = {
  cuisine: '切换到八大菜系模式',
  taste: '切换到口味探索模式',
}

const WHEEL_ARIA: Record<WheelMode, string> = {
  cuisine: '八大菜系旋转转盘',
  taste: '口味探索旋转转盘',
}

/** 上次离开首页时的模式（内存态，整页刷新后回到默认「八大菜系」） */
let rememberedMode: WheelMode = 'cuisine'

function previewOf(names: string[], count = 3) {
  return `代表菜：${names.slice(0, count).join('、')}`
}

/** 模式一：八大菜系（复用项目现有的菜系 id、人格标签与图片） */
const cuisineItems: WheelItem[] = cuisines.map((cuisine) => ({
  id: cuisine.id,
  name: cuisine.name,
  tag: cuisine.personalityTag,
  meta: cuisine.region,
  index: cuisine.index,
  image: cuisine.image,
  fallbackImage: cuisine.fallbackImage,
  photoName: cuisine.name,
  emoji: cuisine.emoji,
  palette: cuisine.palette,
  previewDishes: previewOf(cuisine.representativeDishes.map((dish) => dish.name)),
  ariaLabel: `${cuisine.name}，${cuisine.personalityTag}，代表菜${cuisine.representativeDishes
    .slice(0, 3)
    .map((dish) => dish.name)
    .join('、')}。进入菜系聊天`,
}))

/** 模式二：口味探索（图片来自菜品库的真实菜品，经 imageDishId 解析，不另维护图片表） */
const tasteItems: WheelItem[] = tastes.map((taste) => {
  const dishNames = taste.representativeDishes.map((dish) => dish.name)
  return {
    id: taste.id,
    name: taste.name,
    tag: taste.personalityTag,
    meta: dishNames.slice(0, 2).join(' · '),
    index: taste.index,
    image: taste.image,
    fallbackImage: taste.fallbackImage,
    photoName: taste.imageDish?.name ?? taste.name,
    emoji: taste.emoji,
    palette: taste.palette,
    previewDishes: previewOf(dishNames),
    ariaLabel: `${taste.name}口味，${taste.personalityTag}，代表菜${dishNames
      .slice(0, 3)
      .join('、')}。进入口味探索`,
  }
})

export default function HomeFoodWheel() {
  const [mode, setMode] = useState<WheelMode>(() => rememberedMode)
  const { start } = useCircularTransition()
  const switchRefs = useRef<Record<WheelMode, HTMLButtonElement | null>>({ cuisine: null, taste: null })

  const updateMode = useCallback((next: WheelMode) => {
    rememberedMode = next
    setMode(next)
  }, [])

  /** 分段控件支持键盘：← → ↑ ↓ 在两种模式间切换并把焦点带到新选项 */
  const handleSwitchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']
      if (!keys.includes(event.key)) return
      event.preventDefault()
      const dir = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
      const next = MODE_ORDER[(MODE_ORDER.indexOf(mode) + dir + MODE_ORDER.length) % MODE_ORDER.length]
      updateMode(next)
      switchRefs.current[next]?.focus()
    },
    [mode, updateMode],
  )

  /**
   * 中心入口链接：保持 <a href> 语义（新窗口 / 中键照常），
   * 普通左键点击则交给圆形扩散转场，从中心圆盘出发。
   */
  const handleCenterNav = useCallback(
    (to: string, themeId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented) return
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      const disc = event.currentTarget.closest('.orbit-disc')
      const rect = (disc ?? event.currentTarget).getBoundingClientRect()
      start({
        to,
        themeId,
        origin: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          r: Math.max(30, rect.width / 2),
        },
      })
    },
    [start],
  )

  const modeSwitch = (
    <div
      className="wheel-mode"
      role="group"
      aria-label="首页转盘浏览模式"
      onKeyDown={handleSwitchKeyDown}
    >
      {MODE_ORDER.map((item) => (
        <button
          key={item}
          ref={(el) => {
            switchRefs.current[item] = el
          }}
          type="button"
          className="wheel-mode__btn"
          aria-pressed={mode === item}
          aria-label={MODE_ARIA[item]}
          onClick={() => updateMode(item)}
        >
          {MODE_LABEL[item]}
        </button>
      ))}
    </div>
  )

  const renderCenter =
    mode === 'cuisine'
      ? (active: WheelItem | null) =>
          active ? (
            <>
              <span className="orbit-disc__brand">FOOD SOUL</span>
              <span className="orbit-disc__label">FOOD PERSONALITY · {active.index}</span>
              <h2 className="orbit-disc__title">{active.name}</h2>
              <p className="orbit-disc__desc">
                {active.tag} · {active.meta}
                <span className="orbit-disc__quote">{active.previewDishes}</span>
              </p>
              <Link
                className="btn btn--dark btn--sm orbit-disc__cta"
                to={`/cuisines/${active.id}`}
                onClick={handleCenterNav(`/cuisines/${active.id}`, active.id)}
              >
                和{active.name} AI 聊聊天 <span className="arrow">→</span>
              </Link>
            </>
          ) : (
            <>
              <span className="orbit-disc__brand">FOOD SOUL</span>
              <span className="orbit-disc__label">FOOD PERSONALITY</span>
              <h2 className="orbit-disc__title orbit-disc__title--brand">
                每一道美食，
                <br />
                都有自己的灵魂
              </h2>
              <p className="orbit-disc__desc">八大菜系，万种风味。每一道菜，都值得被认识。</p>
              <Link
                className="btn btn--dark btn--sm orbit-disc__cta"
                to="/personalities#cuisines"
                onClick={handleCenterNav('/personalities#cuisines', BRAND_THEME_ID)}
              >
                开始探索 <span className="arrow">→</span>
              </Link>
            </>
          )
      : (active: WheelItem | null) =>
          active ? (
            <>
              <span className="orbit-disc__brand">FOOD SOUL</span>
              <span className="orbit-disc__label">TASTE PERSONALITY · {active.index}</span>
              <h2 className="orbit-disc__title">{active.name}</h2>
              <p className="orbit-disc__desc">
                {active.tag} · 口味探索
                <span className="orbit-disc__quote">{active.previewDishes}</span>
              </p>
              <Link
                className="btn btn--dark btn--sm orbit-disc__cta"
                to={`/tastes/${active.id}`}
                onClick={handleCenterNav(`/tastes/${active.id}`, active.id)}
              >
                和「{active.name}」口味聊聊 <span className="arrow">→</span>
              </Link>
            </>
          ) : (
            <>
              <span className="orbit-disc__brand">FOOD SOUL</span>
              <span className="orbit-disc__label">TASTE PERSONALITY</span>
              <h2 className="orbit-disc__title orbit-disc__title--brand">
                你的口味，
                <br />
                藏着你的美食灵魂
              </h2>
              <p className="orbit-disc__desc">从麻辣鲜香到清甜温润，找到与你味蕾契合的那一种。</p>
              <Link
                className="btn btn--dark btn--sm orbit-disc__cta"
                to="/tastes"
                onClick={handleCenterNav('/tastes', BRAND_THEME_ID)}
              >
                探索我的口味 <span className="arrow">→</span>
              </Link>
            </>
          )

  return (
    /**
     * 结构说明：模式切换控件与「会随模式重挂载的转盘」是兄弟节点——
     * 转盘用 key={mode} 整盘重建（保证零残留），而切换控件留在原地，
     * 这样用键盘切换模式后焦点不会丢（否则控件随转盘一起重建，焦点会掉回 body）。
     */
    <div className="orbit-wrap">
      {modeSwitch}
      <FoodWheel
        key={mode}
        items={mode === 'cuisine' ? cuisineItems : tasteItems}
        sourceKey={mode}
        ariaLabel={WHEEL_ARIA[mode]}
        renderCenter={renderCenter}
        onSelect={(id, origin) =>
          start({
            to: mode === 'cuisine' ? `/cuisines/${id}` : `/tastes/${id}`,
            themeId: id,
            origin,
          })
        }
        hint={
          <>
            <span>
              {mode === 'cuisine' ? '悬停暂停并预览 · 点击菜系进入聊天' : '悬停暂停并预览 · 点击口味进入探索'}
            </span>
            <span className="orbit-hint__sep" aria-hidden="true">
              /
            </span>
            <span>← → 键可切换</span>
          </>
        }
      />
    </div>
  )
}
