import React, { useState, useEffect, useCallback } from 'react'
import HomePage from './views/HomePage'
import AuthPage from './views/AuthPage'
import Dashboard from './views/Dashboard'
import { useAuth } from './context/AuthContext.jsx'
import './styles/App.css'

function App() {
  const { session, initialized } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')

  const syncRouteFromHash = useCallback(() => {
    const hash = window.location.hash
    if (hash === '#signin' || hash === '#signup') {
      setCurrentPage('auth')
    } else if (hash === '#dashboard') {
      setCurrentPage('dashboard')
    } else {
      setCurrentPage('home')
    }
  }, [])

  useEffect(() => {
    syncRouteFromHash()
    window.addEventListener('hashchange', syncRouteFromHash)
    return () => window.removeEventListener('hashchange', syncRouteFromHash)
  }, [syncRouteFromHash])

  if (!initialized) {
    return (
      <div className="app-loading">
        <p>Loading…</p>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'auth':
        return <AuthPage />
      case 'dashboard':
        return <Dashboard />
      default:
        return <HomePage />
    }
  }

  return <div className="App">{renderPage()}</div>
}

export default App
