/**
 * Script de verificación de carga en lote
 * Verifica que los acuerdos de prueba se hayan cargado correctamente
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Inicializar Firebase Admin
let app;
try {
  // Intentar usar archivo de credenciales si existe
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && require('fs').existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else {
    // Usar credenciales de variables de entorno
    const serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID,
      "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
  console.log(`🔥 Firebase inicializado para proyecto: ${process.env.FIREBASE_PROJECT_ID}\n`);
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function verificarCargaEnLote() {
  console.log('🔍 VERIFICACIÓN DE CARGA EN LOTE\n');
  
  try {
    // Verificar acuerdos CESO recientes
    console.log('📋 Verificando acuerdos CESO...');
    const cesoQuery = await db.collection('acuerdos-ceso')
      .where('numeroAcuerdo', '>=', 'CE-YUC-091025-001')
      .where('numeroAcuerdo', '<=', 'CE-YUC-091025-999')
      .get();
    
    console.log(`   ✅ Acuerdos CESO encontrados: ${cesoQuery.size}`);
    cesoQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   📄 ${data.numeroAcuerdo}: ${data.descripcionAcuerdo.substring(0, 50)}...`);
    });
    
    // Verificar acuerdos APHIS recientes
    console.log('\n📋 Verificando acuerdos APHIS...');
    const aphisQuery = await db.collection('acuerdos-aphis')
      .where('numeroAcuerdo', '>=', '01-XX-091025')
      .where('numeroAcuerdo', '<=', '99-XX-091025')
      .get();
    
    console.log(`   ✅ Acuerdos APHIS encontrados: ${aphisQuery.size}`);
    aphisQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   📄 ${data.numeroAcuerdo}: ${data.descripcionAcuerdo.substring(0, 50)}...`);
    });
    
    // Estadísticas generales
    console.log('\n📊 ESTADÍSTICAS GENERALES:');
    
    const totalCeso = await db.collection('acuerdos-ceso').get();
    const totalAphis = await db.collection('acuerdos-aphis').get();
    
    console.log(`   🏢 Total acuerdos CESO: ${totalCeso.size}`);
    console.log(`   🏢 Total acuerdos APHIS: ${totalAphis.size}`);
    console.log(`   📈 Total general: ${totalCeso.size + totalAphis.size}`);
    
    console.log('\n✅ Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar verificación
verificarCargaEnLote().catch(console.error);