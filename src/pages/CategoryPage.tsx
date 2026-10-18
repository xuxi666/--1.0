import { Link, useParams } from 'react-router-dom'
import CharacterCard from '../components/CharacterCard'
import FoodPhoto from '../components/FoodPhoto'
import Reveal from '../components/Reveal'
import {
  categories,
  categoryMap,
  charactersOfCategory,
  featuredCharacterOfCategory,
} from '../data/categories'
import { dishDatabase } from '../data/dishes'

/**
 * 口味方向页（/personalities/:categoryId）
 * ------------------------------------------------------------
 * 「浓香派却和烧烤聊聊」的根因是这里：主图用 category.photoName（东坡肉），
 * 主按钮却用 members[0]（数组里排第一的烧烤）。现在主图与主按钮统一使用
 * 数据里显式配置的代言角色 featuredCharacterId，不再依赖数组顺序。
 */
export default function CategoryPage() {
  const { categoryId } = useParams()
  const category = categoryId ? categoryMap[categoryId] : undefined

  if (!category) {
    return (
      <main className="page">
        <div className="container page-empty">
          <h1>没有找到这个口味分类</h1>
          <Link to="/personalities" className="btn btn--ghost">
            返回美食人格
          </Link>
        </div>
      </main>
    )
  }

  const members = charactersOfCategory(category.id)
  const featured = featuredCharacterOfCategory(category.id)
  const dishes = dishDatabase.filter((dish) => dish.categoryId === category.id)
  const others = categories.filter((item) => item.id !== category.id)

  return (
    <main className="page">
      <div className="container">
        <Reveal>
          <div className="cat-hero">
            <div className="cat-hero__visual">
              {featured ? (
                <FoodPhoto
                  name={featured.name}
                  emoji={featured.emoji}
                  palette={featured.palette}
                  alt={`${category.name}代言角色：${featured.name}`}
                />
              ) : (
                <span className="cuisine-dish__emoji" aria-hidden="true">
                  {category.emoji}
                </span>
              )}
            </div>
            <div className="cat-hero__copy">
              <span className="eyebrow">
                {category.index} — {category.en}
              </span>
              <h1 className="page-title">{category.name}</h1>
              <p className="page-sub">{category.desc}</p>
              <div className="cat-hero__traits">
                {category.traits.split(' / ').map((trait) => (
                  <span key={trait} className="chip">
                    {trait}
                  </span>
                ))}
              </div>
              {featured && (
                <p className="cat-hero__persona">
                  本页主图与主按钮来自同一位代言角色：{featured.name}（{featured.tagline}）。
                  下面是同方向的 {members.length} 位成员，可以按名字挑。
                </p>
              )}
              <div className="cat-hero__actions">
                {featured && (
                  <Link to={`/chat/${featured.id}`} className="btn btn--primary">
                    和{featured.name}聊聊 <span className="arrow">→</span>
                  </Link>
                )}
                <Link to="/personalities" className="btn btn--ghost">
                  返回全部人格
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">CHARACTERS</span>
              <h2 className="h2">{category.name}的角色</h2>
            </div>
            <p className="section-head__aside">
              同一口味方向下的角色共享底层性格，但说话方式与擅长领域各不相同，点卡片进入角色自己的页面。
            </p>
          </div>

          <div className="char-grid">
            {members.map((character, index) => (
              <Reveal key={character.id} delay={index * 50}>
                <CharacterCard character={character} />
              </Reveal>
            ))}
          </div>
        </section>

        {dishes.length > 0 && (
          <section className="section section--tight">
            <div className="section-head">
              <div className="section-head__copy">
                <span className="eyebrow">DISHES</span>
                <h2 className="h2">相关菜品</h2>
              </div>
            </div>
            <div className="dish-strip">
              {dishes.map((dish) => (
                <Link key={dish.id} to={`/recipe?dish=${encodeURIComponent(dish.name)}`} className="dish-strip__item">
                  <span className="dish-strip__thumb">
                    <FoodPhoto name={dish.name} emoji={dish.emoji} alt={dish.name} />
                  </span>
                  <div>
                    <strong>{dish.name}</strong>
                    <em>
                      {dish.minutes} 分钟 · 人均 ¥{dish.price}
                    </em>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">OTHER FLAVORS</span>
              <h2 className="h2">换个味道</h2>
            </div>
          </div>
          <div className="cat-switch">
            {others.map((item) => (
              <Link key={item.id} to={`/personalities/${item.id}`} className="cat-switch__item">
                <span>{item.index}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
