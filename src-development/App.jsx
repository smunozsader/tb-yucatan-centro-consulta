import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Layout/Header.jsx'
import Footer from './components/Layout/Footer.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Repository from './pages/Repository.jsx'
import Profile from './pages/Profile.jsx'
import Messages from './pages/Messages.jsx'
import EvidenceModal from './components/Evidence/EvidenceModal.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'

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
          <div className="app min-vh-100 d-flex flex-column">
            <Header />
            <main className="main-content flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repository" element={<Repository />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Global Evidence Modal */}
            <EvidenceModal />
          </div>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App