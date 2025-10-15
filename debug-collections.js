// Debug script to check Firestore collections
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
  'C:\\Users\\Usuario\\FirebaseKeys\\ceso-aphis-yuc-firebase-adminsdk-rj24i-95bb8eac4b.json';

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'ceso-aphis-yuc'
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function debugCollections() {
  console.log('🔍 DEBUGGING FIRESTORE COLLECTIONS\n');
  
  // Check both possible collection names
  const collectionsToCheck = [
    'acuerdos-ceso',
    'acuerdos-aphis', 
    'acuerdos_ceso',    // underscore version
    'acuerdos_aphis'    // underscore version
  ];
  
  for (const collectionName of collectionsToCheck) {
    try {
      console.log(`📊 Checking collection: ${collectionName}`);
      const snapshot = await db.collection(collectionName).limit(5).get();
      console.log(`   📦 Documents found: ${snapshot.size}`);
      
      if (snapshot.size > 0) {
        console.log('   📋 Sample documents:');
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`     - ID: ${doc.id}`);
          console.log(`     - Status: ${data.status || data.Estado || 'No status'}`);
          console.log(`     - Number: ${data.agreementNumber || data.numero || data.Numero || 'No number'}`);
          console.log(`     - Fields: ${Object.keys(data).join(', ')}`);
          console.log('     ---');
        });
      }
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error accessing ${collectionName}:`, error.message);
    }
  }
  
  // Also check for any collections that might exist
  try {
    console.log('🗂️ LISTING ALL COLLECTIONS');
    const collections = await db.listCollections();
    console.log('📂 Available collections:');
    collections.forEach(collection => {
      console.log(`   - ${collection.id}`);
    });
  } catch (error) {
    console.error('❌ Error listing collections:', error.message);
  }
  
  process.exit(0);
}

debugCollections().catch(console.error);