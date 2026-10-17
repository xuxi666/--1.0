import { Link, useParams } from 'react-router-dom'
import FoodPhoto from '../components/FoodPhoto'
import Reveal from '../components/Reveal'
import { getCharacter } from '../data/characters'
import { categoryMap } from '../data/categories'

export default function CharacterPage() {
  const { id } = useParams()
  const character = getCharacter(id)

  if (!character) {
    return (
      <main className="page">
        <div className="container page-empty">
          <h1>这位美食角色还没诞生</h1>
          <Link to="/personalities" className="btn btn--ghost">
            去美食人格看看
          </Link>
        </div>
      </main>
    )
  }

  const category = categoryMap[character.categoryId]

  return (
    <main className="page">
      <div className="container">
        <Reveal>
          <Link to="/personalities" className="back-link">
            ← 返回美食人格
          </Link>
        </Reveal>

        <div className="char-detail">
          <Reveal className="char-detail__aside">
            <div className="char-panel">
              <div className="char-panel__visual">
                <FoodPhoto
                  name={character.name}
                  emoji={character.emoji}
                  palette={character.palette}
                  alt={character.name}
                  eager
                />
              </div>
              <div className="char-panel__body">
                <span className="char-panel__en">{character.en}</span>
                <h1 className="char-panel__name">{character.name}</h1>
                <span className="chip chip--accent">{category?.name ?? '美食'}</span>
                <div className="char-panel__traits">
                  {character.traits.map((trait) => (
                    <em key={trait}>{trait}</em>
                  ))}
                </div>
                <div className="char-panel__actions">
                  <Link to={`/chat/${character.id}`} className="btn btn--primary btn--block">
                    开始聊天 <span className="arrow">→</span>
                  </Link>
                  <Link
                    to={`/recipe?dish=${encodeURIComponent(character.name)}`}
                    className="btn btn--ghost btn--block"
                  >
                    让它教我做这道菜
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="char-detail__main">
            <Reveal>
              <div className="char-quote">
                <span className="char-quote__mark" aria-hidden="true">
                  “
                </span>
                <p>{character.quote}</p>
                <span className="char-quote__by">
                  — {character.name}，{character.tagline}
                </span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <section className="char-block">
                <h2 className="char-block__title">自我介绍</h2>
                <p className="char-intro">{character.selfIntro}</p>
              </section>
            </Reveal>

            <Reveal delay={90}>
              <section className="char-block">
                <h2 className="char-block__title">人格设定</h2>
                <dl className="voice-grid">
                  <div>
                    <dt>语言风格</dt>
                    <dd>{character.voice.tone}</dd>
                  </div>
                  <div>
                    <dt>语速与句式</dt>
                    <dd>{character.voice.pace}</dd>
                  </div>
                  <div>
                    <dt>幽默方式</dt>
                    <dd>{character.voice.humor}</dd>
                  </div>
                  <div>
                    <dt>情绪表达</dt>
                    <dd>{character.voice.emotion}</dd>
                  </div>
                  <div>
                    <dt>地域文化背景</dt>
                    <dd>{character.region}</dd>
                  </div>
                </dl>
              </section>
            </Reveal>

            <Reveal delay={120}>
              <section className="char-block">
                <h2 className="char-block__title">擅长聊什么</h2>
                <div className="knowledge-list">
                  {character.knowledge.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal delay={150}>
              <section className="char-block">
                <h2 className="char-block__title">说话的样子</h2>
                <ul className="example-list">
                  {character.examples.map((example) => (
                    <li key={example}>「{example}」</li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal delay={180}>
              <section className="char-block">
                <h2 className="char-block__title">可以这样开场</h2>
                <div className="suggest-list">
                  {character.suggestions.map((suggestion) => (
                    <Link
                      key={suggestion}
                      to={`/chat/${character.id}?q=${encodeURIComponent(suggestion)}`}
                      className="suggest-list__item"
                    >
                      {suggestion}
                      <span aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal delay={210}>
              <div className="char-detail__cta">
                <div>
                  <h3>现在就开始聊？</h3>
                  <p>它会记住你们聊过什么，也会记得你是谁。</p>
                </div>
                <Link to={`/chat/${character.id}`} className="btn btn--primary">
                  进入对话 <span className="arrow">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  )
}
