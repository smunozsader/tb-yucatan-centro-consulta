// Dashboard Statistics Cards
import React from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function DashboardStats({ statistics }) {
  const { t } = useLanguage()

  const statCards = [
    {
      key: 'total',
      label: t('stats.total'),
      value: statistics.total,
      icon: '📊',
      color: 'text-gobierno-principal',
      bgColor: 'bg-light'
    },
    {
      key: 'completed',
      label: t('stats.completed'),
      value: statistics.completed,
      icon: '✅',
      color: 'text-gobierno-verde',
      bgColor: 'bg-light'
    },
    {
      key: 'pending',
      label: t('stats.pending'),
      value: statistics.pending,
      icon: '⏳',
      color: 'text-gobierno-dorado',
      bgColor: 'bg-light'
    },
    {
      key: 'inProgress',
      label: t('stats.inProgress'),
      value: statistics.inProgress,
      icon: '🔄',
      color: 'text-gobierno-principal',
      bgColor: 'bg-light'
    }
  ]

  // Add overdue card if there are overdue agreements
  if (statistics.overdue > 0) {
    statCards.push({
      key: 'overdue',
      label: t('stats.overdue'),
      value: statistics.overdue,
      icon: '⚠️',
      color: 'text-danger',
      bgColor: 'bg-light'
    })
  }

  const getPercentage = (value) => {
    if (statistics.total === 0) return 0
    return Math.round((value / statistics.total) * 100)
  }

  return (
    <div className="row g-3">
      {statCards.map((stat) => (
        <div key={stat.key} className="col-md-6 col-lg-3">
          <div className={`card-gobierno h-100 ${stat.bgColor}`}>
            <div className="card-body d-flex align-items-center">
              <div className="me-3" style={{ fontSize: '2rem' }}>
                {stat.icon}
              </div>
              <div className="flex-grow-1">
                <h3 className={`mb-1 ${stat.color}`}>
                  {stat.value}
                </h3>
                <p className="mb-1 small text-muted">
                  {stat.label}
                </p>
                <div className="d-flex align-items-center">
                  <small className="text-muted">
                    {getPercentage(stat.value)}% del total
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Source Statistics */}
      <div className="col-12">
        <div className="card-gobierno mt-2">
          <div className="card-body">
            <h6 className="text-gobierno-principal mb-3">
              📈 Distribución por Fuente
            </h6>
            <div className="row">
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <span className="badge badge-gobierno-principal me-2">CESO</span>
                    Consejo Estatal de Seguimiento Operativo
                  </span>
                  <strong className="text-gobierno-principal">
                    {statistics.bySources.CESO || 0}
                  </strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <span className="badge badge-gobierno-secundario me-2">APHIS-USDA</span>
                    Grupo de Trabajo APHIS-USDA/SENASICA
                  </span>
                  <strong className="text-gobierno-secundario">
                    {statistics.bySources['APHIS-USDA'] || 0}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}