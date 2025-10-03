import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Repository from './pages/Repository'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize application
    const initializeApp = async () => {
      try {
        // Simulate initialization time
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('🎯 Centro de Consulta de Acuerdos Sanitarios - Initialized')
        setLoading(false)
      } catch (error) {
        console.error('Error initializing app:', error)
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spin">🔄</div>
          <span style={{ marginLeft: '1rem' }}>
            Cargando Centro de Consulta de Acuerdos Sanitarios...
          </span>
        </div>
      </div>
    )
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repository" element={<Repository />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App