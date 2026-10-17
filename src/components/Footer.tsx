import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="nav__brand">
            <span className="nav__mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="14" cy="1.5" r="2.1" fill="currentColor" />
              </svg>
            </span>
            <span className="nav__name">食有灵</span>
            <span className="nav__en">FOOD SOUL</span>
          </Link>
          <p className="footer__tagline">让每一道中国美食，都有自己的灵魂。</p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>功能</h4>
            <ul>
              <li>
                <Link to="/personalities">美食人格</Link>
              </li>
              <li>
                <Link to="/recipe">AI 菜谱</Link>
              </li>
              <li>
                <Link to="/recommend">智能推荐</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>社区</h4>
            <ul>
              <li>
                <Link to="/community">美食讨论</Link>
              </li>
              <li>
                <Link to="/community">菜谱分享</Link>
              </li>
              <li>
                <Link to="/community">角色话题</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>关于</h4>
            <ul>
              <li>
                <Link to="/#about">品牌宣言</Link>
              </li>
              <li>
                <span>AI 能力：智谱 GLM</span>
              </li>
              <li>
                <span>演示项目 · 2026</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© 2026 食有灵 FOOD SOUL · 本站为产品原型演示</span>
        <div className="footer__bottom-links">
          <span>部分社区内容为演示数据</span>
          <span>杭州 · 中国</span>
        </div>
      </div>
    </footer>
  )
}
