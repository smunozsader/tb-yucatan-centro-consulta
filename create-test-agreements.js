// Script to create TEST agreements for evidence modal workflow testing
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ceso-aphis-yuc'
});

const db = admin.firestore();

async function createTestAgreements() {
  console.log('🧪 Creating TEST agreements for evidence modal workflow...\n');

  try {
    const testAgreements = [
      // CESO Test Agreements
      {
        agreementNumber: 'TEST-CE-YUC-001',
        description: '[TEST] Sistema de trazabilidad mejorado - PRUEBA EVIDENCIA MODAL',
        responsible: 'MVZ. María del Refugio Medina Juárez',
        meetingDate: new Date('2025-10-15'),
        complianceDate: new Date('2025-10-20'), // Future date = Pendiente
        status: 'Pendiente',
        sessionType: 'Ordinaria',
        source: 'CESO'
      },
      {
        agreementNumber: 'TEST-CE-YUC-002',
        description: '[TEST] Capacitación sobre protocolos sanitarios - PRUEBA VENCIDO',
        responsible: 'Ing. Juan Carlos Rodríguez Andrade',
        meetingDate: new Date('2025-09-15'),
        complianceDate: new Date('2025-10-10'), // Past date = Vencido
        status: 'Vencido',
        sessionType: 'Extraordinaria',
        source: 'CESO'
      },
      // APHIS Test Agreements
      {
        agreementNumber: 'TEST-01-XX-001',
        description: '[TEST] Revisar protocolos de certificación bovina - PRUEBA EVIDENCIA',
        responsible: 'M.Sc. Gerardo Solís Pasos',
        meetingDate: new Date('2025-10-15'),
        complianceDate: new Date('2025-10-25'), // Future date = Pendiente
        status: 'Pendiente',
        sessionType: 'Vigésima Ordinaria',
        source: 'APHIS-USDA'
      },
      {
        agreementNumber: 'TEST-02-XX-002',
        description: '[TEST] Actualizar procedimientos de muestreo - PRUEBA VENCIDO',
        responsible: 'Dr. Víctor Manuel Calderón Jiménez',
        meetingDate: new Date('2025-09-15'),
        complianceDate: new Date('2025-10-08'), // Past date = Vencido
        status: 'Vencido',
        sessionType: 'Vigésima Ordinaria',
        source: 'APHIS-USDA'
      }
    ];

    let created = 0;
    let skipped = 0;

    for (const agreement of testAgreements) {
      const collectionName = agreement.source === 'CESO' ? 'acuerdos-ceso' : 'acuerdos-aphis';
      const docId = agreement.agreementNumber.replace(/[^a-zA-Z0-9\-_]/g, '-');

      // Check if already exists
      const existingDoc = await db.collection(collectionName).doc(docId).get();
      if (existingDoc.exists) {
        console.log(`⚠️ Skipped (already exists): ${agreement.agreementNumber}`);
        skipped++;
        continue;
      }

      // Create the agreement
      const agreementDoc = {
        ...agreement,
        id: docId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        batchUpload: false,
        testAgreement: true // Mark as test data
      };

      await db.collection(collectionName).doc(docId).set(agreementDoc);
      console.log(`✅ Created TEST agreement: ${agreement.agreementNumber} (${agreement.status})`);
      created++;
    }

    console.log('\n🎉 TEST agreements creation completed!');
    console.log(`   - Created: ${created}`);
    console.log(`   - Skipped (existing): ${skipped}`);
    console.log('\n📋 TEST Agreements Ready:');
    console.log('   🔵 PENDIENTE (ready for completion):');
    console.log('      - TEST-CE-YUC-001 (CESO)');
    console.log('      - TEST-01-XX-001 (APHIS)');
    console.log('   🔴 VENCIDO (overdue, ready for completion):');
    console.log('      - TEST-CE-YUC-002 (CESO)');
    console.log('      - TEST-02-XX-002 (APHIS)');
    console.log('\n🧪 Testing Workflow:');
    console.log('   1. Go to https://tb-yucatan.web.app/');
    console.log('   2. Search for agreements starting with "TEST-"');
    console.log('   3. Login as RESPONSIBLE or ADMINISTRATOR');
    console.log('   4. Click "Cumplir" button on Pendiente/Vencido agreements');
    console.log('   5. Change status to "Completado" → Evidence modal should appear!');
    console.log('   6. Upload evidence to complete the workflow');

  } catch (error) {
    console.error('❌ Error creating test agreements:', error);
  }
}

createTestAgreements().catch(console.error);