// Script to update agreement statuses for testing evidence modal
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ceso-aphis-yuc'
});

const db = admin.firestore();

async function updateAgreementStatuses() {
  console.log('🔄 Setting up agreements for evidence modal testing...\n');

  try {
    // Update CESO agreements - set to "Pendiente" so they can be changed to "Completado"
    const cesoCollection = db.collection('acuerdos-ceso');
    const cesoSnapshot = await cesoCollection.get();

    console.log(`📊 Found ${cesoSnapshot.size} CESO agreements`);

    let cesoUpdated = 0;
    for (const doc of cesoSnapshot.docs) {
      const data = doc.data();

      // Update first agreement to "Pendiente" to test status change to "Completado"
      if (cesoUpdated === 0 && data.agreementNumber === 'CE-YUC-091025-001') {
        await doc.ref.update({
          status: 'Pendiente',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Set CESO agreement: ${data.agreementNumber} → Pendiente (ready for completion)`);
        cesoUpdated++;
      }
    }

    // Update APHIS agreements - set to "Pendiente" so they can be changed to "Completado"
    const aphisCollection = db.collection('acuerdos-aphis');
    const aphisSnapshot = await aphisCollection.get();

    console.log(`📊 Found ${aphisSnapshot.size} APHIS agreements`);

    let aphisUpdated = 0;
    for (const doc of aphisSnapshot.docs) {
      const data = doc.data();

      // Update first agreement to "Pendiente" to test status change to "Completado"
      if (aphisUpdated === 0 && data.agreementNumber === '01-XX-091025') {
        await doc.ref.update({
          status: 'Pendiente',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Set APHIS agreement: ${data.agreementNumber} → Pendiente (ready for completion)`);
        aphisUpdated++;
      }
    }

    console.log('\n🎉 Status setup completed!');
    console.log(`   - CESO agreements prepared: ${cesoUpdated}`);
    console.log(`   - APHIS agreements prepared: ${aphisUpdated}`);
    console.log('\n📋 Test the evidence modal:');
    console.log('   1. Go to https://tb-yucatan.web.app/');
    console.log('   2. Find agreements: CE-YUC-091025-001 and 01-XX-091025');
    console.log('   3. Click the "Cumplir" (Complete) button to change status to "Completado"');
    console.log('   4. The evidence modal should appear automatically!');
    console.log('   5. Upload evidence to complete the status change');

  } catch (error) {
    console.error('❌ Error updating statuses:', error);
  }
}

updateAgreementStatuses().catch(console.error);