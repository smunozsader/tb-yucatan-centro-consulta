// Script maestro para poblar Firebase Console con datos completos
require('dotenv').config();
const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');

// Configuración Firebase Admin usando variables de entorno
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

// Función para cargar usuarios de Excel a Firebase Auth
async function uploadUsers(filePath, organization) {
  console.log(`\n👥 Cargando usuarios ${organization} desde: ${path.basename(filePath)}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Encontrados ${jsonData.length} usuarios en ${sheetName}`);
    
    let createdCount = 0;
    let errorCount = 0;
    let existingCount = 0;
    
    for (const row of jsonData) {
      try {
        // Extraer datos del usuario
        const email = row['correo'] || row['Email'] || row['email'] || '';
        const nombre = row['nombre'] || row['Nombre'] || row['Name'] || '';
        const apellidos = row['apellidos'] || row['Apellidos'] || row['LastName'] || '';
        const rol = row['rol'] || row['Rol'] || row['Role'] || 'RESPONSIBLE';
        const organizacion = row['organization'] || row['organización'] || row['Organization'] || organization;
        const password = row['contrasena'] || row['contraseña'] || row['password'] || 'TempPass123!';
        
        if (!email) {
          console.log(`⚠️ Usuario sin email, saltando: ${nombre} ${apellidos}`);
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
          password: password, // Usar contraseña del Excel
          displayName: `${nombre}`.trim(),
          emailVerified: false
        });
        
        // Asignar custom claims para roles
        const customClaims = {
          role: rol.toUpperCase(),
          organization: organizacion,
          createdAt: new Date().toISOString()
        };
        
        await auth.setCustomUserClaims(userRecord.uid, customClaims);
        
        // Crear documento del usuario en Firestore
        await db.collection('users').doc(userRecord.uid).set({
          email: email,
          nombre: nombre,
          apellidos: apellidos,
          displayName: `${nombre}`.trim(),
          role: rol.toUpperCase(),
          organization: organizacion,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          active: true,
          originalData: row
        });
        
        createdCount++;
        console.log(`✅ [${createdCount}] Usuario creado: ${email} (${rol})`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error creando usuario:`, error.message);
      }
    }
    
    console.log(`\n📊 Resumen usuarios ${organization}:`);
    console.log(`   ✅ Creados: ${createdCount}`);
    console.log(`   👤 Ya existían: ${existingCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📋 Total procesados: ${jsonData.length}`);
    
  } catch (error) {
    console.error(`❌ Error cargando usuarios ${organization}:`, error.message);
  }
}

// Función para cargar acuerdos (reutilizada del script anterior)
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
  console.log('🚀 POBLANDO FIREBASE CONSOLE - Centro de Consulta de Acuerdos Sanitarios\n');
  console.log('📁 Proyecto: ceso-aphis-yuc');
  console.log('📅 Datos: 10 de octubre de 2025\n');
  
  const basePath = path.join(__dirname, 'BASES DATOS');
  
  try {
    // 1. Cargar usuarios CESO
    console.log('1️⃣ CARGANDO USUARIOS CESO...');
    const cesoUsersFile = path.join(basePath, 'usuarios_ceso_new_web_app_updated.xlsx');
    await uploadUsers(cesoUsersFile, 'CESO');
    
    // 2. Cargar usuarios APHIS-USDA
    console.log('\n2️⃣ CARGANDO USUARIOS APHIS-USDA...');
    const aphisUsersFile = path.join(basePath, 'usuarios_aphis-usda_new_web_app_updated.xlsx');
    await uploadUsers(aphisUsersFile, 'APHIS-USDA');
    
    // 3. Cargar acuerdos CESO
    console.log('\n3️⃣ CARGANDO ACUERDOS CESO...');
    const cesoAgreementsFile = path.join(basePath, '2025_OCT_10_base_datos_CESO.xlsx');
    await uploadAgreements(cesoAgreementsFile, 'acuerdos-ceso', 'CESO');
    
    // 4. Cargar acuerdos APHIS-USDA
    console.log('\n4️⃣ CARGANDO ACUERDOS APHIS-USDA...');
    const aphisAgreementsFile = path.join(basePath, '2025_OCT_10_base_datos_APHIS_USDA.xlsx');
    await uploadAgreements(aphisAgreementsFile, 'acuerdos-aphis', 'APHIS-USDA');
    
    console.log('\n🎉 ¡CARGA COMPLETA EXITOSA!');
    console.log('\n📊 RESUMEN FINAL:');
    console.log('   👥 Usuarios CESO y APHIS-USDA cargados en Firebase Auth');
    console.log('   📋 Acuerdos CESO cargados en colección: acuerdos-ceso');
    console.log('   📋 Acuerdos APHIS cargados en colección: acuerdos-aphis');
    console.log('   🔐 Custom claims asignados por organización');
    console.log('   💾 Metadatos guardados en Firestore');
    
    console.log('\n🔑 SIGUIENTE PASO:');
    console.log('   Los usuarios tienen contraseña temporal: TempPass123!');
    console.log('   Deben cambiarla en el primer inicio de sesión');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
  
  process.exit(0);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { uploadUsers, uploadAgreements };