import React, { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import './styles/App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#signin' || hash === '#signup') {
        setCurrentPage('auth')
      } else if (hash === '#dashboard') {
        setCurrentPage('dashboard')
      } else {
        setCurrentPage('home')
      }
    }

    // Check initial hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App

