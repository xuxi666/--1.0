import { Link } from 'react-router-dom'
import FoodPhoto from '../components/FoodPhoto'
import Reveal from '../components/Reveal'
import { tastes } from '../data/tastes'

/**
 * 口味探索总览（/tastes）
 * ------------------------------------------------------------
 * 首页「口味探索」转盘中央按钮「探索我的口味」进入这里：
 * - 八个口味方向各自独立（数据来自 src/data/tastes.ts），图片由菜品库解析，不单独维护图片表；
 * - 口味与菜系、口味与菜品都是多对多：这里只按味觉偏好组织入口，不代表任何地域菜系；
 * - 点任意口味进入 /tastes/:id：看风味介绍、代表菜，并与该口味的 AI 人格聊天。
 */
export default function TasteIndexPage() {
  return (
    <main className="page">
      <div className="container">
        <Reveal>
          <Link to="/" className="back-link">
            ← 返回首页
          </Link>
        </Reveal>

        <Reveal>
          <div className="page-head">
            <span className="eyebrow">TASTE EXPLORATION</span>
            <h1 className="page-title">口味探索</h1>
            <p className="page-sub">
              这里不按地域分，只按你此刻的味觉偏好。八个口味方向可以跨菜系挑菜——
              同一道菜，也可能同时属于几个口味。
            </p>
          </div>
        </Reveal>

        <section className="section section--tight">
          <div className="cat-index">
            {tastes.map((taste, index) => (
              <Reveal key={taste.id} delay={index * 40}>
                <Link to={`/tastes/${taste.id}`} className="cat-tile">
                  <div className="cat-tile__visual">
                    <FoodPhoto
                      name={taste.imageDish?.name ?? taste.name}
                      src={taste.image}
                      fallbackSrc={taste.fallbackImage}
                      emoji={taste.emoji}
                      palette={taste.palette}
                      alt={`${taste.name}口味代表菜`}
                    />
                  </div>
                  <div className="cat-tile__body">
                    <div className="cat-tile__row">
                      <span className="cat-tile__index">{taste.index}</span>
                      <span className="cat-tile__en">{taste.en}</span>
                    </div>
                    <h3>{taste.name}</h3>
                    <p>
                      {taste.personalityTag} · 代表菜{' '}
                      {taste.representativeDishes
                        .slice(0, 2)
                        .map((dish) => dish.name)
                        .join('、')}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">HOW IT WORKS</span>
              <h2 className="h2">口味和菜系，是什么关系？</h2>
            </div>
            <p className="section-head__aside">
              口味是味觉偏好，菜系是地域与文化分类，两者是多对多关系：
              麻辣可以同时指向川菜的水煮鱼和湘菜的口味虾；红烧肉既属于咸香，也属于酱香浓郁。
              选口味，是选你今天的味蕾；选菜系，是选你想逛的地域。
            </p>
          </div>
          <div className="cat-switch">
            <Link to="/" className="cat-switch__item">
              <span>↺</span>回首页转盘
            </Link>
            <Link to="/personalities#cuisines" className="cat-switch__item">
              <span>↔</span>去八大菜系
            </Link>
            <Link to="/dishes" className="cat-switch__item">
              <span>↗</span>去美食图鉴找菜
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
