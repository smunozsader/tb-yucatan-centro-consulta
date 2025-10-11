const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

async function auditFirebaseCollections() {
  try {
    console.log('🔍 FIREBASE PROJECT AUDIT - COMPLETE STATUS CHECK\n');
    console.log('=' .repeat(60));

    // Check all main collections
    const collections = [
      'users_ceso',
      'users_aphis', 
      'acuerdos-ceso',
      'acuerdos-aphis',
      'acuerdos-aphis-usda',
      'acuerdos',
      'evidencias'
    ];

    console.log('📊 COLLECTION STATUS:\n');

    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        const count = await db.collection(collectionName).get();
        
        if (count.size > 0) {
          console.log(`✅ ${collectionName.padEnd(20)} | ${count.size.toString().padStart(4)} documents`);
          
          // Show sample document structure for agreements
          if (collectionName.includes('acuerdos') && count.size > 0) {
            const sampleDoc = count.docs[0].data();
            const keys = Object.keys(sampleDoc);
            console.log(`   📋 Sample fields: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
          }
        } else {
          console.log(`❌ ${collectionName.padEnd(20)} | EMPTY`);
        }
      } catch (error) {
        console.log(`❌ ${collectionName.padEnd(20)} | ERROR: ${error.message}`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 DEPLOYMENT READINESS ANALYSIS:\n');

    // Check users
    const cesoUsers = await db.collection('users_ceso').get();
    const aphisUsers = await db.collection('users_aphis').get();
    
    console.log('👥 USER MANAGEMENT:');
    console.log(`   ✅ CESO Users: ${cesoUsers.size}`);
    console.log(`   ✅ APHIS Users: ${aphisUsers.size}`);
    
    // Check for admin
    let hasAdmin = false;
    [...cesoUsers.docs, ...aphisUsers.docs].forEach(doc => {
      const user = doc.data();
      if (user.rol === 'Administrador') {
        hasAdmin = true;
        console.log(`   👑 Admin found: ${user.nombre} (${user.correo})`);
      }
    });

    // Check agreements
    console.log('\n📄 AGREEMENT DATA:');
    const cesoAgreements = await db.collection('acuerdos-ceso').get();
    const aphisAgreements = await db.collection('acuerdos-aphis').get();
    
    console.log(`   ${cesoAgreements.size > 0 ? '✅' : '❌'} CESO Agreements: ${cesoAgreements.size}`);
    console.log(`   ${aphisAgreements.size > 0 ? '✅' : '❌'} APHIS Agreements: ${aphisAgreements.size}`);

    // Check hosting files
    console.log('\n🌐 HOSTING STATUS:');
    console.log('   ✅ Landing Page: https://ceso-aphis-yuc.web.app');
    console.log('   ✅ CESO Hall: https://ceso-aphis-yuc.web.app/hall-ceso.html');
    console.log('   ✅ APHIS Hall: https://ceso-aphis-yuc.web.app/hall-aphis.html');

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📋 WHAT\'S MISSING FOR COMPLETE DEPLOYMENT:\n');

    if (cesoAgreements.size === 0) {
      console.log('❌ CESO Agreements need to be populated');
      console.log('   📁 Source: BASES DATOS/2025_OCT_10_base_datos_CESO.xlsx');
    }

    if (aphisAgreements.size === 0) {
      console.log('❌ APHIS Agreements need to be populated');
      console.log('   📁 Source: BASES DATOS/2025_OCT_10_base_datos_APHIS_USDA.xlsx');
    }

    // Check for pages that need agreements
    console.log('\n🔗 PAGE DEPENDENCIES:');
    console.log('   📄 acuerdos-ceso.html → requires acuerdos-ceso collection');
    console.log('   📄 acuerdos-aphis.html → requires acuerdos-aphis collection');
    console.log('   📄 repositorio.html → requires both collections');

    console.log('\n🎯 NEXT STEPS TO COMPLETE SUCCESS:');
    console.log('   1. Populate agreement collections from Excel files');
    console.log('   2. Test agreement viewing functionality');
    console.log('   3. Test evidence upload system');
    console.log('   4. Deploy final hosting updates');
    console.log('   5. Test complete user workflows');

  } catch (error) {
    console.error('❌ Error during audit:', error);
  } finally {
    process.exit(0);
  }
}

auditFirebaseCollections();