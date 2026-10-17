import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import CharacterCard from '../components/CharacterCard'
import FoodPhoto from '../components/FoodPhoto'
import FoodTypeTags from '../components/FoodTypeTags'
import { categories } from '../data/categories'
import { characters } from '../data/characters'
import { cuisines } from '../data/cuisines'

export default function PersonalitiesPage() {
  return (
    <main className="page">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">PERSONALITY UNIVERSE</span>
            <h1 className="page-title">美食人格宇宙</h1>
            <p className="page-sub">
              八大菜系，八种口味方向，十七位独立角色。每个角色都有自己的语言习惯、知识边界与地域背景。
              先选一个菜系，或者直接找一位角色聊聊。
            </p>
          </div>
        </Reveal>

        <section className="section section--tight" id="cuisines">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">EIGHT CUISINES</span>
              <h2 className="h2">八大菜系</h2>
            </div>
            <p className="section-head__aside">
              川、粤、苏、鲁、湘、闽、浙、徽。菜系是文化分类，角色是独立人格——一个菜系可以有多道代表菜，
              每道菜都可以有自己的性格。
            </p>
          </div>

          <div className="cat-index">
            {cuisines.map((cuisine, index) => (
              <Reveal key={cuisine.id} delay={index * 40}>
                <Link to={`/cuisines/${cuisine.id}`} className="cat-tile">
                  <div className="cat-tile__visual">
                    <FoodPhoto
                      name={cuisine.name}
                      src={cuisine.image}
                      fallbackSrc={cuisine.fallbackImage}
                      emoji={cuisine.emoji}
                      palette={cuisine.palette}
                      alt={`${cuisine.name}代表菜`}
                    />
                  </div>
                  <div className="cat-tile__body">
                    <div className="cat-tile__row">
                      <span className="cat-tile__index">{cuisine.index}</span>
                      <span className="cat-tile__en">{cuisine.en}</span>
                    </div>
                    <h3>{cuisine.name}</h3>
                    <p>
                      {cuisine.personalityTag} · {cuisine.region}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <FoodTypeTags label="更多美食类型 · 不属于八大菜系，也各有角色" />
        </section>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">FLAVOR FAMILIES</span>
              <h2 className="h2">八种口味方向</h2>
            </div>
            <p className="section-head__aside">
              麻辣、鲜香、浓香、清爽、酸香、甜润、发酵与家常——这是角色们的底层性格坐标。
            </p>
          </div>

          <div className="cat-index">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={index * 40}>
                <Link to={`/personalities/${category.id}`} className="cat-tile">
                  <div className="cat-tile__visual">
                    <FoodPhoto name={category.photoName} emoji={category.emoji} palette={category.palette} alt={category.name} />
                  </div>
                  <div className="cat-tile__body">
                    <div className="cat-tile__row">
                      <span className="cat-tile__index">{category.index}</span>
                      <span className="cat-tile__en">{category.en}</span>
                    </div>
                    <h3>{category.name}</h3>
                    <p>{category.traits}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">ALL CHARACTERS</span>
              <h2 className="h2">全部 {characters.length} 位角色</h2>
            </div>
          </div>
          <div className="char-grid">
            {characters.map((character, index) => (
              <Reveal key={character.id} delay={Math.min(index, 5) * 45}>
                <CharacterCard character={character} />
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
