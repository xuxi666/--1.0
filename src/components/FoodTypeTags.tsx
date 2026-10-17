import { Link } from 'react-router-dom'
import { characterMap } from '../data/characters'
import { foodTypeTags } from '../data/cuisines'

/**
 * 独立美食类型 / 探索标签：
 * 重庆火锅、烧烤、面食、甜品、街头小吃——不属于八大菜系，但各自有角色。
 */
export default function FoodTypeTags({ label = '更多美食类型' }: { label?: string }) {
  return (
    <div className="food-types">
      <span className="food-types__label">{label}</span>
      <div className="cat-switch">
        {foodTypeTags.map((tag) => {
          const character = characterMap[tag.characterId]
          return (
            <Link
              key={tag.id}
              to={`/characters/${tag.characterId}`}
              className="cat-switch__item"
              aria-label={`查看${tag.name}${character ? `，${character.tagline}` : ''}`}
            >
              {tag.name}
              {character && <span>{character.tagline}</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
