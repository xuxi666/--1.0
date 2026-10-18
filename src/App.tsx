import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import { CircularTransitionProvider } from './components/CircularTransition'
import { isWorldArrival } from './lib/worldArrival'
import Home from './pages/Home'
import ExplorePage from './pages/ExplorePage'
import PersonalitiesPage from './pages/PersonalitiesPage'
import CategoryPage from './pages/CategoryPage'
import CuisinePage from './pages/CuisinePage'
import CharacterPage from './pages/CharacterPage'
import ChatPage from './pages/ChatPage'
import RecipePage from './pages/RecipePage'
import RecommendPage from './pages/RecommendPage'
import CommunityPage from './pages/CommunityPage'
import DishBookPage from './pages/DishBookPage'
import DishDetailPage from './pages/DishDetailPage'
import TasteIndexPage from './pages/TasteIndexPage'
import TastePage from './pages/TastePage'

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      // 用 instant 覆盖 CSS 的 scroll-behavior: smooth，避免切换页面时缓慢滚动
      const root = document.documentElement
      const previous = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
      root.style.scrollBehavior = previous
      return
    }
    const id = hash.replace('#', '')
    let timer = 0
    const scrollToTarget = () => {
      const target = document.getElementById(id)
      if (!target) return false
      const top = target.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
      return true
    }
    if (!scrollToTarget()) {
      timer = window.setTimeout(scrollToTarget, 160)
    }
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}

function RouteFade({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  /**
   * 圆形揭示转场落地：真实页面与预览层展示的已经完全是同一画面，
   * 再播一次路由淡入会在「移除预览层」时闪出一个还没淡入的页面。
   * 按 pathname 记忆判定结果（之后同页面的重渲染不改变类名，避免动画被重新触发）。
   */
  const arrived = useMemo(() => isWorldArrival(pathname), [pathname])
  return (
    <div className={`route-fade ${arrived ? 'route-fade--skip' : ''}`} key={pathname}>
      {children}
    </div>
  )
}

/**
 * 转场预览层里的真实页面：与主路由共用同一批页面组件，
 * 只是渲染到目标 location 上——圆形剪裁里透出的就是将要落地的那个页面本身。
 */
function PreviewRoutes({ to }: { to: string }) {
  return (
    <Routes location={to}>
      <Route path="/cuisines/:cuisineId" element={<CuisinePage />} />
      <Route path="/tastes/:tasteId" element={<TastePage />} />
    </Routes>
  )
}

function ChatRoute() {
  const { id } = useParams()
  return <ChatPage key={id} />
}

function DishRoute() {
  const { id } = useParams()
  return <DishDetailPage key={id} />
}

function NotFound() {
  return (
    <main className="page">
      <div className="container page-empty">
        <h1>这一页还没被做出来</h1>
        <p>可能链接过期了，也可能这道菜还没上桌。</p>
        <Link to="/" className="btn btn--primary">
          回到首页 <span className="arrow">→</span>
        </Link>
      </div>
    </main>
  )
}

export default function App() {
  const renderTransitionPreview = useCallback((to: string) => <PreviewRoutes to={to} />, [])
  return (
    <BrowserRouter>
      <CircularTransitionProvider renderPreview={renderTransitionPreview}>
        <ScrollManager />
        <Nav />
        <RouteFade>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/personalities" element={<PersonalitiesPage />} />
            <Route path="/personalities/:categoryId" element={<CategoryPage />} />
            <Route path="/cuisines/:cuisineId" element={<CuisinePage />} />
            <Route path="/tastes" element={<TasteIndexPage />} />
            <Route path="/tastes/:tasteId" element={<TastePage />} />
            <Route path="/characters/:id" element={<CharacterPage />} />
            <Route path="/chat/:id" element={<ChatRoute />} />
            <Route path="/recipe" element={<RecipePage />} />
            <Route path="/dishes" element={<DishBookPage />} />
            <Route path="/dishes/:id" element={<DishRoute />} />
            <Route path="/recommend" element={<RecommendPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RouteFade>
        <Footer />
      </CircularTransitionProvider>
    </BrowserRouter>
  )
}
