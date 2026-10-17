import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRelatedDishes } from '../lib/api'
import type { RelatedDishesResponse } from '../types'
import FoodPhoto from './FoodPhoto'

export default function RelatedDishes({
  characterId,
  characterName,
}: {
  characterId: string
  characterName: string
}) {
  const [data, setData] = useState<RelatedDishesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    setLoading(true)
    setError('')

    getRelatedDishes(characterId, controller.signal)
      .then((result) => {
        if (!alive) return
        setData(result)
      })
      .catch((err) => {
        if (!alive || controller.signal.aborted) return
        setError(err instanceof Error ? err.message : '加载失败')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
      controller.abort()
    }
  }, [characterId, nonce])

  const refresh = useCallback(() => setNonce((v) => v + 1), [])

  const items = data?.items ?? []

  return (
    <aside className="chat-dishes" aria-label="相关菜品">
      <header className="chat-dishes__head">
        <div>
          <span className="chat-dishes__label">RELATED DISHES</span>
          <h2 className="chat-dishes__title">和{characterName}有关的菜</h2>
        </div>
        <button
          type="button"
          className="chat-dishes__refresh"
          onClick={refresh}
          disabled={loading}
          aria-label="换一批相关菜品"
        >
          {loading ? '…' : '换一批'}
        </button>
      </header>

      <div className="chat-dishes__list">
        {loading &&
          [0, 1, 2, 3].map((index) => (
            <div key={index} className="dish-mini dish-mini--skeleton" aria-hidden="true">
              <div className="dish-mini__photo" />
              <div className="dish-mini__body">
                <span className="sk sk--sm" />
                <span className="sk sk--lg" />
                <span className="sk sk--md" />
              </div>
            </div>
          ))}

        {!loading &&
          items.map((item) => (
            <article key={item.name} className="dish-mini">
              <Link
                to={`/recipe?dish=${encodeURIComponent(item.name)}`}
                className="dish-mini__photo"
                tabIndex={-1}
                aria-hidden="true"
              >
                <FoodPhoto name={item.name} emoji={item.emoji} alt={item.name} />
              </Link>
              <div className="dish-mini__body">
                <div className="dish-mini__top">
                  <span className="dish-mini__tag">{item.tag}</span>
                  <span className="dish-mini__meta">
                    {item.minutes ? `${item.minutes} 分钟` : ''}
                    {item.price ? ` · 人均 ¥${item.price}` : ''}
                  </span>
                </div>
                <h3 className="dish-mini__name">{item.name}</h3>
                <p className="dish-mini__reason">{item.reason}</p>
                <Link className="link-arrow dish-mini__cta" to={`/recipe?dish=${encodeURIComponent(item.name)}`}>
                  看菜谱 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
      </div>

      {error && <p className="chat-dishes__error">{error}</p>}

      <p className="chat-dishes__hint">
        {data?.demo ? '演示模式：候选由规则挑选' : 'AI 从菜品库中挑选并撰写理由'}
        <br />
        照片为 AI 生成的食物摄影图
      </p>
    </aside>
  )
}
