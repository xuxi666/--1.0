import type { CSSProperties } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import CharacterCard from '../components/CharacterCard'
import CuisineChat from '../components/CuisineChat'
import FoodPhoto from '../components/FoodPhoto'
import FoodTypeTags from '../components/FoodTypeTags'
import Reveal from '../components/Reveal'
import { useCircularTransition } from '../components/CircularTransition'
import { characterMap } from '../data/characters'
import { cuisines, getCuisine, relatedCharactersOfCuisine } from '../data/cuisines'
import { getVisualTheme, themeVars } from '../data/visualThemes'
import { photoUrl } from '../lib/photos'
import { useWorldArrivalClass } from '../lib/worldArrival'

/**
 * 菜系专属页（/cuisines/:id）＝ 菜系身份 + 菜系 AI 聊天 + 代表菜。
 * ------------------------------------------------------------
 * 首页转盘点击任意菜系后，圆形扩散转场把用户送进这里：
 * - 标题、人格标签、地域、介绍、代表菜与聊天欢迎语全部来自同一份 cuisine 配置；
 * - 页面根节点按 cuisineId 注入该菜系的视觉主题（--t-* 变量），
 *   页面背景、代表强调、聊天区与主按钮都和转场圆保持同一套颜色；
 * - 聊天请求携带 cuisineId，服务端校验后选择该菜系的系统提示词；
 * - 只有用户主动点代表菜上的「切换到聊天」，才会换到那道菜的角色聊天。
 */
export default function CuisinePage() {
  const { cuisineId } = useParams()
  const location = useLocation()
  const cuisine = getCuisine(cuisineId)
  const { back } = useCircularTransition()
  /** 由圆形揭示转场送进来的落地页：跳过入场编排，与预览层保持同一画面 */
  const arrival = useWorldArrivalClass(location.pathname)

  if (!cuisine) {
    return (
      <main className="page">
        <div className="container page-empty">
          <h1>没有找到这个菜系</h1>
          <p>八大菜系只有八个，可能你点到了一道还没上桌的菜。</p>
          <Link to="/personalities#cuisines" className="btn btn--primary">
            返回八大菜系 <span className="arrow">→</span>
          </Link>
        </div>
      </main>
    )
  }

  const theme = getVisualTheme(cuisine.id)
  const related = relatedCharactersOfCuisine(cuisine)
  const others = cuisines.filter((item) => item.id !== cuisine.id)
  const firstDish = cuisine.representativeDishes[0]

  return (
    <main
      className={`page theme-page${arrival ? ` ${arrival}` : ''}`}
      data-theme-id={cuisine.id}
      style={themeVars(theme) as CSSProperties}
    >
      <div className="container">
        <Reveal>
          <div className="page-back-row">
            <Link to="/personalities#cuisines" className="back-link">
              ← 返回八大菜系
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
                name={cuisine.name}
                src={cuisine.image}
                fallbackSrc={cuisine.fallbackImage}
                emoji={cuisine.emoji}
                palette={cuisine.palette}
                alt={`${cuisine.name}代表菜`}
                eager
              />
            </div>
            <div className="cat-hero__copy">
              <span className="eyebrow">
                {cuisine.index} — {cuisine.en}
              </span>
              <h1 className="page-title">{cuisine.name}</h1>
              <p className="page-sub">{cuisine.description}</p>
              <div className="cat-hero__traits">
                <span className="chip chip--accent">{cuisine.personalityTag}</span>
                <span className="chip">地域 · {cuisine.region}</span>
              </div>
              <p className="cat-hero__persona">AI 人格：{cuisine.personalityDesc}</p>
              <div className="cat-hero__actions">
                <Link to="#cuisine-chat" className="btn btn--primary">
                  和{cuisine.name} AI 聊聊天 <span className="arrow">→</span>
                </Link>
                <Link to={`/recommend?cuisine=${cuisine.id}`} className="btn btn--ghost">
                  按{cuisine.name}推荐一顿
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">CUISINE CHAT</span>
              <h2 className="h2">菜系专属对话</h2>
            </div>
            <p className="section-head__aside">
              聊天对象就是{cuisine.name}本身（{cuisine.personalityTag}），由服务端按 cuisineId 载入专属提示词；
              不点代表菜，它就一直是{cuisine.name}。
            </p>
          </div>
          <Reveal>
            <CuisineChat key={cuisine.id} cuisine={cuisine} />
          </Reveal>
        </section>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">DISHES</span>
              <h2 className="h2">代表菜</h2>
            </div>
            <p className="section-head__aside">
              每道代表菜都可能有自己的 AI 角色。点「切换到聊天」才会换成那道菜，
              不点就继续和{cuisine.name}聊。
            </p>
          </div>

          <div className="cuisine-dishes">
            {cuisine.representativeDishes.map((dish, index) => {
              const character = dish.characterId ? characterMap[dish.characterId] : undefined
              return (
                <Reveal key={dish.id} delay={index * 45}>
                  <article className="cuisine-dish">
                    <div className="cuisine-dish__visual">
                      {dish.photo ? (
                        <FoodPhoto
                          name={dish.name}
                          src={photoUrl(dish.photo)}
                          emoji={dish.emoji}
                          palette={cuisine.palette}
                          alt={dish.name}
                        />
                      ) : (
                        <span className="cuisine-dish__emoji" aria-hidden="true">
                          {dish.emoji}
                        </span>
                      )}
                    </div>
                    <div className="cuisine-dish__body">
                      <h3>
                        {dish.dishId ? (
                          <Link to={`/dishes/${dish.dishId}`}>{dish.name}</Link>
                        ) : (
                          dish.name
                        )}
                      </h3>
                      <p className="cuisine-dish__desc">{dish.desc}</p>
                      <p className="cuisine-dish__meta">
                        {character
                          ? `菜品角色：${character.name} · ${character.tagline}`
                          : '菜品角色还在酝酿 · 可以先生成菜谱'}
                      </p>
                      <div className="cuisine-dish__actions">
                        {dish.dishId && (
                          <Link to={`/dishes/${dish.dishId}`} className="btn btn--ghost btn--sm">
                            图鉴详情 <span className="arrow">→</span>
                          </Link>
                        )}
                        {character && (
                          <Link to={`/chat/${character.id}`} className="btn btn--ghost btn--sm">
                            切换到「{character.name}」聊天 <span className="arrow">→</span>
                          </Link>
                        )}
                        <Link
                          to={`/recipe?dish=${encodeURIComponent(dish.name)}`}
                          className="link-arrow"
                        >
                          生成菜谱 <span className="arrow">↗</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </section>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">CHARACTERS</span>
              <h2 className="h2">和「{cuisine.name}」有关的美食角色</h2>
            </div>
            <p className="section-head__aside">
              菜系是文化分类，角色是独立人格。{cuisine.name}的性格设计方向：{cuisine.personalityDesc}
            </p>
          </div>

          {related.length > 0 ? (
            <div className="char-grid">
              {related.map((character, index) => (
                <Reveal key={character.id} delay={index * 50}>
                  <CharacterCard character={character} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="page-note">
              <h3>「{cuisine.name}」的独立角色还在酝酿</h3>
              <ul>
                <li>
                  页面顶部的聊天区已经可以跟{cuisine.name}菜系 AI 人格直接对话；八大菜系是文化分类，
                  单独的「菜品角色」会在后续逐步入场。
                </li>
                <li>
                  你可以先去「美食人格宇宙」认识现有的十七位角色，或让 AI 菜谱先带你做一道
                  {firstDish.name}。
                </li>
              </ul>
              <div className="page-note__actions">
                <Link to="/personalities" className="btn btn--ghost btn--sm">
                  去美食人格宇宙 <span className="arrow">→</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">MORE</span>
              <h2 className="h2">换个菜系，或者换种吃法</h2>
            </div>
          </div>
          <div className="cat-switch">
            {others.map((item) => (
              <Link key={item.id} to={`/cuisines/${item.id}`} className="cat-switch__item">
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
