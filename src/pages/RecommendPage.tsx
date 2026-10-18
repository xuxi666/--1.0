import { useSearchParams } from 'react-router-dom'
import RecommendPanel from '../components/RecommendPanel'
import Reveal from '../components/Reveal'
import { isCuisineId } from '../data/cuisines'

export default function RecommendPage() {
  const [params] = useSearchParams()
  const requested = params.get('cuisine') ?? ''
  // 从菜系页进入时（?cuisine=chuan）预选菜系；非法值忽略，不悄悄换成别的菜系
  const initialCuisine = isCuisineId(requested) ? requested : ''

  return (
    <main className="page">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">RECOMMENDATION</span>
            <h1 className="page-title">下一顿吃什么？</h1>
            <p className="page-sub">
              先由规则引擎从真实菜品库里筛选（辣度、时间、预算、地域、菜系、过敏原），
              再让 AI 为每道候选写具体理由。模型不允许凭空生成菜品。
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="panel">
            <RecommendPanel idPrefix="recommend-page" initialCuisine={initialCuisine} />
          </div>
        </Reveal>
      </div>
    </main>
  )
}
