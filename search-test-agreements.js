/**
 * Script para buscar acuerdos específicos de prueba
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

async function buscarAcuerdosPrueba() {
  console.log('🔍 BUSCANDO ACUERDOS DE PRUEBA\n');
  
  try {
    // Buscar acuerdos CESO específicos
    const acuerdosCESOPrueba = [
      'CE-YUC-091025-001',
      'CE-YUC-091025-002', 
      'CE-YUC-091025-003'
    ];
    
    console.log('📋 Buscando acuerdos CESO de prueba...');
    for (const numeroAcuerdo of acuerdosCESOPrueba) {
      const doc = await db.collection('acuerdos-ceso').doc(numeroAcuerdo).get();
      if (doc.exists) {
        const data = doc.data();
        console.log(`   ✅ ${numeroAcuerdo}: ${data.descripcionAcuerdo?.substring(0, 60)}...`);
      } else {
        console.log(`   ❌ ${numeroAcuerdo}: No encontrado`);
      }
    }
    
    // Buscar acuerdos APHIS específicos
    const acuerdosAPHISPrueba = [
      '01-XX-091025',
      '02-XX-091025',
      '03-XX-091025'
    ];
    
    console.log('\n📋 Buscando acuerdos APHIS de prueba...');
    for (const numeroAcuerdo of acuerdosAPHISPrueba) {
      const doc = await db.collection('acuerdos-aphis').doc(numeroAcuerdo).get();
      if (doc.exists) {
        const data = doc.data();
        console.log(`   ✅ ${numeroAcuerdo}: ${data.descripcionAcuerdo?.substring(0, 60)}...`);
      } else {
        console.log(`   ❌ ${numeroAcuerdo}: No encontrado`);
      }
    }
    
    // Buscar por fecha de creación reciente (últimos 10 minutos)
    console.log('\n📅 Buscando acuerdos creados recientemente...');
    const hace10Min = new Date(Date.now() - 10 * 60 * 1000);
    
    const cesoRecientes = await db.collection('acuerdos-ceso')
      .where('fechaCreacion', '>=', admin.firestore.Timestamp.fromDate(hace10Min))
      .orderBy('fechaCreacion', 'desc')
      .limit(10)
      .get();
      
    console.log(`   📄 CESO recientes: ${cesoRecientes.size}`);
    cesoRecientes.forEach(doc => {
      const data = doc.data();
      console.log(`      ${doc.id}: ${data.descripcionAcuerdo?.substring(0, 50)}...`);
    });
    
    const aphisRecientes = await db.collection('acuerdos-aphis')
      .where('fechaCreacion', '>=', admin.firestore.Timestamp.fromDate(hace10Min))
      .orderBy('fechaCreacion', 'desc')
      .limit(10)
      .get();
      
    console.log(`   📄 APHIS recientes: ${aphisRecientes.size}`);
    aphisRecientes.forEach(doc => {
      const data = doc.data();
      console.log(`      ${doc.id}: ${data.descripcionAcuerdo?.substring(0, 50)}...`);
    });
    
    console.log('\n✅ Búsqueda completada');
    
  } catch (error) {
    console.error('❌ Error durante búsqueda:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar búsqueda
buscarAcuerdosPrueba().catch(console.error);