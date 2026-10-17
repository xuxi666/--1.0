import { useEffect, useState } from 'react'
import { generateRecipe } from '../lib/api'
import type { RecipeResponse } from '../types'
import RecipeCard from './RecipeCard'

const EXAMPLES = ['教我做正宗麻婆豆腐', '只有鸡蛋和番茄，能做什么？', '给我一份 20 分钟能完成的晚餐']
const SPICY_OPTIONS = ['不辣', '微辣', '中辣', '重辣']
const TIME_OPTIONS = [15, 30, 45, 90]
const EQUIPMENT = ['燃气灶 + 炒锅', '电磁炉 + 汤锅', '空气炸锅', '电饭煲', '只有一个煮锅']

export default function RecipeWorkbench({
  initialDish = '',
  idPrefix = 'rw',
}: {
  initialDish?: string
  idPrefix?: string
}) {
  const [dish, setDish] = useState(initialDish)
  const [ingredients, setIngredients] = useState('')
  const [servings, setServings] = useState(2)
  const [minutes, setMinutes] = useState(30)
  const [spicy, setSpicy] = useState('微辣')
  const [equipment, setEquipment] = useState(EQUIPMENT[0])
  const [note, setNote] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RecipeResponse | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (initialDish) setDish(initialDish)
  }, [initialDish])

  useEffect(() => {
    if (!loading) {
      setElapsed(0)
      return
    }
    const started = Date.now()
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(timer)
  }, [loading])

  const applyExample = (text: string) => {
    if (text.includes('麻婆豆腐')) {
      setDish('麻婆豆腐')
      setIngredients('嫩豆腐、牛肉末、郫县豆瓣、花椒')
      setSpicy('中辣')
      setMinutes(30)
    } else if (text.includes('鸡蛋')) {
      setDish('')
      setIngredients('鸡蛋、番茄')
      setSpicy('不辣')
      setMinutes(20)
    } else {
      setDish('一荤一素的家常晚餐')
      setIngredients('鸡胸肉、青菜、米饭')
      setSpicy('微辣')
      setMinutes(20)
    }
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const data = await generateRecipe({
        dish,
        ingredients,
        servings,
        minutes,
        spicy,
        equipment,
        note,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="workbench">
      <form className="workbench__form" onSubmit={onSubmit}>
        <div className="field field--wide">
          <label htmlFor={`${idPrefix}-dish`}>想做的菜</label>
          <input
            id={`${idPrefix}-dish`}
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            placeholder="例如：麻婆豆腐 / 番茄牛腩"
            maxLength={60}
          />
        </div>

        <div className="field field--wide">
          <label htmlFor={`${idPrefix}-ing`}>现有食材</label>
          <input
            id={`${idPrefix}-ing`}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="用顿号分隔，例如：嫩豆腐、牛肉末、蒜苗"
            maxLength={300}
          />
        </div>

        <div className="field">
          <span className="field__label">用餐人数</span>
          <div className="opt-row">
            {[1, 2, 3, 4, 6].map((n) => (
              <button
                key={n}
                type="button"
                className="opt"
                aria-pressed={servings === n}
                onClick={() => setServings(n)}
              >
                {n} 人
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">可用时间</span>
          <div className="opt-row">
            {TIME_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                className="opt"
                aria-pressed={minutes === m}
                onClick={() => setMinutes(m)}
              >
                {m} 分钟
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">辣度偏好</span>
          <div className="opt-row">
            {SPICY_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="opt"
                aria-pressed={spicy === s}
                onClick={() => setSpicy(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor={`${idPrefix}-eq`}>烹饪设备</label>
          <select
            id={`${idPrefix}-eq`}
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
          >
            {EQUIPMENT.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field field--wide">
          <label htmlFor={`${idPrefix}-note`}>补充要求（可选）</label>
          <input
            id={`${idPrefix}-note`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="不吃香菜、少盐、给孩子吃…"
            maxLength={200}
          />
        </div>

        <div className="workbench__submit">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? '正在生成…' : '生成菜谱'}
            {!loading && <span className="arrow">→</span>}
          </button>
          <span className="workbench__hint">结构化输出 · 服务端解析与校验</span>
        </div>
      </form>

      <div className="quick-row">
        <span className="quick-row__label">试试这些</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="quick-row__item"
            onClick={() => applyExample(example)}
          >
            {example}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading && (
        <div className="workbench__loading">
          <span className="spinner" aria-hidden="true" />
          <span>
            正在把「{dish || ingredients || '你的需求'}」拆成可执行的步骤…
            {elapsed > 3 && <em className="workbench__elapsed">已用 {elapsed}s，模型生成完整菜谱通常需要 20–40 秒</em>}
          </span>
        </div>
      )}

      {result && !loading && <RecipeCard data={result} />}
    </div>
  )
}
