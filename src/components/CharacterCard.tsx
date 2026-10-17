import { Link } from 'react-router-dom'
import type { Character } from '../data/characters'
import { categoryName } from '../data/categories'
import FoodPhoto from './FoodPhoto'

export default function CharacterCard({
  character,
  size = 'default',
}: {
  character: Character
  size?: 'default' | 'compact'
}) {
  return (
    <article className={`char-card ${size === 'compact' ? 'char-card--compact' : ''}`}>
      <Link
        to={`/characters/${character.id}`}
        className="char-card__overlay"
        aria-label={`查看 ${character.name} 的美食人格`}
      />
      <div className="char-card__visual">
        <FoodPhoto name={character.name} emoji={character.emoji} palette={character.palette} alt={character.name} />
        <span className="char-card__index" aria-hidden="true">
          {character.en}
        </span>
      </div>
      <div className="char-card__body">
        <div className="char-card__meta">
          <span className="chip chip--accent">{categoryName(character.categoryId)}</span>
          <span className="char-card__tag">{character.tagline}</span>
        </div>
        <h3 className="char-card__name">{character.name}</h3>
        <p className="char-card__intro">“{character.selfIntro}”</p>
        <div className="char-card__foot">
          <span className="char-card__traits">
            {character.traits.map((trait) => (
              <em key={trait}>{trait}</em>
            ))}
          </span>
          <Link to={`/chat/${character.id}`} className="btn btn--ghost btn--sm char-card__chat">
            开始聊天 <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
