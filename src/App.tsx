import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import PersonalitiesPage from './pages/PersonalitiesPage'
import CategoryPage from './pages/CategoryPage'
import CuisinePage from './pages/CuisinePage'
import CharacterPage from './pages/CharacterPage'
import ChatPage from './pages/ChatPage'
import RecipePage from './pages/RecipePage'
import RecommendPage from './pages/RecommendPage'
import CommunityPage from './pages/CommunityPage'

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
  return (
    <div className="route-fade" key={pathname}>
      {children}
    </div>
  )
}

function ChatRoute() {
  const { id } = useParams()
  return <ChatPage key={id} />
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
  return (
    <BrowserRouter>
      <ScrollManager />
      <Nav />
      <RouteFade>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/personalities" element={<PersonalitiesPage />} />
        <Route path="/personalities/:categoryId" element={<CategoryPage />} />
        <Route path="/cuisines/:cuisineId" element={<CuisinePage />} />
        <Route path="/characters/:id" element={<CharacterPage />} />
        <Route path="/chat/:id" element={<ChatRoute />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/recommend" element={<RecommendPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </RouteFade>
      <Footer />
    </BrowserRouter>
  )
}
