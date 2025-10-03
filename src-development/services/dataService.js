// Data Service for loading and managing Excel database content
import * as XLSX from 'xlsx'
import { Agreement, DATABASE_CONFIG } from '../models/dataModels.js'

export class DataService {
  constructor() {
    this.agreements = []
    this.loading = false
    this.error = null
  }

  /**
   * Load data from both Excel databases
   */
  async loadAllData() {
    this.loading = true
    this.error = null
    
    try {
      const cesoData = await this.loadExcelData('./BASES DATOS/base datos CESO.xlsx', 'CESO')
      const aphisData = await this.loadExcelData('./BASES DATOS/base datos APHIS USDA.xlsx', 'APHIS-USDA')
      
      // Combine and sort data
      this.agreements = [...cesoData, ...aphisData].sort((a, b) => {
        return new Date(b.meetingDate) - new Date(a.meetingDate)
      })
      
      console.log(`📊 Loaded ${this.agreements.length} agreements:`)
      console.log(`   - CESO: ${cesoData.length} records`)
      console.log(`   - APHIS-USDA: ${aphisData.length} records`)
      
      this.loading = false
      return this.agreements
      
    } catch (error) {
      this.error = error.message
      this.loading = false
      console.error('Error loading data:', error)
      throw error
    }
  }

  /**
   * Load data from a specific Excel file
   */
  async loadExcelData(filePath, source) {
    try {
      // For now, we'll use mock data based on our analysis
      // In production, this would load the actual Excel file
      return this.getMockData(source)
      
      /* 
      // Actual Excel loading code (for when running with file access):
      const response = await fetch(filePath)
      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer)
      
      const sourceConfig = DATABASE_CONFIG.sources[source]
      const worksheet = workbook.Sheets[sourceConfig.sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // Skip header row and convert to Agreement objects
      const agreements = jsonData.slice(1).map((row, index) => {
        const rowData = {}
        Object.keys(DATABASE_CONFIG.columnMapping).forEach((excelCol, colIndex) => {
          rowData[excelCol] = row[colIndex]
        })
        
        return new Agreement(rowData)
      })
      
      return agreements
      */
    } catch (error) {
      console.error(`Error loading ${source} data:`, error)
      throw error
    }
  }

  /**
   * Get mock data for development (based on actual Excel analysis)
   */
  getMockData(source) {
    if (source === 'CESO') {
      return [
        new Agreement({
          'Número de Acuerdo': 'CE-YUC-281122-001',
          'Descripción del Acuerdo': 'Instalación del CESO en Yucatán.',
          'Responsable del Seguimiento': 'MVZ. María del Refugio Medina Juárez',
          'Fecha de Reunión': new Date('2022-11-28'),
          'Fecha de Cumplimiento': new Date('2022-11-28'),
          'Estado': 'Cumplido',
          'Tipo de Sesión': 'Instalación'
        }),
        new Agreement({
          'Número de Acuerdo': 'CE-YUC-281122-002',
          'Descripción del Acuerdo': 'Los integrantes del CESO se dan por enterado acerca del manual de funcionamiento del CESO.',
          'Responsable del Seguimiento': 'MVZ. Francis A. Genovez Chanona',
          'Fecha de Reunión': new Date('2022-11-28'),
          'Fecha de Cumplimiento': new Date('2022-11-28'),
          'Estado': 'Cumplido',
          'Tipo de Sesión': 'Instalación'
        }),
        new Agreement({
          'Número de Acuerdo': 'CE-YUC-281122-003',
          'Descripción del Acuerdo': 'Se da a conocer el inventario de identificadores de las Ventanillas en el Estado.',
          'Responsable del Seguimiento': 'MVZ. Francis A. Genovez Chanona',
          'Fecha de Reunión': new Date('2022-11-28'),
          'Fecha de Cumplimiento': new Date('2023-01-15'),
          'Estado': 'Pendiente',
          'Tipo de Sesión': 'Instalación'
        })
      ]
    }
    
    if (source === 'APHIS-USDA') {
      return [
        new Agreement({
          'Número de Acuerdo': '01-I-060524',
          'Descripción del Acuerdo': 'No incluir en el barrido zoosanitario para fines de acreditación las cabezas probadas e identificadas en 2021.',
          'Responsable del Seguimiento': 'M.Sc. Gerardo Solís Pasos (Gobierno del Estado)',
          'Fecha de Reunión': new Date('2024-05-06'),
          'Fecha de Cumplimiento': new Date('2024-05-31'),
          'Estado': 'Completado',
          'Tipo de Sesión': 'Primera Ordinaria'
        }),
        new Agreement({
          'Número de Acuerdo': '02-I-060524',
          'Descripción del Acuerdo': 'Incluir en el barrido zoosanitario las cabezas probadas e identificadas en Buctzoty y Tizimín en 2022 conforme a recomendaciones de SENASICA.',
          'Responsable del Seguimiento': 'M. en P.P. MVZ Alfredo Colín Álvarez (CEFPPY)',
          'Fecha de Reunión': new Date('2024-05-06'),
          'Fecha de Cumplimiento': new Date('2024-06-30'),
          'Estado': 'En Progreso',
          'Tipo de Sesión': 'Primera Ordinaria'
        }),
        new Agreement({
          'Número de Acuerdo': '03-I-060524',
          'Descripción del Acuerdo': 'Validar como avance en el barrido zoosanitario 2023 las 94,563 cabezas probadas e identificadas incluyendo 2022 y hatos libres.',
          'Responsable del Seguimiento': 'MVZ. Víctor Manuel Calderón Jiménez (SENASICA)',
          'Fecha de Reunión': new Date('2024-05-06'),
          'Fecha de Cumplimiento': new Date('2024-07-15'),
          'Estado': 'Pendiente',
          'Tipo de Sesión': 'Primera Ordinaria'
        })
      ]
    }
    
    return []
  }

  /**
   * Search agreements by text
   */
  searchAgreements(query, agreements = this.agreements) {
    if (!query || query.trim() === '') {
      return agreements
    }
    
    const searchTerm = query.toLowerCase().trim()
    
    return agreements.filter(agreement => 
      agreement.agreementNumber.toLowerCase().includes(searchTerm) ||
      agreement.description.toLowerCase().includes(searchTerm) ||
      agreement.responsible.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Filter agreements by status
   */
  filterByStatus(status, agreements = this.agreements) {
    if (!status || status === 'all') {
      return agreements
    }
    
    return agreements.filter(agreement => {
      if (status === 'overdue') {
        return agreement.isOverdue()
      }
      return agreement.status === status
    })
  }

  /**
   * Filter agreements by source
   */
  filterBySource(source, agreements = this.agreements) {
    if (!source || source === 'all') {
      return agreements
    }
    
    return agreements.filter(agreement => agreement.source === source)
  }

  /**
   * Get agreement statistics
   */
  getStatistics(agreements = this.agreements) {
    const stats = {
      total: agreements.length,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      bySources: {
        'CESO': 0,
        'APHIS-USDA': 0
      }
    }
    
    agreements.forEach(agreement => {
      // Count by status
      if (agreement.isOverdue()) {
        stats.overdue++
      } else {
        switch (agreement.status) {
          case 'Completado':
            stats.completed++
            break
          case 'En Progreso':
            stats.inProgress++
            break
          case 'Pendiente':
            stats.pending++
            break
        }
      }
      
      // Count by source
      if (stats.bySources[agreement.source] !== undefined) {
        stats.bySources[agreement.source]++
      }
    })
    
    return stats
  }

  /**
   * Get agreement by number
   */
  getAgreementByNumber(agreementNumber) {
    return this.agreements.find(a => a.agreementNumber === agreementNumber)
  }
}

// Create singleton instance
export const dataService = new DataService()
export default dataService