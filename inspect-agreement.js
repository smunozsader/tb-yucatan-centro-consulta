/**
 * Script para inspeccionar la estructura de un acuerdo de prueba
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Inicializar Firebase Admin
let app;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && require('fs').existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else {
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
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function inspeccionarAcuerdo() {
  console.log('🔍 INSPECCIÓN DE ESTRUCTURA DE ACUERDO\n');
  
  try {
    // Inspeccionar un acuerdo CESO
    const cesoDoc = await db.collection('acuerdos-ceso').doc('CE-YUC-091025-001').get();
    if (cesoDoc.exists) {
      console.log('📋 ACUERDO CESO CE-YUC-091025-001:');
      console.log(JSON.stringify(cesoDoc.data(), null, 2));
    }
    
    // Inspeccionar un acuerdo APHIS
    const aphisDoc = await db.collection('acuerdos-aphis').doc('01-XX-091025').get();
    if (aphisDoc.exists) {
      console.log('\n📋 ACUERDO APHIS 01-XX-091025:');
      console.log(JSON.stringify(aphisDoc.data(), null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error durante inspección:', error);
  } finally {
    process.exit(0);
  }
}

inspeccionarAcuerdo().catch(console.error);