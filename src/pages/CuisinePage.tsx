import { Link, useParams } from 'react-router-dom'
import CharacterCard from '../components/CharacterCard'
import FoodPhoto from '../components/FoodPhoto'
import FoodTypeTags from '../components/FoodTypeTags'
import Reveal from '../components/Reveal'
import { characterMap } from '../data/characters'
import { cuisineMap, cuisines, relatedCharactersOfCuisine } from '../data/cuisines'
import { photoUrl } from '../lib/photos'

/**
 * 菜系探索页：菜系名称、地域、文化介绍、代表菜、相关 AI 角色与聊天入口。
 * 复用现有角色页 / 聊天页 / 菜谱页的路由，不新建聊天系统。
 */
export default function CuisinePage() {
  const { cuisineId } = useParams()
  const cuisine = cuisineId ? cuisineMap[cuisineId] : undefined

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

  const related = relatedCharactersOfCuisine(cuisine)
  const others = cuisines.filter((item) => item.id !== cuisine.id)
  const firstDish = cuisine.representativeDishes[0]
  const heroCharacter = related[0]

  return (
    <main className="page">
      <div className="container">
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
              <div className="cat-hero__actions">
                {heroCharacter ? (
                  <Link to={`/chat/${heroCharacter.id}`} className="btn btn--primary">
                    和{heroCharacter.name}聊聊 <span className="arrow">→</span>
                  </Link>
                ) : (
                  <Link
                    to={`/recipe?dish=${encodeURIComponent(firstDish.name)}`}
                    className="btn btn--primary"
                  >
                    生成「{firstDish.name}」菜谱 <span className="arrow">→</span>
                  </Link>
                )}
                <Link to="/personalities#cuisines" className="btn btn--ghost">
                  返回八大菜系
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">DISHES</span>
              <h2 className="h2">代表菜</h2>
            </div>
            <p className="section-head__aside">
              每道菜都可以有自己的 AI 人格。已有角色的直接开聊，没有的也能先让 AI 菜谱带你做出来。
            </p>
          </div>

          <div className="cuisine-dishes">
            {cuisine.representativeDishes.map((dish, index) => {
              const character = dish.characterId ? characterMap[dish.characterId] : undefined
              return (
                <Reveal key={dish.name} delay={index * 45}>
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
                      <h3>{dish.name}</h3>
                      <p className="cuisine-dish__meta">
                        {character
                          ? `同名角色：${character.name} · ${character.tagline}`
                          : '代表菜 · 暂无专属角色'}
                      </p>
                      <div className="cuisine-dish__actions">
                        {character && (
                          <Link to={`/chat/${character.id}`} className="btn btn--ghost btn--sm">
                            和 TA 聊天 <span className="arrow">→</span>
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
              <h3>「{cuisine.name}」的专属角色还在酝酿</h3>
              <ul>
                <li>八大菜系是文化分类，不等于八个固定角色；{cuisine.name}的专属人格会在后续逐步入场。</li>
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
