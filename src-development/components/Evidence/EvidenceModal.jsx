// Evidence Modal - THE CENTERPIECE of the application
// This modal handles evidence viewing, upload, and download for agreements

import React, { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function EvidenceModal() {
  const { 
    showEvidenceModal, 
    selectedAgreement, 
    hideEvidenceModal 
  } = useData()
  
  const { t } = useLanguage()
  const { user, hasRole } = useAuth()
  
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadMode, setUploadMode] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (showEvidenceModal && selectedAgreement) {
      loadEvidenceFiles()
    }
  }, [showEvidenceModal, selectedAgreement])

  const loadEvidenceFiles = async () => {
    setLoading(true)
    try {
      // Mock evidence files - in production, load from server
      const mockFiles = [
        {
          id: 1,
          fileName: `evidencia_${selectedAgreement.agreementNumber}_1.pdf`,
          originalName: 'Certificado_Cumplimiento.pdf',
          fileType: 'application/pdf',
          fileSize: 256000,
          uploadDate: new Date('2024-05-15'),
          uploadedBy: 'MVZ. María del Refugio Medina',
          downloadUrl: '#',
          description: 'Certificado de cumplimiento del acuerdo'
        },
        {
          id: 2,
          fileName: `evidencia_${selectedAgreement.agreementNumber}_2.jpg`,
          originalName: 'Fotografia_Instalacion.jpg',
          fileType: 'image/jpeg',
          fileSize: 1024000,
          uploadDate: new Date('2024-05-16'),
          uploadedBy: 'MVZ. Francis A. Genovez',
          downloadUrl: '#',
          description: 'Fotografía de la instalación completada'
        }
      ]
      setEvidenceFiles(mockFiles)
    } catch (error) {
      console.error('Error loading evidence files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files) => {
    if (!hasRole(['administrator', 'responsible'])) {
      alert('No tiene permisos para subir evidencias')
      return
    }

    setLoading(true)
    try {
      // Mock file upload - in production, upload to server/Firebase Storage
      const newFiles = Array.from(files).map((file, index) => ({
        id: evidenceFiles.length + index + 1,
        fileName: `evidencia_${selectedAgreement.agreementNumber}_${evidenceFiles.length + index + 1}.${file.name.split('.').pop()}`,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date(),
        uploadedBy: user?.name || 'Usuario',
        downloadUrl: URL.createObjectURL(file),
        description: ''
      }))

      setEvidenceFiles([...evidenceFiles, ...newFiles])
      setUploadMode(false)
      
      console.log('📎 Evidence files uploaded:', newFiles)
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error al subir archivos de evidencia')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const downloadFile = (file) => {
    // Mock download - in production, download from server
    const link = document.createElement('a')
    link.href = file.downloadUrl
    link.download = file.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('⬇️ Downloaded evidence file:', file.originalName)
  }

  const markAsCompleted = async () => {
    if (!hasRole(['administrator', 'responsible'])) {
      alert('No tiene permisos para marcar como cumplido')
      return
    }

    if (evidenceFiles.length === 0) {
      alert('Debe subir al menos una evidencia para marcar como cumplido')
      return
    }

    setLoading(true)
    try {
      // Mock status update - in production, update database
      selectedAgreement.status = 'Completado'
      selectedAgreement.updatedAt = new Date()
      
      console.log('✅ Agreement marked as completed:', selectedAgreement.agreementNumber)
      alert('Acuerdo marcado como cumplido exitosamente')
      
      hideEvidenceModal()
    } catch (error) {
      console.error('Error updating agreement status:', error)
      alert('Error al actualizar el estado del acuerdo')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('word')) return '📝'
    return '📎'
  }

  if (!showEvidenceModal || !selectedAgreement) {
    return null
  }

  return (
    <div className="evidence-modal fade-in" onClick={hideEvidenceModal}>
      <div className="evidence-modal-content slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="evidence-modal-header">
          <div>
            <h4 className="text-gobierno-principal mb-1">
              📂 Sistema de Evidencias
            </h4>
            <div className="d-flex align-items-center gap-2">
              <span className="badge badge-gobierno-dorado">
                {selectedAgreement.source}
              </span>
              <strong>{selectedAgreement.agreementNumber}</strong>
            </div>
          </div>
          <button 
            className="btn btn-gobierno-outline"
            onClick={hideEvidenceModal}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="evidence-modal-body">
          {/* Agreement Details */}
          <div className="card-gobierno mb-3">
            <div className="card-header">
              <h6 className="mb-0">📋 Detalles del Acuerdo</h6>
            </div>
            <div className="card-body">
              <p className="mb-2">
                <strong>Descripción:</strong> {selectedAgreement.description}
              </p>
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Responsable:</strong> {selectedAgreement.responsible}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Estado:</strong> 
                    <span className={`badge ms-2 ${selectedAgreement.getStatusBadgeClass()}`}>
                      {selectedAgreement.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-0">
                    <strong>Fecha Reunión:</strong> {selectedAgreement.meetingDate?.toLocaleDateString()}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-0">
                    <strong>Fecha Cumplimiento:</strong> {selectedAgreement.complianceDate?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Files Section */}
          <div className="card-gobierno">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">📎 Archivos de Evidencia ({evidenceFiles.length})</h6>
              {hasRole(['administrator', 'responsible']) && (
                <button 
                  className="btn btn-gobierno-principal btn-sm"
                  onClick={() => setUploadMode(!uploadMode)}
                >
                  {uploadMode ? '❌ Cancelar' : '📎 Subir Evidencia'}
                </button>
              )}
            </div>
            <div className="card-body">
              {/* Upload Area */}
              {uploadMode && (
                <div 
                  className={`file-upload-area mb-3 ${dragOver ? 'dragover' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="text-center">
                    <div className="mb-2" style={{ fontSize: '2rem' }}>📎</div>
                    <h6>Arrastra archivos aquí o haz clic para seleccionar</h6>
                    <p className="text-muted mb-3">
                      Formatos soportados: PDF, JPG, PNG, Word (Max 10MB)
                    </p>
                    <input 
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      style={{ display: 'none' }}
                      id="evidence-file-input"
                    />
                    <label 
                      htmlFor="evidence-file-input" 
                      className="btn btn-gobierno-secundario"
                    >
                      Seleccionar Archivos
                    </label>
                  </div>
                </div>
              )}

              {/* Evidence Files List */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spin">🔄</div>
                  <span className="ms-2">Cargando evidencias...</span>
                </div>
              ) : evidenceFiles.length > 0 ? (
                <div className="evidence-files-list">
                  {evidenceFiles.map((file) => (
                    <div key={file.id} className="evidence-file-item border rounded p-3 mb-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center flex-grow-1">
                          <span className="me-3" style={{ fontSize: '1.5rem' }}>
                            {getFileIcon(file.fileType)}
                          </span>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{file.originalName}</h6>
                            <p className="text-muted mb-1 small">
                              {formatFileSize(file.fileSize)} • 
                              Subido por {file.uploadedBy} • 
                              {file.uploadDate.toLocaleDateString()}
                            </p>
                            {file.description && (
                              <p className="mb-0 small">{file.description}</p>
                            )}
                          </div>
                        </div>
                        <button 
                          className="btn btn-gobierno-outline btn-sm"
                          onClick={() => downloadFile(file)}
                          title="Descargar archivo"
                        >
                          ⬇️ Descargar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <div style={{ fontSize: '3rem' }}>📋</div>
                  <p>No hay evidencias subidas para este acuerdo</p>
                  {hasRole(['administrator', 'responsible']) && (
                    <p className="small">Haga clic en "Subir Evidencia" para añadir archivos</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="evidence-modal-footer">
          <button 
            className="btn btn-gobierno-outline"
            onClick={hideEvidenceModal}
          >
            Cerrar
          </button>
          
          {hasRole(['administrator', 'responsible']) && selectedAgreement.status !== 'Completado' && (
            <button 
              className="btn btn-gobierno-principal"
              onClick={markAsCompleted}
              disabled={loading || evidenceFiles.length === 0}
            >
              {loading ? '🔄 Procesando...' : '✅ Marcar como Cumplido'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Evidence Button Component for Dashboard
export function EvidenceButton({ agreement, className = '' }) {
  const { showEvidenceModal } = useData()
  
  const handleClick = (e) => {
    e.stopPropagation()
    showEvidenceModal(agreement)
  }
  
  return (
    <button 
      className={`btn btn-gobierno-dorado btn-sm ${className}`}
      onClick={handleClick}
      title="Ver evidencias del acuerdo"
    >
      📂 Evidencias
    </button>
  )
}