// Script de migración para actualizar custom claims a membresías múltiples
require('dotenv').config();
const admin = require('firebase-admin');
const XLSX = require('xlsx');

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ceso-aphis-yuc'
});

const auth = admin.auth();
const db = admin.firestore();

async function migrateUserClaims() {
  console.log('🔄 MIGRANDO CUSTOM CLAIMS A MEMBRESÍAS MÚLTIPLES\n');
  
  try {
    // Cargar datos consolidados para referencia
    const workbook = XLSX.readFile('./BASES DATOS/usuarios_consolidados.xlsx');
    const usuariosConsolidados = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    // Crear mapa de emails a organizaciones
    const organizacionesPorEmail = new Map();
    usuariosConsolidados.forEach(usuario => {
      const organizations = usuario.organizations.split(',').map(org => org.trim());
      organizacionesPorEmail.set(usuario.correo, {
        organizations: organizations,
        role: usuario.rol
      });
    });
    
    // Obtener todos los usuarios de Firebase Auth
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    console.log(`📊 Procesando ${users.length} usuarios...\n`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        // Saltear usuario de prueba
        if (user.email === 'test.user@example.local') {
          console.log(`⏭️ Saltando usuario de prueba: ${user.email}`);
          continue;
        }
        
        const userData = organizacionesPorEmail.get(user.email);
        if (!userData) {
          console.log(`⚠️ Usuario no encontrado en consolidados: ${user.email}`);
          continue;
        }
        
        // Nuevos custom claims con membresías múltiples
        const newCustomClaims = {
          role: userData.role.toUpperCase(),
          organizations: userData.organizations, // Array
          isCESO: userData.organizations.includes('CESO'),
          isAPHIS: userData.organizations.includes('APHIS'),
          createdAt: new Date().toISOString(),
          migrated: true
        };
        
        // Actualizar custom claims
        await auth.setCustomUserClaims(user.uid, newCustomClaims);
        
        // Actualizar documento en Firestore
        await db.collection('users').doc(user.uid).set({
          email: user.email,
          nombre: user.displayName || '',
          displayName: user.displayName || '',
          role: userData.role.toUpperCase(),
          organizations: userData.organizations,
          organizationsString: userData.organizations.join(','),
          isCESO: userData.organizations.includes('CESO'),
          isAPHIS: userData.organizations.includes('APHIS'),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          active: true,
          migrated: true
        }, { merge: true });
        
        updatedCount++;
        console.log(`✅ [${updatedCount}] Migrado: ${user.email}`);
        console.log(`   Orgs: [${userData.organizations.join(', ')}]`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   isCESO: ${userData.organizations.includes('CESO')}`);
        console.log(`   isAPHIS: ${userData.organizations.includes('APHIS')}`);
        console.log('');
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrando ${user.email}:`, error.message);
      }
    }
    
    console.log(`\n📈 RESUMEN DE MIGRACIÓN:`);
    console.log(`   ✅ Usuarios migrados: ${updatedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📊 Total procesados: ${users.length}`);
    
    console.log(`\n🔑 NUEVA ESTRUCTURA CUSTOM CLAIMS:`);
    console.log(`   - role: "ADMINISTRADOR" | "FEDERAL" | "ESTATAL" | etc.`);
    console.log(`   - organizations: ["CESO", "APHIS"]`);
    console.log(`   - isCESO: true/false`);
    console.log(`   - isAPHIS: true/false`);
    console.log(`   - migrated: true`);
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
  }
  
  process.exit(0);
}

migrateUserClaims();