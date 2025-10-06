// Dashboard Filters for search and filtering agreements
import React, { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { DATABASE_CONFIG } from '../../models/dataModels.js'

export default function DashboardFilters() {
  const {
    searchQuery,
    statusFilter,
    sourceFilter,
    setSearchQuery,
    setStatusFilter,
    setSourceFilter,
    filteredAgreements,
    agreements
  } = useData()
  
  const { t } = useLanguage()
  const [searchInput, setSearchInput] = useState(searchQuery)

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    
    // Debounce search to avoid too many updates
    clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(() => {
      setSearchQuery(value)
    }, 300)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setStatusFilter('all')
    setSourceFilter('all')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'

  return (
    <div className="card-gobierno">
      <div className="card-header">
        <h6 className="mb-0 d-flex align-items-center">
          🔍 Filtros de Búsqueda
          {hasActiveFilters && (
            <span className="badge badge-gobierno-dorado ms-2">
              {filteredAgreements.length} de {agreements.length}
            </span>
          )}
        </h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3">
            {/* Search Input */}
            <div className="col-lg-4">
              <label className="form-label">🔍 Buscar Acuerdos</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Número, descripción o responsable..."
                  value={searchInput}
                  onChange={handleSearchChange}
                />
                <button 
                  className="btn btn-gobierno-outline" 
                  type="submit"
                  title="Buscar"
                >
                  🔍
                </button>
              </div>
              <small className="text-muted">
                Busca por número de acuerdo, descripción o responsable
              </small>
            </div>

            {/* Status Filter */}
            <div className="col-lg-3">
              <label className="form-label">📊 Estado</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                {DATABASE_CONFIG.statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
                <option value="overdue">⚠️ Vencidos</option>
              </select>
            </div>

            {/* Source Filter */}
            <div className="col-lg-3">
              <label className="form-label">🏢 Fuente</label>
              <select
                className="form-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">Todas las fuentes</option>
                {Object.entries(DATABASE_CONFIG.sources).map(([key, source]) => (
                  <option key={key} value={key}>
                    {source.name} - {source.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Actions */}
            <div className="col-lg-2">
              <label className="form-label">Acciones</label>
              <div className="d-flex gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-gobierno-outline btn-sm flex-fill"
                    onClick={clearFilters}
                    title="Limpiar filtros"
                  >
                    🗑️ Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Quick Filter Buttons */}
        <div className="row mt-3">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-2">
              <span className="text-muted small me-2">Filtros rápidos:</span>
              
              <button
                className={`btn btn-sm ${statusFilter === 'Pendiente' ? 'btn-gobierno-dorado' : 'btn-gobierno-outline'}`}
                onClick={() => setStatusFilter(statusFilter === 'Pendiente' ? 'all' : 'Pendiente')}
              >
                ⏳ Pendientes
              </button>
              
              <button
                className={`btn btn-sm ${statusFilter === 'overdue' ? 'btn-danger' : 'btn-governo-outline'}`}
                onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
              >
                ⚠️ Vencidos
              </button>
              
              <button
                className={`btn btn-sm ${statusFilter === 'Completado' ? 'btn-gobierno-verde' : 'btn-governo-outline'}`}
                onClick={() => setStatusFilter(statusFilter === 'Completado' ? 'all' : 'Completado')}
              >
                ✅ Completados
              </button>
              
              <button
                className={`btn btn-sm ${sourceFilter === 'CESO' ? 'btn-gobierno-principal' : 'btn-governo-outline'}`}
                onClick={() => setSourceFilter(sourceFilter === 'CESO' ? 'all' : 'CESO')}
              >
                🏢 CESO
              </button>
              
              <button
                className={`btn btn-sm ${sourceFilter === 'APHIS-USDA' ? 'btn-gobierno-secundario' : 'btn-governo-outline'}`}
                onClick={() => setSourceFilter(sourceFilter === 'APHIS-USDA' ? 'all' : 'APHIS-USDA')}
              >
                🇺🇸 APHIS-USDA
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="row mt-3">
            <div className="col-12">
              <div className="alert alert-info">
                📊 Mostrando <strong>{filteredAgreements.length}</strong> de <strong>{agreements.length}</strong> acuerdos
                {searchQuery && (
                  <span> • Búsqueda: "<strong>{searchQuery}</strong>"</span>
                )}
                {statusFilter !== 'all' && (
                  <span> • Estado: <strong>{statusFilter === 'overdue' ? 'Vencidos' : statusFilter}</strong></span>
                )}
                {sourceFilter !== 'all' && (
                  <span> • Fuente: <strong>{DATABASE_CONFIG.sources[sourceFilter]?.name}</strong></span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}