const admin = require('firebase-admin');

// Load environment variables from .env file
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL
  })
});

const db = admin.firestore();

async function checkTestData() {
  try {
    const snapshot = await db.collection('acuerdos-ceso').get();
    console.log('Found', snapshot.size, 'documents in acuerdos-ceso');

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Doc ID:', doc.id);
      console.log('Status:', data.status || data.Estado || 'No status field');
      console.log('Description:', (data.description || data.descripcion || '').substring(0, 50));
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkTestData();