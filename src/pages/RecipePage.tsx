import { useSearchParams } from 'react-router-dom'
import RecipeWorkbench from '../components/RecipeWorkbench'
import Reveal from '../components/Reveal'

export default function RecipePage() {
  const [params] = useSearchParams()
  const dish = params.get('dish') ?? ''

  return (
    <main className="page">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">RECIPE STUDIO</span>
            <h1 className="page-title">从一句“我想吃”，到一桌好菜。</h1>
            <p className="page-sub">
              告诉它想做什么、手头有什么、几个人吃、有多少时间。输出的是结构化菜谱：
              食材用量、火候、步骤、注意事项与替代方案，并经过服务端校验。
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="panel">
            <RecipeWorkbench initialDish={dish} idPrefix="recipe-page" />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="page-note">
            <h3>关于菜谱生成</h3>
            <ul>
              <li>模型输出为 JSON，由服务端逐字段校验（用量必须是数字、步骤必须有火候与时间）。</li>
              <li>校验不通过或接口异常时，会降级为本地演示菜谱，并明确标注「演示菜谱」。</li>
              <li>份量调整后，食材用量按比例重算，不重新请求模型。</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </main>
  )
}
