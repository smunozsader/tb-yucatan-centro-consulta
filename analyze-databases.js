// Node.js script to analyze Excel databases
// Run with: node analyze-databases.js

const XLSX = require('xlsx');
const path = require('path');

function analyzeExcelFile(filePath) {
  try {
    console.log(`\n📊 Analyzing: ${path.basename(filePath)}`);
    console.log('='.repeat(50));
    
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log(`📑 Sheets found: ${sheetNames.length}`);
    
    sheetNames.forEach((sheetName, index) => {
      console.log(`\n📋 Sheet ${index + 1}: "${sheetName}"`);
      console.log('-'.repeat(30));
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const headers = jsonData[0];
        console.log(`📝 Columns (${headers.length}):`, headers);
        console.log(`📊 Data rows: ${jsonData.length - 1}`);
        
        // Show sample data
        if (jsonData.length > 1) {
          console.log(`\n🔍 Sample data (first 2 rows):`);
          for (let i = 1; i <= Math.min(3, jsonData.length - 1); i++) {
            console.log(`Row ${i}:`, jsonData[i]);
          }
        }
      } else {
        console.log('❌ No data found in this sheet');
      }
    });
    
    return {
      fileName: path.basename(filePath),
      sheets: sheetNames.map(name => ({
        name,
        data: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 })
      }))
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

function compareStructures(analysis1, analysis2) {
  console.log(`\n🔄 Comparing structures:`);
  console.log(`📁 ${analysis1.fileName} vs ${analysis2.fileName}`);
  console.log('='.repeat(50));
  
  const differences = [];
  
  // Compare sheet names
  const sheets1 = analysis1.sheets.map(s => s.name).sort();
  const sheets2 = analysis2.sheets.map(s => s.name).sort();
  
  console.log(`📑 Sheets in ${analysis1.fileName}:`, sheets1);
  console.log(`📑 Sheets in ${analysis2.fileName}:`, sheets2);
  
  if (JSON.stringify(sheets1) !== JSON.stringify(sheets2)) {
    console.log('❌ Sheet names do not match!');
    differences.push('Sheet names differ');
  } else {
    console.log('✅ Sheet names match!');
  }
  
  // Compare columns for matching sheets
  analysis1.sheets.forEach(sheet1 => {
    const sheet2 = analysis2.sheets.find(s => s.name === sheet1.name);
    
    if (!sheet2) {
      console.log(`❌ Sheet "${sheet1.name}" not found in ${analysis2.fileName}`);
      return;
    }
    
    const headers1 = sheet1.data[0] || [];
    const headers2 = sheet2.data[0] || [];
    
    console.log(`\n📋 Comparing sheet "${sheet1.name}":`);
    console.log(`Columns in ${analysis1.fileName}:`, headers1);
    console.log(`Columns in ${analysis2.fileName}:`, headers2);
    
    if (JSON.stringify(headers1.sort()) !== JSON.stringify(headers2.sort())) {
      console.log(`❌ Column structure differs in sheet "${sheet1.name}"`);
      differences.push(`Column mismatch in sheet: ${sheet1.name}`);
    } else {
      console.log(`✅ Column structure matches in sheet "${sheet1.name}"`);
    }
  });
  
  return differences;
}

// Main execution
async function main() {
  console.log('🚀 Database Structure Analysis');
  console.log('Centro de Consulta de Acuerdos Sanitarios');
  console.log('='.repeat(60));
  
  const cesoPath = './BASES DATOS/base datos CESO.xlsx';
  const aphisPath = './BASES DATOS/base datos APHIS USDA.xlsx';
  
  const cesoAnalysis = analyzeExcelFile(cesoPath);
  const aphisAnalysis = analyzeExcelFile(aphisPath);
  
  if (cesoAnalysis && aphisAnalysis) {
    const differences = compareStructures(cesoAnalysis, aphisAnalysis);
    
    console.log('\n📋 SUMMARY:');
    console.log('='.repeat(30));
    
    if (differences.length === 0) {
      console.log('✅ Both databases have the SAME structure!');
      console.log('🎯 Ready to create unified data models');
    } else {
      console.log('❌ Databases have DIFFERENT structures:');
      differences.forEach(diff => console.log(`   • ${diff}`));
      console.log('🔧 Will need to handle structure differences in code');
    }
    
    // Generate data model suggestion
    console.log('\n🏗️ SUGGESTED DATA MODEL:');
    console.log('='.repeat(30));
    
    if (cesoAnalysis.sheets.length > 0 && cesoAnalysis.sheets[0].data.length > 0) {
      const headers = cesoAnalysis.sheets[0].data[0];
      console.log('Based on CESO structure:');
      headers.forEach((header, index) => {
        console.log(`  ${index + 1}. ${header} (${typeof header})`);
      });
    }
  }
}

// Run the analysis
main().catch(console.error);