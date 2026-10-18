import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DishCard from '../components/DishCard'
import Reveal from '../components/Reveal'
import { cuisines } from '../data/cuisines'
import { dishDatabase } from '../data/dishes'
import {
  DISH_DIFFICULTY_OPTIONS,
  DISH_FLAVOR_OPTIONS,
  DISH_FOODTYPE_OPTIONS,
  DISH_TYPE_OPTIONS,
  EMPTY_DISH_QUERY,
  dishCountByCuisine,
  isDishQueryActive,
  pendingImageCount,
  searchDishes,
  type DishQuery,
} from '../lib/dishBook'

/**
 * 美食图鉴（/dishes）
 * ------------------------------------------------------------
 * 全部内容来自唯一菜品库 src/data/dishes：
 * - 搜索：菜名 / 别名 / 菜系 / 地域 / 食材 / 故事与历史 / 口味标签（真实过滤，不是只改输入框文字）；
 * - 筛选：菜系（仅八大菜系）/ 菜品类型 / 口味 / 难度 / 独立美食类型，可任意组合，一键清除；
 * - 结果点击后进入 /dishes/:id 独立详情页。
 */
export default function DishBookPage() {
  const [query, setQuery] = useState<DishQuery>(EMPTY_DISH_QUERY)

  const results = useMemo(() => searchDishes(query), [query])
  const byCuisine = useMemo(() => dishCountByCuisine(), [])
  const pending = useMemo(() => pendingImageCount(), [])
  const active = isDishQueryActive(query)

  const update = (patch: Partial<DishQuery>) => setQuery((current) => ({ ...current, ...patch }))
  const toggle = (key: keyof DishQuery, value: string) =>
    setQuery((current) => ({ ...current, [key]: current[key] === value ? '' : value }))

  return (
    <main className="page">
      <div className="container">
        <Reveal>
          <div className="dishbook__intro">
            <span className="eyebrow">DISH BOOK</span>
            <h1 className="page-title">中国美食图鉴</h1>
            <p className="page-sub">
              共 {dishDatabase.length} 道菜，八大菜系都有独立内容：介绍、历史渊源、人物与典故、食材、口味技法与图片说明。
              史实与传说分开标注，查不到出处的说法如实写成「有不同说法」。
            </p>
            <div className="dishbook__stats">
              {cuisines.map((cuisine) => (
                <Link
                  key={cuisine.id}
                  to={`/cuisines/${cuisine.id}`}
                  className="dishbook__stat"
                  title={`去${cuisine.name}菜系页`}
                >
                  <strong>{byCuisine[cuisine.id] ?? 0}</strong>
                  <span>{cuisine.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <section className="dishbook__toolbar" aria-label="搜索与筛选">
            <div className="dishbook__search">
              <label htmlFor="dish-search">搜索菜品</label>
              <input
                id="dish-search"
                type="search"
                value={query.keyword}
                placeholder="菜名 / 别名 / 菜系 / 地域 / 食材 / 故事里的词，如「苏轼」「腌」「笋」"
                onChange={(event) => update({ keyword: event.target.value })}
              />
            </div>

            <div className="filter-row" role="group" aria-label="按菜系筛选">
              <span className="filter-row__label">菜系</span>
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine.id}
                  type="button"
                  className={`filter-chip ${query.cuisineId === cuisine.id ? 'is-on' : ''}`}
                  aria-pressed={query.cuisineId === cuisine.id}
                  onClick={() => toggle('cuisineId', cuisine.id)}
                >
                  {cuisine.name}
                </button>
              ))}
            </div>

            <div className="filter-row" role="group" aria-label="按菜品类型筛选">
              <span className="filter-row__label">类型</span>
              {DISH_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`filter-chip ${query.dishType === type ? 'is-on' : ''}`}
                  aria-pressed={query.dishType === type}
                  onClick={() => toggle('dishType', type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="filter-row filter-row--scroll" role="group" aria-label="按口味筛选">
              <span className="filter-row__label">口味</span>
              {DISH_FLAVOR_OPTIONS.map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  className={`filter-chip ${query.flavor === flavor ? 'is-on' : ''}`}
                  aria-pressed={query.flavor === flavor}
                  onClick={() => toggle('flavor', flavor)}
                >
                  {flavor}
                </button>
              ))}
            </div>

            <div className="filter-row" role="group" aria-label="按难度筛选">
              <span className="filter-row__label">难度</span>
              {DISH_DIFFICULTY_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`filter-chip ${query.difficulty === level ? 'is-on' : ''}`}
                  aria-pressed={query.difficulty === level}
                  onClick={() => toggle('difficulty', level)}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="filter-row" role="group" aria-label="按独立美食类型筛选">
              <span className="filter-row__label">独立类型</span>
              {DISH_FOODTYPE_OPTIONS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`filter-chip filter-chip--alt ${query.foodTypeId === tag.id ? 'is-on' : ''}`}
                  aria-pressed={query.foodTypeId === tag.id}
                  onClick={() => toggle('foodTypeId', tag.id)}
                >
                  {tag.name}
                </button>
              ))}
              <span className="filter-row__hint">火锅、烧烤、面食、甜品、街头小吃不属于八大菜系</span>
            </div>
          </section>
        </Reveal>

        <div className="dishbook__result-bar">
          <p className="dishbook__result-count" data-testid="dish-result-count">
            {active ? `筛选出 ${results.length} 道菜` : `全部 ${results.length} 道菜`}
          </p>
          {active && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setQuery(EMPTY_DISH_QUERY)}
            >
              清除筛选条件
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="dish-grid">
            {results.map((dish, index) => (
              <Reveal key={dish.id} delay={Math.min(index, 8) * 35}>
                <DishCard dish={dish} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="page-note">
            <h3>没有符合条件的菜</h3>
            <ul>
              <li>试试放宽条件：菜系、类型、口味、难度可以组合，也可以只留一个条件。</li>
              <li>如果搜索的是故事或食材，可以换个更短的词，比如「笋」「东坡」「腊」。</li>
            </ul>
            <div className="page-note__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setQuery(EMPTY_DISH_QUERY)}>
                清除筛选，看全部菜品 <span className="arrow">→</span>
              </button>
            </div>
          </div>
        )}

        <section className="section section--tight">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">CONTENT NOTES</span>
              <h2 className="h2">图鉴的内容规则</h2>
            </div>
            <p className="section-head__aside">
              这里尽量把「确定的」和「流传的」分开写，图片也一样。
            </p>
          </div>
          <div className="page-note">
            <ul>
              <li>
                每道菜的历史与典故都标注了内容类型（历史记载 / 文献存疑 / 地方传说 / 民间故事 / 现代流行说法），
                起源有争议的写「有不同说法」，不编造年份、文献出处与人物对话。
              </li>
              <li>
                图片全部是站内 AI 原创生成图（智谱 CogView），未使用来源不明的网络图片；
                {pending > 0
                  ? `目前仍有 ${pending} 道菜没有可靠图片，用统一占位图标注「图片待补充」，详情页里会写明。`
                  : '目前所有菜品都有与菜名对应的生成图；若以后出现缺图，会统一用占位图标注「图片待补充」，不用来源不明的网络图凑数。'}
              </li>
              <li>
                菜系归属有争议的菜（如叫花鸡在苏浙两地说法不一）在历史一栏如实写明分歧，
                火锅、烧烤、面食、甜品、街头小吃保留为独立美食类型，不计入八大菜系。
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
