import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FoodPhoto from './FoodPhoto'
import { recommendDishes } from '../lib/api'
import { dishMap } from '../data/dishes'
import { categoryName } from '../data/categories'
import { cuisineMap, cuisines } from '../data/cuisines'
import { characterMap } from '../data/characters'
import type { RecommendResponse } from '../types'

const MOODS = ['开心', '疲惫', '孤单', '想犒劳自己', '没胃口', '想清淡']
const FLAVORS = ['麻辣', '鲜香', '浓香', '清爽', '酸香', '甜润']
const SPICY = ['不辣', '微辣', '中辣', '重辣']
const BUDGET = [20, 40, 60, 100]
const PEOPLE = [1, 2, 3, 4]
const MINUTES = [20, 30, 45, 90]
const REGIONS = ['不限', '川渝', '粤港', '西北', '江浙', '北方', '东北', '湘赣', '云贵']
const AVOID = ['大豆', '小麦', '鸡蛋', '牛奶', '鱼类', '虾', '花生', '芝麻']

export default function RecommendPanel({
  idPrefix = 'rp',
  initialCuisine = '',
}: {
  idPrefix?: string
  /** 从菜系页进入时预选的菜系（八大菜系 id），空字符串表示不限 */
  initialCuisine?: string
}) {
  const [mood, setMood] = useState('疲惫')
  const [flavors, setFlavors] = useState<string[]>(['麻辣'])
  const [spicy, setSpicy] = useState(2)
  const [budget, setBudget] = useState(60)
  const [people, setPeople] = useState(2)
  const [minutes, setMinutes] = useState(45)
  const [region, setRegion] = useState('不限')
  const [cuisine, setCuisine] = useState(initialCuisine)
  const [avoid, setAvoid] = useState<string[]>([])

  useEffect(() => {
    setCuisine(initialCuisine)
  }, [initialCuisine])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RecommendResponse | null>(null)

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const data = await recommendDishes({
        mood,
        flavors,
        spicy,
        budget,
        people,
        minutes,
        region,
        cuisine,
        avoid,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '推荐失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recommend">
      <form className="recommend__form" id={`${idPrefix}-form`} onSubmit={onSubmit}>
        <div className="recommend__group">
          <span className="field__label">今天的心情</span>
          <div className="opt-row">
            {MOODS.map((item) => (
              <button
                key={item}
                type="button"
                className="opt"
                aria-pressed={mood === item}
                onClick={() => setMood(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="recommend__group">
          <span className="field__label">喜欢的口味（可多选）</span>
          <div className="opt-row">
            {FLAVORS.map((item) => (
              <button
                key={item}
                type="button"
                className="opt"
                aria-pressed={flavors.includes(item)}
                onClick={() => setFlavors((prev) => toggle(prev, item))}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="recommend__grid">
          <div className="field">
            <span className="field__label">辣度上限</span>
            <div className="opt-row">
              {SPICY.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className="opt"
                  aria-pressed={spicy === index}
                  onClick={() => setSpicy(index)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">人均预算</span>
            <div className="opt-row">
              {BUDGET.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="opt"
                  aria-pressed={budget === item}
                  onClick={() => setBudget(item)}
                >
                  ¥{item}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">用餐人数</span>
            <div className="opt-row">
              {PEOPLE.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="opt"
                  aria-pressed={people === item}
                  onClick={() => setPeople(item)}
                >
                  {item} 人
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">制作时间</span>
            <div className="opt-row">
              {MINUTES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="opt"
                  aria-pressed={minutes === item}
                  onClick={() => setMinutes(item)}
                >
                  {item} 分钟
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="recommend__group">
          <span className="field__label">地域偏好</span>
          <div className="opt-row">
            {REGIONS.map((item) => (
              <button
                key={item}
                type="button"
                className="opt"
                aria-pressed={region === item}
                onClick={() => setRegion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="recommend__group">
          <span className="field__label">限定菜系（可选）</span>
          <div className="opt-row">
            <button
              type="button"
              className="opt"
              aria-pressed={cuisine === ''}
              onClick={() => setCuisine('')}
            >
              不限
            </button>
            {cuisines.map((item) => (
              <button
                key={item.id}
                type="button"
                className="opt"
                aria-pressed={cuisine === item.id}
                onClick={() => setCuisine(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="recommend__group">
          <span className="field__label">忌口与过敏原（可多选）</span>
          <div className="opt-row">
            {AVOID.map((item) => (
              <button
                key={item}
                type="button"
                className="opt"
                aria-pressed={avoid.includes(item)}
                onClick={() => setAvoid((prev) => toggle(prev, item))}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="recommend__submit">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? '正在挑选…' : '为我推荐'}
            {!loading && <span className="arrow">→</span>}
          </button>
          <span className="workbench__hint">
            先从菜品库筛选（可限定菜系），再让 AI 写推荐理由 · 不凭空生成菜品
          </span>
        </div>
      </form>

      {error && <p className="form-error">{error}</p>}

      {loading && (
        <div className="workbench__loading">
          <span className="spinner" aria-hidden="true" />
          正在按你的口味、预算和时间筛选候选菜品…
        </div>
      )}

      {result && !loading && (
        <div className="recommend__results">
          <div className="recommend__results-head">
            {result.demo ? (
              <span className="demo-flag">推荐理由为本地规则生成（演示模式）</span>
            ) : (
              <span className="live-flag">理由由智谱 GLM 生成</span>
            )}
            <span className="recommend__count">
              从菜品库中筛出 {result.results.length} 道候选
            </span>
          </div>

          {result.results.length === 0 && (
            <div className="page-note recommend__empty">
              <h3>这个筛选条件下暂时没有菜品</h3>
              <ul>
                <li>
                  {cuisine
                    ? `菜品库里暂时没有明确归属「${
                        cuisines.find((item) => item.id === cuisine)?.name ?? cuisine
                      }」的候选菜——我们不会用其他菜系的菜来凑数。可以放宽菜系条件，或去 AI 菜谱直接生成想吃的菜。`
                    : '试试放宽辣度、预算、时间或忌口条件。'}
                </li>
              </ul>
            </div>
          )}

          <div className="dish-grid">
            {result.results.map((item, index) => {
              const dish = dishMap[item.id]
              if (!dish) return null
              const character = dish.characterId ? characterMap[dish.characterId] : undefined
              return (
                <article key={item.id} className="dish-card" style={{ animationDelay: `${index * 70}ms` }}>
                  <div className="dish-card__top">
                    <span className="dish-card__thumb">
                      <FoodPhoto name={dish.name} emoji={dish.emoji} alt={dish.name} />
                    </span>
                    <div>
                      <h4>{dish.name}</h4>
                      <span className="dish-card__cat">
                        {categoryName(dish.categoryId)} · {dish.region}
                        {dish.cuisineId && (
                          <em className="dish-card__cuisine">{cuisineMap[dish.cuisineId].name}</em>
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="dish-card__reason">{item.reason}</p>
                  <div className="dish-card__meta">
                    <span>{dish.minutes} 分钟</span>
                    <span>人均 ¥{dish.price}</span>
                    <span>辣度 {dish.spicy}/3</span>
                  </div>
                  <div className="dish-card__actions">
                    <Link className="link-arrow" to={`/recipe?dish=${encodeURIComponent(dish.name)}`}>
                      查看菜谱 <span aria-hidden="true">→</span>
                    </Link>
                    {character && (
                      <Link className="link-arrow" to={`/characters/${character.id}`}>
                        认识 {character.name} <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
