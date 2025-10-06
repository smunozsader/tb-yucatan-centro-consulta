// Dashboard Table - Main data table with Evidence buttons integration
import React, { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { EvidenceButton } from '../Evidence/EvidenceModal.jsx'

export default function DashboardTable({ agreements }) {
  const { t } = useLanguage()
  const { hasPermission } = useAuth()
  const [sortField, setSortField] = useState('meetingDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

  // Sort agreements
  const sortedAgreements = [...agreements].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    // Handle dates
    if (aValue instanceof Date) {
      aValue = aValue.getTime()
      bValue = bValue.getTime()
    }
    
    // Handle strings
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Paginate agreements
  const totalPages = Math.ceil(sortedAgreements.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedAgreements = sortedAgreements.slice(startIndex, startIndex + pageSize)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️'
    return sortDirection === 'asc' ? '⬆️' : '⬇️'
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (agreement) => {
    const isOverdue = agreement.isOverdue()
    const status = isOverdue ? 'Vencido' : agreement.status
    const badgeClass = isOverdue ? 'badge-danger' : agreement.getStatusBadgeClass()
    
    return (
      <span className={`badge ${badgeClass}`}>
        {isOverdue && '⚠️ '}
        {status}
      </span>
    )
  }

  const getSourceBadge = (source) => {
    const sourceConfig = {
      'CESO': { class: 'badge-gobierno-principal', icon: '🏢' },
      'APHIS-USDA': { class: 'badge-gobierno-secundario', icon: '🇺🇸' }
    }
    
    const config = sourceConfig[source] || { class: 'badge-gobierno-gris', icon: '❓' }
    
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {source}
      </span>
    )
  }

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (agreements.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: '4rem' }}>📋</div>
        <h5 className="text-muted mt-3">No se encontraron acuerdos</h5>
        <p className="text-muted">
          Prueba ajustando los filtros de búsqueda o verifica la carga de datos.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Table Controls */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted">Mostrando:</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
        
        <div className="text-muted">
          {startIndex + 1}-{Math.min(startIndex + pageSize, agreements.length)} de {agreements.length}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="dashboard-full-width">
        <div className="dashboard-table-container">
          <table className="table table-governo dashboard-table mb-0">
            <thead className="table-dark">
              <tr>
                <th 
                  scope="col" 
                  className="cursor-pointer"
                  onClick={() => handleSort('agreementNumber')}
                  title="Ordenar por número de acuerdo"
                >
                  {t('table.id')} {getSortIcon('agreementNumber')}
                </th>
                <th scope="col">
                  {t('table.description')}
                </th>
                <th 
                  scope="col"
                  className="cursor-pointer"
                  onClick={() => handleSort('responsible')}
                  title="Ordenar por responsable"
                >
                  {t('table.responsible')} {getSortIcon('responsible')}
                </th>
                <th 
                  scope="col"
                  className="cursor-pointer"
                  onClick={() => handleSort('meetingDate')}
                  title="Ordenar por fecha de reunión"
                >
                  {t('table.meetingDate')} {getSortIcon('meetingDate')}
                </th>
                <th 
                  scope="col"
                  className="cursor-pointer"
                  onClick={() => handleSort('complianceDate')}
                  title="Ordenar por fecha de cumplimiento"
                >
                  {t('table.complianceDate')} {getSortIcon('complianceDate')}
                </th>
                <th 
                  scope="col"
                  className="cursor-pointer"
                  onClick={() => handleSort('status')}
                  title="Ordenar por estado"
                >
                  {t('table.status')} {getSortIcon('status')}
                </th>
                <th 
                  scope="col"
                  className="cursor-pointer"
                  onClick={() => handleSort('source')}
                  title="Ordenar por fuente"
                >
                  {t('table.source')} {getSortIcon('source')}
                </th>
                <th scope="col" className="text-center">
                  📂 {t('table.evidence')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAgreements.map((agreement, index) => (
                <tr 
                  key={agreement.agreementNumber || index}
                  className={`${agreement.isOverdue() ? 'table-warning' : ''}`}
                >
                  {/* Agreement Number */}
                  <td className="fw-bold">
                    <div className="d-flex align-items-center">
                      {agreement.isOverdue() && (
                        <span className="text-danger me-1" title="Acuerdo vencido">⚠️</span>
                      )}
                      <span className="text-governo-principal">
                        {agreement.agreementNumber}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td>
                    <div title={agreement.description}>
                      {truncateText(agreement.description, 120)}
                    </div>
                  </td>

                  {/* Responsible */}
                  <td>
                    <div title={agreement.responsible}>
                      {truncateText(agreement.responsible, 50)}
                    </div>
                  </td>

                  {/* Meeting Date */}
                  <td>
                    {formatDate(agreement.meetingDate)}
                  </td>

                  {/* Compliance Date */}
                  <td>
                    <div className={agreement.isOverdue() ? 'text-danger fw-bold' : ''}>
                      {formatDate(agreement.complianceDate)}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    {getStatusBadge(agreement)}
                  </td>

                  {/* Source */}
                  <td>
                    {getSourceBadge(agreement.source)}
                  </td>

                  {/* Evidence Button - THE CENTERPIECE CONNECTION */}
                  <td className="text-center">
                    <EvidenceButton 
                      agreement={agreement}
                      className="btn-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div className="text-muted">
            Página {currentPage} de {totalPages}
          </div>
          
          <nav aria-label="Paginación de acuerdos">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  «
                </button>
              </li>
              
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
              </li>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else {
                  const start = Math.max(1, currentPage - 2)
                  const end = Math.min(totalPages, start + 4)
                  pageNumber = start + i
                  if (pageNumber > end) return null
                }
                
                return (
                  <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </li>
                )
              }).filter(Boolean)}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </li>
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}