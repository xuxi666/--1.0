import type { CSSProperties } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import FoodPhoto from '../components/FoodPhoto'
import FoodTypeTags from '../components/FoodTypeTags'
import Reveal from '../components/Reveal'
import TasteChat from '../components/TasteChat'
import { useCircularTransition } from '../components/CircularTransition'
import { characterMap } from '../data/characters'
import { cuisineMap } from '../data/cuisines'
import { tastes, getTaste, type Taste } from '../data/tastes'
import { getVisualTheme, themeVars } from '../data/visualThemes'
import type { Dish } from '../data/dishes'
import { useWorldArrivalClass } from '../lib/worldArrival'

/**
 * 口味专属页（/tastes/:id）＝ 风味介绍 + 口味 AI 聊天 + 代表菜。
 * ------------------------------------------------------------
 * 首页「口味探索」转盘点击任意口味后，圆形扩散转场把用户送进这里：
 * - 标题、人格标签、风味介绍、代表菜与聊天欢迎语全部来自同一份 taste 配置（src/data/tastes.ts）；
 * - 页面根节点按 tasteId 注入该口味的视觉主题（--t-* 变量），
 *   与转场圆的颜色、光效保持同一套主题（不是菜系主题的复用）；
 * - 聊天请求携带 tasteId，服务端校验后选择该口味人格的系统提示词——不是菜系、不是菜品角色；
 * - 代表菜全部来自菜品库：点「图鉴详情」进菜品页，点聊天入口按这道菜自己的归属
 *   进入它的角色聊天或所属菜系聊天（菜品 id 与归属都由菜品库推导，不硬编码）。
 */
export default function TastePage() {
  const { tasteId } = useParams()
  const location = useLocation()
  const taste = getTaste(tasteId)
  const { back } = useCircularTransition()
  /** 由圆形揭示转场送进来的落地页：跳过入场编排，与预览层保持同一画面 */
  const arrival = useWorldArrivalClass(location.pathname)

  if (!taste) {
    return (
      <main className="page">
        <div className="container page-empty">
          <h1>没有找到这个口味</h1>
          <p>口味探索目前只有八个方向，可能你点到了一道还没上桌的味道。</p>
          <Link to="/tastes" className="btn btn--primary">
            返回口味探索 <span className="arrow">→</span>
          </Link>
        </div>
      </main>
    )
  }

  const theme = getVisualTheme(taste.id)
  const others = tastes.filter((item) => item.id !== taste.id)
  const firstDish = taste.representativeDishes[0]

  return (
    <main
      className={`page theme-page${arrival ? ` ${arrival}` : ''}`}
      data-theme-id={taste.id}
      style={themeVars(theme) as CSSProperties}
    >
      <div className="container">
        <Reveal>
          <div className="page-back-row">
            <Link to="/tastes" className="back-link">
              ← 返回口味探索
            </Link>
            <button type="button" className="back-link back-link--home" onClick={() => back('/')}>
              <span aria-hidden="true">⌂</span> 回到首页
            </button>
          </div>
        </Reveal>

        <Reveal>
          <div className="cat-hero">
            <div className="cat-hero__visual">
              <FoodPhoto
                name={taste.imageDish?.name ?? taste.name}
                src={taste.image}
                fallbackSrc={taste.fallbackImage}
                emoji={taste.emoji}
                palette={taste.palette}
                alt={`${taste.name}口味代表菜`}
                eager
              />
            </div>
            <div className="cat-hero__copy">
              <span className="eyebrow">
                {taste.index} — {taste.en}
              </span>
              <h1 className="page-title">{taste.name}</h1>
              <p className="page-sub">{taste.description}</p>
              <div className="cat-hero__traits">
                <span className="chip chip--accent">{taste.personalityTag}</span>
                <span className="chip">口味探索 · 不是菜系</span>
              </div>
              <p className="cat-hero__persona">AI 口味人格：{taste.personalityDesc}</p>
              <div className="cat-hero__actions">
                <Link to="#taste-chat" className="btn btn--primary">
                  和「{taste.name}」口味聊聊天 <span className="arrow">→</span>
                </Link>
                <Link to="#taste-dishes" className="btn btn--ghost">
                  先看看代表菜
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">TASTE CHAT</span>
              <h2 className="h2">口味专属对话</h2>
            </div>
            <p className="section-head__aside">
              聊天对象是「{taste.name}」这个口味方向本身（{taste.personalityTag}），
              由服务端按 tasteId 载入专属提示词；它可以跨菜系推荐，但会尊重你的忌口与指定菜系。
            </p>
          </div>
          <Reveal>
            <TasteChat key={taste.id} taste={taste} />
          </Reveal>
        </section>

        <section className="section section--tight" id="taste-dishes">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">DISHES</span>
              <h2 className="h2">代表菜（跨菜系）</h2>
            </div>
            <p className="section-head__aside">
              口味与菜系是多对多：同一道菜可以同时属于几个口味，
              想和具体某道菜聊，就点它自己的聊天入口。
            </p>
          </div>

          <div className="cuisine-dishes">
            {taste.representativeDishes.map((dish, index) => (
              <Reveal key={dish.id} delay={index * 45}>
                <TasteDishCard dish={dish} palette={taste.palette} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">TASTE VS CUISINE</span>
              <h2 className="h2">口味不是菜系</h2>
            </div>
            <p className="section-head__aside">
              口味探索按味觉偏好组织内容，菜系是地域与文化分类，两者是多对多关系。
              想按地域逛，去八大菜系；想按味道挑，留在口味探索就好。
            </p>
          </div>
          <div className="cat-switch">
            <Link to="/personalities#cuisines" className="cat-switch__item">
              <span>↔</span>去八大菜系
            </Link>
            <Link to="/dishes" className="cat-switch__item">
              <span>↗</span>去美食图鉴找菜
            </Link>
            <Link to="/recommend" className="cat-switch__item">
              <span>✦</span>让 AI 按口味推荐一顿
            </Link>
          </div>
        </section>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">MORE</span>
              <h2 className="h2">换个口味试试</h2>
            </div>
            {firstDish && (
              <p className="section-head__aside">
                「{taste.name}」的代表菜之一「{firstDish.name}」也可以从图鉴页进入。
              </p>
            )}
          </div>
          <div className="cat-switch">
            {others.map((item) => (
              <Link key={item.id} to={`/tastes/${item.id}`} className="cat-switch__item">
                <span>{item.index}</span>
                {item.name}
              </Link>
            ))}
          </div>
          <FoodTypeTags label="更多美食类型（不属于八大菜系）" />
        </section>
      </div>
    </main>
  )
}

/**
 * 代表菜卡片：聊天入口按这道菜自己的归属推导——
 * 有独立角色的菜 → 角色聊天；没有独立角色的菜 → 所属菜系聊天（带 dishId 上下文）。
 */
function TasteDishCard({
  dish,
  palette,
}: {
  dish: Dish
  palette: Taste['palette']
}) {
  const ownCharacter = dish.characterId ? characterMap[dish.characterId] : undefined
  const chatEntry = (() => {
    if (ownCharacter) {
      return { href: `/chat/${ownCharacter.id}`, label: `切换到「${ownCharacter.name}」聊天` }
    }
    if (dish.chatTarget?.kind === 'character') {
      const character = characterMap[dish.chatTarget.characterId]
      if (character) return { href: `/chat/${character.id}`, label: `切换到「${character.name}」聊天` }
    }
    if (dish.chatTarget?.kind === 'cuisine') {
      return { href: `/cuisines/${dish.chatTarget.cuisineId}?dish=${dish.id}`, label: `和${dish.chatTarget.label}聊这道菜` }
    }
    return undefined
  })()

  const cuisine = dish.cuisineId ? cuisineMap[dish.cuisineId] : undefined
  const ownerText = cuisine
    ? `所属菜系：${cuisine.name}`
    : dish.foodTypeId
      ? '独立美食类型'
      : '家常与江湖菜'

  return (
    <article className="cuisine-dish">
      <div className="cuisine-dish__visual">
        {dish.imageStatus === 'ready' ? (
          <FoodPhoto
            name={dish.name}
            src={dish.image}
            emoji={dish.emoji}
            palette={palette}
            alt={dish.imageAlt || dish.name}
          />
        ) : (
          <span className="cuisine-dish__emoji" aria-hidden="true">
            {dish.emoji}
          </span>
        )}
      </div>
      <div className="cuisine-dish__body">
        <h3>
          <Link to={`/dishes/${dish.id}`}>{dish.name}</Link>
        </h3>
        <p className="cuisine-dish__desc">{dish.summary}</p>
        <p className="cuisine-dish__meta">
          {ownerText} · 口味标签：{dish.flavors.join(' / ')}
        </p>
        <div className="cuisine-dish__actions">
          <Link to={`/dishes/${dish.id}`} className="btn btn--ghost btn--sm">
            图鉴详情 <span className="arrow">→</span>
          </Link>
          {chatEntry && (
            <Link to={chatEntry.href} className="btn btn--ghost btn--sm">
              {chatEntry.label} <span className="arrow">→</span>
            </Link>
          )}
          <Link to={`/recipe?dish=${encodeURIComponent(dish.name)}`} className="link-arrow">
            生成菜谱 <span className="arrow">↗</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
