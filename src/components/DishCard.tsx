import { Link } from 'react-router-dom'
import FoodPhoto from './FoodPhoto'
import { cuisineMap, foodTypeTags } from '../data/cuisines'
import { dishImageSrc } from '../lib/dishImage'
import type { Dish } from '../data/dishes'

/**
 * 图鉴菜品卡片（列表 / 相关菜共用）
 * ------------------------------------------------------------
 * 一张图 + 菜名 + 所属（菜系或独立美食类型）+ 一句话简介 + 口味标签 + 详情入口。
 * 缺图的菜用统一占位图，并在卡片上明确写清「图片待补充」。
 */
export default function DishCard({ dish }: { dish: Dish }) {
  const cuisine = dish.cuisineId ? cuisineMap[dish.cuisineId] : undefined
  const foodType = dish.foodTypeId ? foodTypeTags.find((tag) => tag.id === dish.foodTypeId) : undefined
  const owner = cuisine ? cuisine.name : foodType ? `${foodType.name}（独立类型）` : '家常美食'

  return (
    <article className="dishbook-card">
      <Link to={`/dishes/${dish.id}`} className="dishbook-card__link" aria-label={`查看 ${dish.name} 详情`}>
        <div className="dishbook-card__visual">
          <FoodPhoto
            name={dish.name}
            src={dishImageSrc(dish)}
            emoji={dish.emoji}
            palette={cuisine?.palette}
            alt={dish.imageAlt}
          />
          {dish.imageStatus === 'pending' && <span className="dishbook-card__pending">图片待补充</span>}
        </div>
        <div className="dishbook-card__body">
          <div className="dishbook-card__top">
            <h3 className="dishbook-card__name">{dish.name}</h3>
            <span className="dishbook-card__owner">{owner}</span>
          </div>
          <p className="dishbook-card__summary">{dish.summary}</p>
          <div className="dishbook-card__flavors">
            {dish.flavors.slice(0, 3).map((flavor) => (
              <em key={flavor}>{flavor}</em>
            ))}
          </div>
          <span className="dishbook-card__foot">
            查看详情 <span className="arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  )
}
