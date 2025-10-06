// Header Component with Government Branding and Navigation
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Header() {
  const { t, toggleLanguage, language } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      await logout()
    }
  }

  return (
    <header className="bg-gobierno-principal text-white">
      {/* Government Header */}
      <div className="container-fluid">
        <div className="row align-items-center py-2">
          <div className="col-md-8">
            <div className="d-flex align-items-center">
              <img 
                src="/logo.png" 
                alt="Gobierno de México" 
                className="me-3"
                style={{ height: '50px' }}
              />
              <div>
                <h1 className="h4 mb-0" style={{ fontFamily: 'var(--fuente-titulos)' }}>
                  {t('title')}
                </h1>
                <p className="mb-0 small opacity-75">
                  {t('subtitle')} • Gobierno de México
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 text-end">
            <div className="d-flex align-items-center justify-content-end gap-3">
              {/* Language Toggle */}
              <button
                className="btn btn-governo-outline btn-sm"
                onClick={toggleLanguage}
                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              >
                🌐 {language === 'es' ? 'EN' : 'ES'}
              </button>
              
              {/* User Info */}
              {isAuthenticated() && user && (
                <div className="d-flex align-items-center gap-2">
                  <span className="small">
                    👤 {user.name}
                  </span>
                  <span className="badge badge-governo-dorado">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-governo-secundario">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item">
                  <Link 
                    to="/" 
                    className={`nav-link text-white ${isActive('/')}`}
                  >
                    🏠 Inicio
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/dashboard" 
                    className={`nav-link text-white ${isActive('/dashboard')}`}
                  >
                    📊 {t('dashboard')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/repository" 
                    className={`nav-link text-white ${isActive('/repository')}`}
                  >
                    📚 {t('repository')}
                  </Link>
                </li>
                {isAuthenticated() && (
                  <>
                    <li className="nav-item">
                      <Link 
                        to="/profile" 
                        className={`nav-link text-white ${isActive('/profile')}`}
                      >
                        👤 {t('profile')}
                      </Link>
                    </li>
                    {user?.role === 'administrator' && (
                      <li className="nav-item">
                        <Link 
                          to="/messages" 
                          className={`nav-link text-white ${isActive('/messages')}`}
                        >
                          📧 {t('messages')}
                        </Link>
                      </li>
                    )}
                    <li className="nav-item">
                      <button 
                        className="nav-link text-white border-0 bg-transparent"
                        onClick={handleLogout}
                      >
                        🚪 {t('logout')}
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}