import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/portrait.css'
import './styles/photo.css'
import './styles/layout.css'
import './styles/orbit.css'
import './styles/home.css'
import './styles/pages.css'
import './styles/community.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
