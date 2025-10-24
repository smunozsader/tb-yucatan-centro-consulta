// Script optimizado para usuarios con membresías múltiples
require('dotenv').config();
const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');

// Configuración Firebase Admin
console.log('🔧 Inicializando Firebase Admin...');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountPath) {
  console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_KEY no está configurado en .env');
  process.exit(1);
}

let adminApp;
try {
  const serviceAccount = require(serviceAccountPath);
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'ceso-aphis-yuc'
  });
  console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin:', error.message);
  console.error('🔍 Verificar ruta del service account:', serviceAccountPath);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// Utilidades para fechas Excel
function parseExcelDate(serial) {
  if (!serial || serial === '') return null;
  if (typeof serial === 'string') {
    const date = new Date(serial);
    return isNaN(date.getTime()) ? null : date;
  }
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

function normalizeStatus(status) {
  if (!status) return 'Pendiente';
  const statusLower = status.toString().toLowerCase().trim();
  if (statusLower.includes('complet') || statusLower.includes('cumpl') || statusLower.includes('perman')) return 'Completado';
  if (statusLower.includes('venc') || statusLower.includes('expi')) return 'Vencidos';
  return 'Pendiente';
}

// Función para cargar usuarios consolidados
async function uploadConsolidatedUsers(filePath) {
  console.log(`\n👥 Cargando usuarios consolidados desde: ${path.basename(filePath)}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Encontrados ${jsonData.length} usuarios únicos en ${sheetName}`);
    
    let createdCount = 0;
    let errorCount = 0;
    let existingCount = 0;
    
    for (const row of jsonData) {
      try {
        // Extraer datos del usuario
        const email = row['correo'] || row['Email'] || row['email'] || '';
        const nombre = row['nombre'] || row['Nombre'] || row['Name'] || '';
        const rol = row['rol'] || row['Rol'] || row['Role'] || 'RESPONSIBLE';
        const password = row['contrasena'] || row['contraseña'] || row['password'] || 'TempPass123!';
        
        // Procesar membresías múltiples
        const organizationsStr = row['organizations'] || row['Organizations'] || '';
        const organizations = organizationsStr.split(',').map(org => org.trim()).filter(org => org);
        
        if (!email) {
          console.log(`⚠️ Usuario sin email, saltando: ${nombre}`);
          continue;
        }
        
        // Verificar si el usuario ya existe
        try {
          const existingUser = await auth.getUserByEmail(email);
          console.log(`👤 Usuario ya existe: ${email}`);
          existingCount++;
          continue;
        } catch (error) {
          // Usuario no existe, podemos crearlo
        }
        
        // Crear usuario en Firebase Auth
        const userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: nombre.trim(),
          emailVerified: false
        });
        
        // Asignar custom claims para membresías múltiples
        const customClaims = {
          role: rol.toUpperCase(),
          organizations: organizations, // Array de organizaciones
          isCESO: organizations.includes('CESO'),
          isAPHIS: organizations.includes('APHIS'),
          createdAt: new Date().toISOString()
        };
        
        await auth.setCustomUserClaims(userRecord.uid, customClaims);
        
        // Crear documento del usuario en Firestore
        await db.collection('users').doc(userRecord.uid).set({
          email: email,
          nombre: nombre,
          displayName: nombre.trim(),
          role: rol.toUpperCase(),
          organizations: organizations,
          organizationsString: organizationsStr,
          isCESO: organizations.includes('CESO'),
          isAPHIS: organizations.includes('APHIS'),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          active: true,
          originalData: row
        });
        
        createdCount++;
        console.log(`✅ [${createdCount}] Usuario creado: ${email} (${rol}) - Orgs: [${organizationsStr}]`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error creando usuario:`, error.message);
      }
    }
    
    console.log(`\n📊 Resumen usuarios consolidados:`);
    console.log(`   ✅ Creados: ${createdCount}`);
    console.log(`   👤 Ya existían: ${existingCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📋 Total procesados: ${jsonData.length}`);
    
  } catch (error) {
    console.error(`❌ Error cargando usuarios consolidados:`, error.message);
  }
}

// Función para cargar acuerdos (reutilizada)
async function uploadAgreements(filePath, collectionName, source) {
  console.log(`\n📊 Cargando acuerdos ${source} desde: ${path.basename(filePath)}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Encontrados ${jsonData.length} registros en ${sheetName}`);
    
    let uploadCount = 0;
    let errorCount = 0;
    
    for (const row of jsonData) {
      try {
        const agreementDoc = {
          agreementNumber: row['Número de Acuerdo'] || row['Numero de Acuerdo'] || row['Agreement Number'] || '',
          description: row['Descripción del Acuerdo'] || row['Descripcion del Acuerdo'] || row['Description'] || '',
          responsible: row['Responsable del Seguimiento'] || row['Responsable'] || row['Responsible'] || '',
          sessionType: row['Tipo de Sesión'] || row['Tipo de Sesion'] || row['Session Type'] || '',
          
          meetingDate: parseExcelDate(row['Fecha de Reunión'] || row['Fecha de Reunion'] || row['Meeting Date']),
          complianceDate: parseExcelDate(row['Fecha de Cumplimiento'] || row['Compliance Date']),
          
          status: normalizeStatus(row['Estado'] || row['Status']),
          
          source: source,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          
          originalData: row
        };
        
        let docId = agreementDoc.agreementNumber || 
                   agreementDoc.description?.substring(0, 50) || 
                   `${source.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        
        docId = docId.replace(/[^a-zA-Z0-9\-_]/g, '-').substring(0, 100);
        
        await db.collection(collectionName).doc(docId).set(agreementDoc);
        
        uploadCount++;
        console.log(`✅ [${uploadCount}] ${source}: ${agreementDoc.agreementNumber || docId}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error procesando acuerdo:`, error.message);
      }
    }
    
    console.log(`\n📈 Resumen acuerdos ${source}:`);
    console.log(`   ✅ Subidos: ${uploadCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📊 Total: ${jsonData.length}`);
    
  } catch (error) {
    console.error(`❌ Error cargando acuerdos ${source}:`, error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 POBLANDO FIREBASE - USUARIOS CONSOLIDADOS + ACUERDOS\n');
  console.log('📁 Proyecto: ceso-aphis-yuc');
  console.log('📅 Datos: 10 de octubre de 2025');
  console.log('🔄 Usuarios con membresías múltiples\n');
  
  const basePath = path.join(__dirname, 'BASES DATOS');
  
  try {
    // 1. Cargar usuarios consolidados
    console.log('1️⃣ CARGANDO USUARIOS CONSOLIDADOS...');
    const consolidatedUsersFile = path.join(basePath, 'usuarios_consolidados.xlsx');
    await uploadConsolidatedUsers(consolidatedUsersFile);
    
    // 2. Cargar acuerdos CESO
    console.log('\n2️⃣ CARGANDO ACUERDOS CESO...');
    const cesoAgreementsFile = path.join(basePath, '2025_OCT_10_base_datos_CESO.xlsx');
    await uploadAgreements(cesoAgreementsFile, 'acuerdos-ceso', 'CESO');
    
    // 3. Cargar acuerdos APHIS-USDA
    console.log('\n3️⃣ CARGANDO ACUERDOS APHIS-USDA...');
    const aphisAgreementsFile = path.join(basePath, '2025_OCT_10_base_datos_APHIS_USDA.xlsx');
    await uploadAgreements(aphisAgreementsFile, 'acuerdos-aphis', 'APHIS-USDA');
    
    console.log('\n🎉 ¡CARGA COMPLETA EXITOSA!');
    console.log('\n📊 RESUMEN FINAL:');
    console.log('   👥 Usuarios únicos con membresías múltiples');
    console.log('   🔐 Custom claims: role, organizations[], isCESO, isAPHIS');
    console.log('   📋 Acuerdos CESO cargados en colección: acuerdos-ceso');
    console.log('   📋 Acuerdos APHIS cargados en colección: acuerdos-aphis');
    console.log('   💾 Metadatos y membresías guardados en Firestore');
    
    console.log('\n🔑 ESTRUCTURA MEJORADA:');
    console.log('   - Un usuario puede tener acceso a CESO, APHIS, o ambos');
    console.log('   - Claims: organizations: ["CESO", "APHIS"]');
    console.log('   - Claims: isCESO: true/false, isAPHIS: true/false');
    console.log('   - Roles jerarquizados automáticamente');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
  
  process.exit(0);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { uploadConsolidatedUsers, uploadAgreements };