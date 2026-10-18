import { Link } from 'react-router-dom'
import HomeFoodWheel from '../components/HomeFoodWheel'
import FoodSoulPet from '../components/FoodSoulPet'

/**
 * 首页（/）—— 全屏沉浸式入口
 * ------------------------------------------------------------
 * - 只保留「品牌标识 + 模式切换 + 环形转盘 + 中央文案 / 主入口 + 轻量辅助说明」，
 *   高度锚定 100dvh，首屏不会露出图鉴、社区、推荐、菜谱等后续模块；
 * - 其他模块整体搬到 /explore（ExplorePage），导航栏指向对应区块，原有功能全部保留；
 * - 点菜系 / 口味节点走 CircularTransition 圆形扩散转场，进入对应聊天页。
 */
export default function Home() {
  return (
    <main className="home-screen" id="top">
      <section className="hero hero--full" id="hero">
        <div className="hero__bg" aria-hidden="true">
          <span className="hero__glow hero__glow--amber" />
          <span className="hero__glow hero__glow--clay" />
          <span className="hero__grid" />
        </div>

        <div className="hero__stage">
          <HomeFoodWheel />
        </div>

        <Link to="/explore" className="hero__explore">
          <span className="hero__explore-long">想看的都在「探索」里 —— 图鉴、菜谱、推荐与社区</span>
          <span className="hero__explore-short">探索更多</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </section>

      {/* 悬浮美食小精灵：独立 fixed 容器，不参与首页布局 */}
      <FoodSoulPet />
    </main>
  )
}
