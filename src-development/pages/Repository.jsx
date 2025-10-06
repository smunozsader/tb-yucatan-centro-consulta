// Repository Page - Document Consultation
import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Repository() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const documentCategories = [
    { id: 'all', name: 'Todos los Documentos', icon: '📚' },
    { id: 'normative', name: 'Marco Normativo', icon: '📋' },
    { id: 'procedures', name: 'Procedimientos', icon: '📝' },
    { id: 'agreements', name: 'Acuerdos Oficiales', icon: '🤝' },
    { id: 'reports', name: 'Reportes', icon: '📊' },
    { id: 'templates', name: 'Plantillas', icon: '📄' },
    { id: 'guides', name: 'Guías de Usuario', icon: '📖' }
  ]

  const documents = [
    {
      id: 1,
      title: 'NOM-001-SAG/GAN-2015',
      description: 'Sistema Nacional de Identificación Animal de Bovinos y Colmenas',
      category: 'normative',
      type: 'PDF',
      size: '2.5 MB',
      date: '2024-01-15',
      url: '/docs/NOM-001-SAG-GAN-2015.pdf',
      official: true
    },
    {
      id: 2,
      title: 'Procedimiento de Carga de Evidencias',
      description: 'Guía completa para la carga de archivos de evidencia en el sistema',
      category: 'procedures',
      type: 'PDF',
      size: '1.8 MB',
      date: '2024-02-01',
      url: '/docs/procedimiento-evidencias.pdf',
      official: true
    },
    {
      id: 3,
      title: 'Plantilla Reunión CESO',
      description: 'Formato oficial para convocatorias de reuniones ordinarias CESO',
      category: 'templates',
      type: 'DOCX',
      size: '45 KB',
      date: '2024-01-20',
      url: '/templates/plantilla-reunion-ceso.docx',
      official: true
    },
    {
      id: 4,
      title: 'Plantilla Reunión APHIS-USDA',
      description: 'Formato oficial para convocatorias de reuniones APHIS-USDA',
      category: 'templates',
      type: 'DOCX',
      size: '48 KB',
      date: '2024-01-20',
      url: '/templates/plantilla-reunion-aphis.docx',
      official: true
    },
    {
      id: 5,
      title: 'Guía de Usuario del Sistema',
      description: 'Manual completo de uso del Centro de Consulta de Acuerdos Sanitarios',
      category: 'guides',
      type: 'PDF',
      size: '5.2 MB',
      date: '2024-02-15',
      url: '/GUIA_USUARIOS_PRUEBA.pdf',
      official: true
    },
    {
      id: 6,
      title: 'Reporte Estadístico Mensual',
      description: 'Estadísticas de cumplimiento de acuerdos - Febrero 2024',
      category: 'reports',
      type: 'XLSX',
      size: '890 KB',
      date: '2024-02-28',
      url: '/reports/estadisticas-feb-2024.xlsx',
      official: true
    },
    {
      id: 7,
      title: 'Acuerdo de Cooperación SENASICA-APHIS',
      description: 'Documento oficial de cooperación para control de tuberculosis bovina',
      category: 'agreements',
      type: 'PDF',
      size: '3.1 MB',
      date: '2024-01-10',
      url: '/docs/acuerdo-cooperacion-senasica-aphis.pdf',
      official: true
    },
    {
      id: 8,
      title: 'Protocolo de Exportación de Bovinos',
      description: 'Protocolo oficial para exportación de semovientes bovinos a Estados Unidos',
      category: 'procedures',
      type: 'PDF',
      size: '2.7 MB',
      date: '2024-01-25',
      url: '/docs/protocolo-exportacion-bovinos.pdf',
      official: true
    }
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return '📄'
      case 'DOCX': return '📝'
      case 'XLSX': return '📊'
      default: return '📁'
    }
  }

  const handleDownload = (document) => {
    // In a real implementation, this would trigger the actual download
    console.log('Downloading:', document.title)
    alert(`Descargando: ${document.title}\n\nEn una implementación real, esto iniciaría la descarga del archivo.`)
  }

  return (
    <div className="container my-5">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-governo-principal-claro p-4 rounded text-white">
            <h1 className="display-5 mb-2">📚 Repositorio de Documentos</h1>
            <p className="lead mb-0">
              Documentos oficiales, normativas, procedimientos y plantillas del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-governo-principal text-white">
              🔍
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {documentCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap gap-2">
            {documentCategories.map(category => (
              <button
                key={category.id}
                className={`btn ${selectedCategory === category.id 
                  ? 'btn-governo-principal' 
                  : 'btn-governo-outline'}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="row mb-3">
        <div className="col-12">
          <p className="text-muted">
            📊 Mostrando {filteredDocuments.length} de {documents.length} documentos
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="row">
        {filteredDocuments.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <div className="display-1 text-muted mb-3">📭</div>
              <h3 className="text-muted">No se encontraron documentos</h3>
              <p className="text-muted">
                Intenta con otros términos de búsqueda o selecciona otra categoría
              </p>
            </div>
          </div>
        ) : (
          filteredDocuments.map(document => (
            <div key={document.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-governo-principal-claro">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="display-6">{getFileIcon(document.type)}</div>
                    <div className="text-end">
                      {document.official && (
                        <span className="badge bg-governo-verde mb-1 d-block">
                          ✓ Oficial
                        </span>
                      )}
                      <span className="badge bg-governo-secundario">
                        {document.type}
                      </span>
                    </div>
                  </div>
                  
                  <h5 className="card-title text-governo-principal">
                    {document.title}
                  </h5>
                  
                  <p className="card-text text-muted small">
                    {document.description}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                      <span>📅 {new Date(document.date).toLocaleDateString('es-MX')}</span>
                      <span>💾 {document.size}</span>
                    </div>
                    
                    <button
                      className="btn btn-governo-principal w-100"
                      onClick={() => handleDownload(document)}
                    >
                      ⬇️ Descargar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Information Banner */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="alert alert-info border-governo-principal">
            <h5 className="alert-heading">
              ℹ️ Información sobre Documentos
            </h5>
            <p className="mb-0">
              Todos los documentos marcados como "Oficial" son versiones aprobadas por las autoridades competentes. 
              Para solicitar documentos adicionales o reportar problemas de acceso, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}