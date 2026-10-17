import { useMemo, useState } from 'react'
import type { RecipeResponse } from '../types'

function formatAmount(amount: number): string {
  if (amount >= 100) return String(Math.round(amount))
  if (amount >= 10) return String(Math.round(amount * 2) / 2)
  return String(Math.round(amount * 10) / 10)
}

export default function RecipeCard({ data }: { data: RecipeResponse }) {
  const { recipe } = data
  const [servings, setServings] = useState(recipe.servings)

  const ratio = servings / Math.max(1, recipe.servings)
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes

  const ingredients = useMemo(
    () =>
      recipe.ingredients.map((item) => ({
        ...item,
        display: `${formatAmount(item.amount * ratio)} ${item.unit}`,
      })),
    [recipe.ingredients, ratio],
  )

  return (
    <article className="recipe-card">
      <header className="recipe-card__head">
        <div>
          <div className="recipe-card__flags">
            {data.demo ? (
              <span className="demo-flag">演示菜谱 · 未调用真实模型</span>
            ) : (
              <span className="live-flag">智谱 GLM 生成 · 已通过服务端校验</span>
            )}
            {data.error && <span className="recipe-card__err">降级原因：{data.error}</span>}
          </div>
          <h3 className="recipe-card__title">{recipe.title}</h3>
          <div className="recipe-card__meta">
            <span>准备 {recipe.prepMinutes} 分钟</span>
            <span className="dot" />
            <span>烹饪 {recipe.cookMinutes} 分钟</span>
            <span className="dot" />
            <span>合计约 {totalMinutes} 分钟</span>
            <span className="dot" />
            <span>{recipe.difficulty}</span>
            <span className="dot" />
            <span>{recipe.flavor}</span>
          </div>
        </div>

        <div className="servings">
          <span className="servings__label">份量</span>
          <div className="servings__control">
            <button
              type="button"
              onClick={() => setServings((v) => Math.max(1, v - 1))}
              aria-label="减少份量"
              disabled={servings <= 1}
            >
              −
            </button>
            <span>
              {servings} <em>人份</em>
            </span>
            <button
              type="button"
              onClick={() => setServings((v) => Math.min(12, v + 1))}
              aria-label="增加份量"
              disabled={servings >= 12}
            >
              +
            </button>
          </div>
          {ratio !== 1 && <span className="servings__note">食材已按比例重算</span>}
        </div>
      </header>

      <div className="recipe-card__body">
        <section className="recipe-col">
          <h4 className="recipe-col__title">食材清单</h4>
          <ul className="ingredient-list">
            {ingredients.map((item) => (
              <li key={item.name}>
                <span className="ingredient-list__name">
                  {item.name}
                  {item.note && <em>{item.note}</em>}
                </span>
                <span className="ingredient-list__amount">{item.display}</span>
              </li>
            ))}
          </ul>
          {recipe.allergens.length > 0 && (
            <p className="recipe-allergen">含过敏原：{recipe.allergens.join('、')}</p>
          )}
        </section>

        <section className="recipe-col recipe-col--wide">
          <h4 className="recipe-col__title">步骤</h4>
          <ol className="step-list">
            {recipe.steps.map((step) => (
              <li key={step.order} className="step">
                <span className="step__index">{String(step.order).padStart(2, '0')}</span>
                <div className="step__body">
                  <p className="step__action">{step.action}</p>
                  <div className="step__tags">
                    {step.heat && <span className="step__tag">{step.heat}</span>}
                    {step.minutes ? <span className="step__tag">约 {step.minutes} 分钟</span> : null}
                  </div>
                  {step.tip && <p className="step__tip">提示：{step.tip}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {(recipe.tips.length > 0 || recipe.substitutions.length > 0) && (
        <footer className="recipe-card__foot">
          {recipe.tips.length > 0 && (
            <div className="recipe-note">
              <h4>注意事项</h4>
              <ul>
                {recipe.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          {recipe.substitutions.length > 0 && (
            <div className="recipe-note">
              <h4>替代方案</h4>
              <ul>
                {recipe.substitutions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </footer>
      )}
    </article>
  )
}
