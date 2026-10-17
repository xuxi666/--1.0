import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScrollY } from '../lib/hooks'

const links = [
  { label: '首页', to: '/', hash: 'top' },
  { label: '美食人格', to: '/#personalities', hash: 'personalities' },
  { label: 'AI 菜谱', to: '/#recipe-lab', hash: 'recipe-lab' },
  { label: '智能推荐', to: '/#recommend', hash: 'recommend' },
  { label: '美食社区', to: '/#community', hash: 'community' },
]

export default function Nav() {
  const location = useLocation()
  const scrollY = useScrollY()
  const [open, setOpen] = useState(false)
  const [heroBottom, setHeroBottom] = useState(720)

  const isHome = location.pathname === '/'

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const measure = () => {
      const hero = document.getElementById('hero')
      setHeroBottom(hero ? hero.offsetTop + hero.offsetHeight : 640)
    }
    measure()
    window.addEventListener('resize', measure)
    const timer = window.setTimeout(measure, 600)
    return () => {
      window.removeEventListener('resize', measure)
      window.clearTimeout(timer)
    }
  }, [location.pathname])

  const solid = !isHome || scrollY > Math.max(40, heroBottom - 96)
  const lightSolid = !solid && scrollY > 16

  return (
    <header
      className={`nav ${solid ? 'is-solid' : lightSolid ? 'is-light-solid' : 'is-clear'} ${
        isHome ? '' : 'is-page'
      }`}
    >
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label="食有灵 FOOD SOUL 首页">
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

        <nav className="nav__links" aria-label="主导航">
          {links.map((link) => {
            const active =
              link.to === '/'
                ? location.pathname === '/' && !location.hash
                : link.to.startsWith('/#')
                  ? location.pathname === '/' && location.hash === `#${link.hash}`
                  : location.pathname === link.to
            return (
              <Link key={link.label} to={link.to} className={`nav__link ${active ? 'is-active' : ''}`}>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="nav__actions">
          <Link to="/recommend" className="btn btn--primary btn--sm nav__cta">
            发现我的本命美食 <span className="arrow">↗</span>
          </Link>
          <button
            type="button"
            className={`nav__toggle ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-label={open ? '关闭菜单' : '打开菜单'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`nav__mobile ${open ? 'is-open' : ''}`}>
        <div className="nav__mobile-inner">
          {links.map((link) => (
            <Link key={link.label} to={link.to} className="nav__mobile-link">
              {link.label}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
          <Link to="/recommend" className="btn btn--primary btn--block">
            发现我的本命美食 <span className="arrow">↗</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
