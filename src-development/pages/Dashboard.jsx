// Dashboard Page - Main agreement management interface
import React, { useState, useEffect } from 'react'
import { useData } from '../context/DataContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import DashboardStats from '../components/Dashboard/DashboardStats.jsx'
import DashboardFilters from '../components/Dashboard/DashboardFilters.jsx'
import DashboardTable from '../components/Dashboard/DashboardTable.jsx'
import EvidenceModal from '../components/Evidence/EvidenceModal.jsx'

export default function Dashboard() {
  const { 
    loading, 
    error, 
    filteredAgreements, 
    statistics,
    loadData 
  } = useData()
  
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    // Load data when component mounts if not already loaded
    if (!loading && filteredAgreements.length === 0) {
      loadData()
    }
  }, [])

  if (loading) {
    return (
      <div className="container dashboard-container">
        <div className="loading">
          <div className="spin">🔄</div>
          <span className="ms-3">{t('loading')}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container dashboard-container">
        <div className="error">
          <h5>❌ {t('errorLoading')}</h5>
          <p>{error}</p>
          <button className="btn btn-gobierno-principal mt-2" onClick={loadData}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container-fluid dashboard-container">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="text-gobierno-principal mb-1">
                  📊 {t('dashboard')}
                </h2>
                <p className="text-muted mb-0">
                  {t('dashboardDesc')}
                </p>
              </div>
              
              {/* User Info */}
              {isAuthenticated() && (
                <div className="text-end">
                  <p className="mb-0 small text-muted">
                    👤 {user.name}
                  </p>
                  <span className="badge badge-gobierno-dorado">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
            
            {/* Quick Stats */}
            <DashboardStats statistics={statistics} />
          </div>
        </div>

        {/* Filters Section */}
        <div className="row mb-4">
          <div className="col-12">
            <DashboardFilters />
          </div>
        </div>

        {/* Main Data Table */}
        <div className="row">
          <div className="col-12">
            <div className="card-gobierno">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  📋 Acuerdos ({filteredAgreements.length})
                </h5>
                <div className="d-flex gap-2">
                  {/* Export buttons for administrators */}
                  {user?.role === 'administrator' && (
                    <>
                      <button className="btn btn-gobierno-outline btn-sm">
                        📊 Exportar Excel
                      </button>
                      <button className="btn btn-gobierno-outline btn-sm">
                        📄 Exportar PDF
                      </button>
                    </>
                  )}
                  <button 
                    className="btn btn-gobierno-principal btn-sm"
                    onClick={loadData}
                    title="Actualizar datos"
                  >
                    🔄 Actualizar
                  </button>
                </div>
              </div>
              
              <div className="card-body p-0">
                <DashboardTable agreements={filteredAgreements} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex justify-content-center gap-3">
              <div className="text-center">
                <p className="mb-1 text-muted small">Total de Acuerdos</p>
                <h4 className="text-gobierno-principal">{statistics.total}</h4>
              </div>
              <div className="text-center">
                <p className="mb-1 text-muted small">Pendientes</p>
                <h4 className="text-gobierno-dorado">{statistics.pending}</h4>
              </div>
              <div className="text-center">
                <p className="mb-1 text-muted small">Completados</p>
                <h4 className="text-gobierno-verde">{statistics.completed}</h4>
              </div>
              {statistics.overdue > 0 && (
                <div className="text-center">
                  <p className="mb-1 text-muted small">⚠️ Vencidos</p>
                  <h4 className="text-danger">{statistics.overdue}</h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Modal - THE CENTERPIECE */}
      <EvidenceModal />
    </>
  )
}