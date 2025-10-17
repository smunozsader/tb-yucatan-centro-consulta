// Script para carga en lote de acuerdos desde CSV
require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Configuración Firebase Admin
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ceso-aphis-yuc'
});

const db = admin.firestore();

// Función para validar y parsear fecha
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Si viene en formato ISO (YYYY-MM-DD)
  if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Si viene como número (Excel serial)
  if (typeof dateStr === 'number') {
    const utc_days = Math.floor(dateStr - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
  }
  
  return null;
}

// Función para determinar estado automáticamente basado en fechas
function determineStatusAutomatically(complianceDate, providedStatus) {
  // Si se proporciona un estado explícito, usarlo
  if (providedStatus && providedStatus.trim()) {
    return normalizeStatus(providedStatus);
  }
  
  // Si no hay fecha de cumplimiento, asumir Pendiente
  if (!complianceDate) {
    return 'Pendiente';
  }
  
  // Determinar estado basado en fecha de cumplimiento
  const now = new Date();
  if (complianceDate < now) {
    return 'Vencidos'; // Fecha de cumplimiento ya pasó
  } else {
    return 'Pendiente'; // Fecha de cumplimiento está en el futuro
  }
}

// Función para validar número de acuerdo
function validateAgreementNumber(number, type) {
  if (!number) return false;
  
  if (type.toLowerCase() === 'ceso') {
    // Formato CESO: CE-YUC-DDMMYY-NNN o variantes
    return /^(CE-YUC-|YUC\/|\d{2}\/\d{2}-).+/i.test(number) || number === 'Sin Acuerdos';
  } else if (type.toLowerCase() === 'aphis') {
    // Formato APHIS: NN-SESION-DDMMYY
    return /^\d{2}-[IVX]+-\d{6}/.test(number) || /^\d{2}-[IVX]+-\d{6}/.test(number);
  }
  
  return true; // Aceptar otros formatos
}

// Función para verificar duplicados
async function checkDuplicateAgreement(agreementNumber, collectionName) {
  try {
    const snapshot = await db.collection(collectionName)
      .where('agreementNumber', '==', agreementNumber)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error verificando duplicado:', error.message);
    return false;
  }
}

// Función principal de carga en lote
async function batchUploadAgreements(csvFilePath, organizationType) {
  console.log('🚀 CARGA EN LOTE DE ACUERDOS\n');
  console.log(`📁 Archivo: ${csvFilePath}`);
  console.log(`🏢 Organización: ${organizationType.toUpperCase()}`);
  console.log(`📅 Fecha: ${new Date().toLocaleString()}\n`);
  
  // Determinar colección destino
  const collectionName = organizationType.toLowerCase() === 'ceso' ? 'acuerdos-ceso' : 'acuerdos-aphis';
  const source = organizationType.toLowerCase() === 'ceso' ? 'CESO' : 'APHIS-USDA';
  
  try {
    // Leer archivo CSV
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`Archivo no encontrado: ${csvFilePath}`);
    }
    
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`📊 Registros encontrados en CSV: ${records.length}\n`);
    
    // Crear backup del estado actual
    const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'BACKUPS');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    let uploadCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors = [];
    
    console.log('🔍 Validando y procesando acuerdos...\n');
    
    for (const [index, row] of records.entries()) {
      const rowNumber = index + 2; // +2 porque Excel empieza en 1 y hay header
      
      try {
        // Extraer datos del CSV
        const agreementNumber = row['Numero_de_Acuerdo'] || row['Número de Acuerdo'] || '';
        const description = row['Descripcion_del_Acuerdo'] || row['Descripción del Acuerdo'] || '';
        const responsible = row['Responsable_del_Seguimiento'] || '';
        const meetingDateStr = row['Fecha_de_Reunion'] || row['Fecha_de_Reunión'] || '';
        const complianceDateStr = row['Fecha_de_Cumplimiento'] || '';
        const status = row['Estado'] || '';
        const sessionType = row['Tipo_de_Sesion'] || row['Tipo_de_Sesión'] || '';
        
        // Validaciones
        if (!agreementNumber.trim()) {
          throw new Error('Número de acuerdo requerido');
        }
        
        if (!description.trim()) {
          throw new Error('Descripción del acuerdo requerida');
        }
        
        if (!validateAgreementNumber(agreementNumber, organizationType)) {
          throw new Error(`Formato de número de acuerdo inválido para ${organizationType}: ${agreementNumber}`);
        }
        
        // Verificar duplicados
        const isDuplicate = await checkDuplicateAgreement(agreementNumber, collectionName);
        if (isDuplicate) {
          duplicateCount++;
          console.log(`⚠️ [Fila ${rowNumber}] DUPLICADO: ${agreementNumber}`);
          continue;
        }
        
        // Parsear fechas
        const meetingDate = parseDate(meetingDateStr);
        const complianceDate = parseDate(complianceDateStr);
        
        if (!meetingDate) {
          throw new Error(`Fecha de reunión inválida: ${meetingDateStr}`);
        }
        
        // Crear documento del acuerdo
        const agreementDoc = {
          agreementNumber: agreementNumber.trim(),
          description: description.trim(),
          responsible: responsible.trim(),
          sessionType: sessionType.trim(),
          
          meetingDate: meetingDate,
          complianceDate: complianceDate,
          
          status: determineStatusAutomatically(complianceDate, status),
          
          source: source,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          
          // Metadatos de carga en lote
          batchUpload: true,
          batchTimestamp: new Date().toISOString(),
          batchFile: path.basename(csvFilePath),
          
          originalData: row
        };
        
        // Generar ID del documento
        let docId = agreementNumber.replace(/[^a-zA-Z0-9\-_]/g, '-').substring(0, 100);
        
        // Subir a Firestore
        await db.collection(collectionName).doc(docId).set(agreementDoc);
        
        uploadCount++;
        console.log(`✅ [${uploadCount}] ${agreementNumber} - ${description.substring(0, 50)}...`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = `Fila ${rowNumber}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ [Fila ${rowNumber}] ${error.message}`);
      }
    }
    
    // Resumen final
    console.log(`\n📊 RESUMEN DE CARGA EN LOTE:`);
    console.log(`   ✅ Acuerdos cargados: ${uploadCount}`);
    console.log(`   ⚠️ Duplicados omitidos: ${duplicateCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📋 Total procesados: ${records.length}`);
    console.log(`   🏢 Colección: ${collectionName}`);
    
    // Guardar log de errores si los hay
    if (errors.length > 0) {
      const errorLogPath = path.join(backupDir, `errors_${backupTimestamp}.txt`);
      fs.writeFileSync(errorLogPath, errors.join('\n'));
      console.log(`\n📝 Log de errores guardado: ${errorLogPath}`);
    }
    
    // Generar estadísticas
    if (uploadCount > 0) {
      console.log(`\n📈 ESTADÍSTICAS:`);
      console.log(`   - Tasa de éxito: ${((uploadCount / records.length) * 100).toFixed(1)}%`);
      console.log(`   - Fuente: ${source}`);
      console.log(`   - Timestamp: ${new Date().toISOString()}`);
    }
    
    console.log(`\n🎉 Carga en lote completada para ${organizationType.toUpperCase()}`);
    
  } catch (error) {
    console.error(`❌ Error en carga en lote:`, error.message);
    process.exit(1);
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log(`
🚀 SISTEMA DE CARGA EN LOTE DE ACUERDOS

Uso:
  node batch-upload-agreements.js --file <ruta_csv> --type <ceso|aphis>

Ejemplos:
  node batch-upload-agreements.js --file TEMPLATES/ceso_sesion_091025.csv --type ceso
  node batch-upload-agreements.js --file TEMPLATES/aphis_sesion_091025.csv --type aphis

Parámetros:
  --file    Ruta al archivo CSV con los acuerdos
  --type    Tipo de organización: 'ceso' o 'aphis'
  --help    Mostrar esta ayuda

Templates disponibles:
  - TEMPLATES/template_acuerdos_ceso.csv
  - TEMPLATES/template_acuerdos_aphis.csv

Para más información consultar: TEMPLATES/README_CARGA_LOTE.md
`);
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const fileIndex = args.indexOf('--file');
const typeIndex = args.indexOf('--type');

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (fileIndex === -1 || typeIndex === -1) {
  console.error('❌ Error: Parámetros --file y --type son requeridos');
  showHelp();
  process.exit(1);
}

const csvFile = args[fileIndex + 1];
const orgType = args[typeIndex + 1];

if (!csvFile || !orgType) {
  console.error('❌ Error: Valores para --file y --type son requeridos');
  process.exit(1);
}

if (!['ceso', 'aphis'].includes(orgType.toLowerCase())) {
  console.error('❌ Error: --type debe ser "ceso" o "aphis"');
  process.exit(1);
}

// Ejecutar carga en lote
batchUploadAgreements(csvFile, orgType)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  });