import { Link } from 'react-router-dom'
import FoodSoulOrbit from '../components/FoodSoulOrbit'
import FoodPhoto from '../components/FoodPhoto'
import CharacterCard from '../components/CharacterCard'
import RecipeWorkbench from '../components/RecipeWorkbench'
import RecommendPanel from '../components/RecommendPanel'
import CommunitySection from '../components/CommunitySection'
import FoodSoulPet from '../components/FoodSoulPet'
import Reveal from '../components/Reveal'
import { categories } from '../data/categories'
import { featuredCharacters } from '../data/characters'

export default function Home() {
  return (
    <main>
      {/* ================= Section 02 · Hero ================= */}
      <section className="hero" id="hero">
        <div className="hero__bg" aria-hidden="true">
          <span className="hero__glow hero__glow--amber" />
          <span className="hero__glow hero__glow--clay" />
          <span className="hero__grid" />
        </div>

        <div className="container hero__inner">
          <div className="hero__copy">
            <span className="eyebrow on-light">A NEW WAY TO EXPERIENCE CHINESE CUISINE</span>
            <h1 className="hero__title">
              如果美食会说话，
              <br />
              <span className="accent-text">它想对你说什么？</span>
            </h1>
            <p className="hero__sub">
              每道菜都有自己的脾气、故事和味觉。来认识它们，和它们聊天，发现下一顿的惊喜。
            </p>
            <div className="hero__actions">
              <Link to="/personalities" className="btn btn--dark">
                进入美食宇宙 <span className="arrow">→</span>
              </Link>
              <Link to="/recommend" className="btn btn--ghost on-light">
                找到我的本命美食
              </Link>
            </div>
            <ul className="hero__facts">
              <li>
                <strong>08</strong>
                <span>传统菜系</span>
              </li>
              <li>
                <strong>17</strong>
                <span>美食角色</span>
              </li>
              <li>
                <strong>30</strong>
                <span>菜品库</span>
              </li>
            </ul>
          </div>

          <div className="hero__orbit">
            <FoodSoulOrbit />
          </div>
        </div>
      </section>

      <div className="home-dark" id="top">
        {/* ================= Section 03 · 美食人格宇宙 ================= */}
        <section className="section" id="personalities">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <div className="section-head__copy">
                  <span className="eyebrow">01 — PERSONALITY UNIVERSE</span>
                  <h2 className="h2">
                    每一种味道，
                    <br />
                    都有自己的性格。
                  </h2>
                  <p className="lede">
                    从热烈的麻辣，到细腻的鲜香。找到你想认识的那一个。
                  </p>
                </div>
                <p className="section-head__aside">
                  八个口味方向，构成美食宇宙的基本坐标。每个方向都有独立语言习惯与专业范围。
                </p>
              </div>
            </Reveal>

            <div className="bento">
              {categories.map((category, index) => (
                <Reveal key={category.id} delay={index * 45}>
                  <Link
                    to={`/personalities/${category.id}`}
                    className={`bento__card bento__card--${index + 1}`}
                  >
                    <div className="bento__visual">
                      <FoodPhoto
                        name={category.photoName}
                        emoji={category.emoji}
                        palette={category.palette}
                        alt={category.name}
                      />
                    </div>
                    <div className="bento__body">
                      <div className="bento__top">
                        <span className="bento__index">{category.index}</span>
                        <span className="bento__en">{category.en}</span>
                      </div>
                      <h3 className="bento__name">{category.name}</h3>
                      <p className="bento__desc">{category.desc}</p>
                      <div className="bento__tags">
                        {category.representatives.slice(0, 3).map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>
                    <span className="bento__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================= Section 04 · 美食角色精选 ================= */}
        <section className="section section--tight" id="characters">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <div className="section-head__copy">
                  <span className="eyebrow">02 — CHARACTERS</span>
                  <h2 className="h2">今天，想和谁聊聊？</h2>
                  <p className="lede">
                    它们不是客服。每个角色有自己的语气、幽默方式和擅长的话题。
                  </p>
                </div>
                <Link to="/personalities" className="btn btn--ghost btn--sm">
                  全部角色 <span className="arrow">→</span>
                </Link>
              </div>
            </Reveal>

            <div className="char-grid">
              {featuredCharacters.map((character, index) => (
                <Reveal key={character.id} delay={index * 55}>
                  <CharacterCard character={character} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================= Section 05 · AI 菜谱工作台 ================= */}
        <section className="section" id="recipe-lab">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <div className="section-head__copy">
                  <span className="eyebrow">03 — RECIPE STUDIO</span>
                  <h2 className="h2">
                    从一句“我想吃”，
                    <br />
                    到一桌好菜。
                  </h2>
                </div>
                <p className="section-head__aside">
                  结构化输出：食材、用量、火候、时间、注意事项与替代方案，服务端统一校验。
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="panel">
                <RecipeWorkbench />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= Section 06 · AI 美食推荐 ================= */}
        <section className="section section--tight" id="recommend">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <div className="section-head__copy">
                  <span className="eyebrow">04 — RECOMMENDATION</span>
                  <h2 className="h2">下一顿吃什么？</h2>
                  <p className="lede">
                    先说清你现在的心情、预算和时间。我们从真实菜品库里挑，不凭空编造。
                  </p>
                </div>
                <Link to="/recommend" className="btn btn--ghost btn--sm">
                  完整推荐页 <span className="arrow">→</span>
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <div className="panel">
                <RecommendPanel />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= Section 07 · 美食社区 ================= */}
        <section className="section" id="community">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <div className="section-head__copy">
                  <span className="eyebrow">05 — COMMUNITY</span>
                  <h2 className="h2">好吃的东西，值得一起聊。</h2>
                </div>
                <p className="section-head__aside">
                  讨论、菜谱分享与角色话题。首页展示精选内容，完整列表在社区页。
                </p>
              </div>
            </Reveal>

            <Reveal>
              <CommunitySection limit={5} />
            </Reveal>
          </div>
        </section>

        {/* ================= Section 08 · 品牌宣言 ================= */}
        <section className="statement" id="about">
          <div className="statement__glow" aria-hidden="true" />
          <div className="container statement__inner">
            <Reveal>
              <span className="eyebrow">06 — MANIFESTO</span>
              <h2 className="statement__title">
                不只是食物。
                <br />
                也是一种相遇。
              </h2>
              <p className="statement__sub">在每一道熟悉的味道里，发现新的故事。</p>
            </Reveal>
            <div className="statement__marks" aria-hidden="true">
              <span>麻</span>
              <span>鲜</span>
              <span>香</span>
              <span>酸</span>
              <span>甜</span>
            </div>
          </div>
        </section>

        {/* ================= Section 09 · CTA ================= */}
        <section className="cta">
          <div className="cta__glow" aria-hidden="true" />
          <div className="container cta__inner">
            <Reveal>
              <h2 className="cta__title">你的本命美食，正在等你。</h2>
              <p className="cta__sub">从一道菜开始，认识一个味道，也认识一点自己。</p>
              <div className="cta__actions">
                <Link to="/recommend" className="btn btn--primary">
                  开始探索 <span className="arrow">→</span>
                </Link>
                <Link to="/personalities" className="btn btn--ghost">
                  先逛逛美食人格
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {/* 悬浮美食小精灵：独立 fixed 容器，不参与首页布局 */}
      <FoodSoulPet />
    </main>
  )
}
