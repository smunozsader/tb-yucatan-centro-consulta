// Script optimizado para cargar acuerdos desde Excel a Firestore
const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');

// Configuración de Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
  'C:\\Users\\' + process.env.USERNAME + '\\FirebaseKeys\\ceso-aphis-yuc-service-account.json';

let adminApp;
try {
  const serviceAccount = require(serviceAccountPath);
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'ceso-aphis-yuc'
  });
  console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Función para convertir fecha Excel serial a JavaScript Date
function parseExcelDate(serial) {
  if (!serial || serial === '') return null;
  if (typeof serial === 'string') {
    // Si ya es una fecha en formato texto, intenta parsearla
    const date = new Date(serial);
    return isNaN(date.getTime()) ? null : date;
  }
  // Conversión de número serial Excel a fecha
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info;
}

// Función para normalizar estado
function normalizeStatus(status) {
  if (!status) return 'Pendiente';
  const statusLower = status.toString().toLowerCase().trim();
  if (statusLower.includes('complet') || statusLower.includes('cumpl')) return 'Completado';
  if (statusLower.includes('venc') || statusLower.includes('expi')) return 'Vencidos';
  return 'Pendiente';
}

// Función para detectar fuente por número de acuerdo
function detectSource(agreementNumber) {
  if (!agreementNumber) return 'UNKNOWN';
  const numStr = agreementNumber.toString().toUpperCase();
  // Agrega aquí los patrones específicos que uses para identificar CESO vs APHIS
  if (numStr.includes('CESO') || numStr.includes('CE-')) return 'CESO';
  if (numStr.includes('APHIS') || numStr.includes('AP-') || numStr.includes('USDA')) return 'APHIS-USDA';
  return 'UNKNOWN';
}

// Función principal para cargar acuerdos desde Excel
async function uploadAgreementsFromExcel(filePath, collectionName, source) {
  console.log(`\n📊 Cargando ${source} desde: ${filePath}`);
  
  try {
    // Leer archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Primera hoja
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Encontrados ${jsonData.length} registros en ${sheetName}`);
    
    let uploadCount = 0;
    let errorCount = 0;
    
    for (const row of jsonData) {
      try {
        // Crear documento normalizado
        const agreementDoc = {
          // Campos principales
          agreementNumber: row['Número de Acuerdo'] || row['Numero de Acuerdo'] || row['Agreement Number'] || '',
          description: row['Descripción del Acuerdo'] || row['Descripcion del Acuerdo'] || row['Description'] || '',
          responsible: row['Responsable del Seguimiento'] || row['Responsable'] || row['Responsible'] || '',
          sessionType: row['Tipo de Sesión'] || row['Tipo de Sesion'] || row['Session Type'] || '',
          
          // Fechas
          meetingDate: parseExcelDate(row['Fecha de Reunión'] || row['Fecha de Reunion'] || row['Meeting Date']),
          complianceDate: parseExcelDate(row['Fecha de Cumplimiento'] || row['Compliance Date']),
          
          // Estado
          status: normalizeStatus(row['Estado'] || row['Status']),
          
          // Metadatos
          source: source,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          
          // Datos originales para referencia
          originalData: row
        };
        
        // Generar ID del documento
        let docId = agreementDoc.agreementNumber || 
                   agreementDoc.description?.substring(0, 50) || 
                   `${source.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        
        // Limpiar ID (remover caracteres especiales)
        docId = docId.replace(/[^a-zA-Z0-9\-_]/g, '-').substring(0, 100);
        
        // Subir a Firestore
        await db.collection(collectionName).doc(docId).set(agreementDoc);
        
        uploadCount++;
        console.log(`✅ [${uploadCount}] ${source}: ${agreementDoc.agreementNumber || docId}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error procesando registro:`, error.message);
      }
    }
    
    console.log(`\n📈 Resumen ${source}:`);
    console.log(`   ✅ Subidos exitosamente: ${uploadCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📊 Total procesados: ${jsonData.length}`);
    
  } catch (error) {
    console.error(`❌ Error cargando ${source}:`, error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando carga de acuerdos desde Excel a Firestore...\n');
  
  // Define aquí las rutas de tus nuevos archivos Excel
  const basePath = path.join(__dirname, 'BASES DATOS');
  
  // Archivos Excel actualizados (10 de octubre 2025)
  const cesoFile = path.join(basePath, '2025_OCT_10_base_datos_CESO.xlsx');
  const aphisFile = path.join(basePath, '2025_OCT_10_base_datos_APHIS_USDA.xlsx');
  
  try {
    // Cargar CESO
    console.log('1️⃣ Cargando acuerdos CESO...');
    await uploadAgreementsFromExcel(cesoFile, 'acuerdos-ceso', 'CESO');
    
    // Cargar APHIS
    console.log('\n2️⃣ Cargando acuerdos APHIS-USDA...');
    await uploadAgreementsFromExcel(aphisFile, 'acuerdos-aphis', 'APHIS-USDA');
    
    console.log('\n🎉 ¡Carga completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
  
  process.exit(0);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { uploadAgreementsFromExcel, parseExcelDate, normalizeStatus };