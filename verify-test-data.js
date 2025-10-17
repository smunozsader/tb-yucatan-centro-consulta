// Script to verify test agreements are in the correct Firebase project
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ceso-aphis-yuc'
});

const db = admin.firestore();

async function verifyTestData() {
  console.log('🔍 Verifying test data in Firebase project: ceso-aphis-yuc\n');

  try {
    // Check CESO test agreements
    const cesoCollection = db.collection('acuerdos-ceso');
    const cesoTestQuery = await cesoCollection.where('testAgreement', '==', true).get();

    console.log(`📊 CESO Test Agreements Found: ${cesoTestQuery.size}`);
    cesoTestQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   ✅ ${data.agreementNumber} - ${data.status} (${data.source})`);
    });

    // Check APHIS test agreements
    const aphisCollection = db.collection('acuerdos-aphis');
    const aphisTestQuery = await aphisCollection.where('testAgreement', '==', true).get();

    console.log(`\n📊 APHIS Test Agreements Found: ${aphisTestQuery.size}`);
    aphisTestQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   ✅ ${data.agreementNumber} - ${data.status} (${data.source})`);
    });

    const totalTest = cesoTestQuery.size + aphisTestQuery.size;
    console.log(`\n🎯 Total TEST agreements in ceso-aphis-yuc project: ${totalTest}`);

    if (totalTest === 4) {
      console.log('✅ SUCCESS: All test data is in the correct Firebase project!');
      console.log('\n🧪 Ready for testing at: https://ceso-aphis-yuc.web.app/');
    } else {
      console.log('⚠️ WARNING: Test data count mismatch. Expected 4, found', totalTest);
    }

  } catch (error) {
    console.error('❌ Error verifying test data:', error);
  }
}

verifyTestData().catch(console.error);