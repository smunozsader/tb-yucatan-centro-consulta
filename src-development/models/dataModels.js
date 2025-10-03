// Data Models for Centro de Consulta de Acuerdos Sanitarios
// Based on Excel database analysis: identical structure confirmed

/**
 * Agreement Data Model
 * Unified structure for both CESO and APHIS-USDA agreements
 */
export class Agreement {
  constructor(data = {}) {
    this.id = data.id || null
    this.agreementNumber = data['Número de Acuerdo'] || data.agreementNumber || ''
    this.description = data['Descripción del Acuerdo'] || data.description || ''
    this.responsible = data['Responsable del Seguimiento'] || data.responsible || ''
    this.meetingDate = this.parseDate(data['Fecha de Reunión'] || data.meetingDate)
    this.complianceDate = this.parseDate(data['Fecha de Cumplimiento'] || data.complianceDate)
    this.status = this.normalizeStatus(data['Estado'] || data.status || 'Pendiente')
    this.sessionType = data['Tipo de Sesión'] || data.sessionType || ''
    this.source = this.detectSource(this.agreementNumber)
    this.evidenceFiles = data.evidenceFiles || []
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  /**
   * Parse Excel date serial number to JavaScript Date
   */
  parseDate(excelDate) {
    if (!excelDate) return null
    
    // Excel date serial number to JS Date
    if (typeof excelDate === 'number') {
      // Excel epoch starts at 1900-01-01, JS epoch at 1970-01-01
      const excelEpoch = new Date(1900, 0, 1)
      const jsDate = new Date(excelEpoch.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000)
      return jsDate
    }
    
    if (typeof excelDate === 'string') {
      return new Date(excelDate)
    }
    
    return excelDate instanceof Date ? excelDate : null
  }

  /**
   * Normalize status values from both databases
   */
  normalizeStatus(status) {
    const statusMap = {
      'Cumplido': 'Completado',
      'Completado': 'Completado',
      'Pendiente': 'Pendiente',
      'Vencido': 'Vencido',
      'En Progreso': 'En Progreso'
    }
    
    return statusMap[status] || 'Pendiente'
  }

  /**
   * Detect source database based on agreement number format
   */
  detectSource(agreementNumber) {
    if (!agreementNumber) return 'unknown'
    
    // CESO format: CE-YUC-DDMMYY-XXX
    if (agreementNumber.match(/^CE-YUC-\d{6}-\d{3}$/)) {
      return 'CESO'
    }
    
    // APHIS format: XX-X-DDMMYY or similar
    if (agreementNumber.match(/^\d{1,2}-[A-Z]-\d{6}$/)) {
      return 'APHIS-USDA'
    }
    
    return 'unknown'
  }

  /**
   * Check if agreement is overdue
   */
  isOverdue() {
    if (!this.complianceDate || this.status === 'Completado') {
      return false
    }
    
    return new Date() > this.complianceDate
  }

  /**
   * Get formatted agreement number for display
   */
  getFormattedNumber() {
    return this.agreementNumber
  }

  /**
   * Get status badge class for UI
   */
  getStatusBadgeClass() {
    const statusClasses = {
      'Completado': 'badge-gobierno-verde',
      'Pendiente': 'badge-gobierno-dorado',
      'En Progreso': 'badge-gobierno-principal',
      'Vencido': 'badge-gobierno-danger'
    }
    
    const status = this.isOverdue() ? 'Vencido' : this.status
    return statusClasses[status] || 'badge-gobierno-gris'
  }

  /**
   * Convert to JSON for API calls
   */
  toJSON() {
    return {
      id: this.id,
      agreementNumber: this.agreementNumber,
      description: this.description,
      responsible: this.responsible,
      meetingDate: this.meetingDate?.toISOString(),
      complianceDate: this.complianceDate?.toISOString(),
      status: this.status,
      sessionType: this.sessionType,
      source: this.source,
      evidenceFiles: this.evidenceFiles,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString()
    }
  }
}

/**
 * Evidence File Model
 */
export class EvidenceFile {
  constructor(data = {}) {
    this.id = data.id || null
    this.agreementId = data.agreementId || null
    this.agreementNumber = data.agreementNumber || ''
    this.fileName = data.fileName || ''
    this.originalName = data.originalName || ''
    this.fileType = data.fileType || ''
    this.fileSize = data.fileSize || 0
    this.uploadDate = data.uploadDate || new Date()
    this.uploadedBy = data.uploadedBy || ''
    this.downloadUrl = data.downloadUrl || ''
    this.thumbnailUrl = data.thumbnailUrl || ''
    this.description = data.description || ''
  }

  /**
   * Check if file type is supported
   */
  isSupportedType() {
    const supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    return supportedTypes.includes(this.fileType)
  }

  /**
   * Get file icon class
   */
  getFileIcon() {
    if (this.fileType.includes('pdf')) return 'bi-file-pdf'
    if (this.fileType.includes('image')) return 'bi-image'
    if (this.fileType.includes('word')) return 'bi-file-word'
    return 'bi-file'
  }

  /**
   * Format file size for display
   */
  getFormattedSize() {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = this.fileSize
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }
}

/**
 * Database Source Configuration
 */
export const DATABASE_CONFIG = {
  sources: {
    CESO: {
      name: 'CESO',
      fullName: 'Consejo Estatal de Seguimiento Operativo del SINIDA',
      fileName: 'base datos CESO.xlsx',
      sheetName: 'page 1',
      color: '#611232',
      agreementPrefix: 'CE-YUC'
    },
    'APHIS-USDA': {
      name: 'APHIS-USDA',
      fullName: 'Grupo de Trabajo APHIS-USDA/SENASICA',
      fileName: 'base datos APHIS USDA.xlsx',
      sheetName: 'Sheet1',
      color: '#9d2449',
      agreementPrefix: null // Variable format
    }
  },
  
  statusOptions: [
    { value: 'Pendiente', label: 'Pendiente', color: '#a57f2c' },
    { value: 'En Progreso', label: 'En Progreso', color: '#611232' },
    { value: 'Completado', label: 'Completado', color: '#13322e' },
    { value: 'Vencido', label: 'Vencido', color: '#dc3545' }
  ],
  
  columnMapping: {
    'Row': 'id',
    'Número de Acuerdo': 'agreementNumber',
    'Descripción del Acuerdo': 'description',
    'Responsable del Seguimiento': 'responsible',
    'Fecha de Reunión': 'meetingDate',
    'Fecha de Cumplimiento': 'complianceDate',
    'Estado': 'status',
    'Tipo de Sesión': 'sessionType'
  }
}

export default { Agreement, EvidenceFile, DATABASE_CONFIG }