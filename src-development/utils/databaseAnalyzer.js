// Database Analysis Utility
// This utility will help us examine the Excel files structure

import * as XLSX from 'xlsx'

export class DatabaseAnalyzer {
  static async analyzeExcelFile(filePath) {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath)
      const sheetNames = workbook.SheetNames
      
      const analysis = {
        fileName: filePath.split('/').pop(),
        sheets: []
      }
      
      // Analyze each sheet
      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        const sheetAnalysis = {
          name: sheetName,
          columns: jsonData[0] || [], // First row should be headers
          rowCount: jsonData.length - 1, // Exclude header
          sampleData: jsonData.slice(1, 4) // First 3 data rows
        }
        
        analysis.sheets.push(sheetAnalysis)
      })
      
      return analysis
    } catch (error) {
      console.error('Error analyzing Excel file:', error)
      throw error
    }
  }
  
  static compareStructures(analysis1, analysis2) {
    const comparison = {
      file1: analysis1.fileName,
      file2: analysis2.fileName,
      structureMatch: true,
      differences: []
    }
    
    // Compare sheet names
    const sheets1 = analysis1.sheets.map(s => s.name).sort()
    const sheets2 = analysis2.sheets.map(s => s.name).sort()
    
    if (JSON.stringify(sheets1) !== JSON.stringify(sheets2)) {
      comparison.structureMatch = false
      comparison.differences.push({
        type: 'sheet_names',
        file1_sheets: sheets1,
        file2_sheets: sheets2
      })
    }
    
    // Compare columns for each sheet
    analysis1.sheets.forEach(sheet1 => {
      const sheet2 = analysis2.sheets.find(s => s.name === sheet1.name)
      
      if (!sheet2) {
        comparison.structureMatch = false
        comparison.differences.push({
          type: 'missing_sheet',
          sheet: sheet1.name,
          missing_in: analysis2.fileName
        })
        return
      }
      
      // Compare columns
      const cols1 = sheet1.columns.sort()
      const cols2 = sheet2.columns.sort()
      
      if (JSON.stringify(cols1) !== JSON.stringify(cols2)) {
        comparison.structureMatch = false
        comparison.differences.push({
          type: 'column_mismatch',
          sheet: sheet1.name,
          file1_columns: cols1,
          file2_columns: cols2
        })
      }
    })
    
    return comparison
  }
  
  static generateDataModel(analysis) {
    // Generate a data model based on the Excel structure
    const model = {
      fileName: analysis.fileName,
      entities: []
    }
    
    analysis.sheets.forEach(sheet => {
      const entity = {
        name: sheet.name,
        fields: sheet.columns.map(col => ({
          name: col,
          type: this.inferDataType(sheet.sampleData, sheet.columns.indexOf(col))
        }))
      }
      
      model.entities.push(entity)
    })
    
    return model
  }
  
  static inferDataType(sampleData, columnIndex) {
    // Infer data type based on sample data
    const samples = sampleData.map(row => row[columnIndex]).filter(val => val != null)
    
    if (samples.length === 0) return 'string'
    
    // Check if all samples are numbers
    if (samples.every(val => !isNaN(val) && !isNaN(parseFloat(val)))) {
      return 'number'
    }
    
    // Check if all samples are dates
    if (samples.every(val => !isNaN(Date.parse(val)))) {
      return 'date'
    }
    
    // Check if all samples are boolean-like
    if (samples.every(val => ['true', 'false', 'yes', 'no', '1', '0'].includes(String(val).toLowerCase()))) {
      return 'boolean'
    }
    
    return 'string'
  }
}

// Example usage function
export async function analyzeDatabases() {
  try {
    const cesoAnalysis = await DatabaseAnalyzer.analyzeExcelFile('./BASES DATOS/base datos CESO.xlsx')
    const aphisAnalysis = await DatabaseAnalyzer.analyzeExcelFile('./BASES DATOS/base datos APHIS USDA.xlsx')
    
    console.log('🔍 CESO Database Analysis:', cesoAnalysis)
    console.log('🔍 APHIS Database Analysis:', aphisAnalysis)
    
    const comparison = DatabaseAnalyzer.compareStructures(cesoAnalysis, aphisAnalysis)
    console.log('📊 Structure Comparison:', comparison)
    
    const cesoModel = DatabaseAnalyzer.generateDataModel(cesoAnalysis)
    const aphisModel = DatabaseAnalyzer.generateDataModel(aphisAnalysis)
    
    console.log('🏗️ CESO Data Model:', cesoModel)
    console.log('🏗️ APHIS Data Model:', aphisModel)
    
    return {
      cesoAnalysis,
      aphisAnalysis,
      comparison,
      cesoModel,
      aphisModel
    }
  } catch (error) {
    console.error('Error in database analysis:', error)
    throw error
  }
}