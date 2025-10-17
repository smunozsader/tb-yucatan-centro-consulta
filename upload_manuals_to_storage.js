require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key from file path in .env
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});

const bucket = admin.storage().bucket();

async function uploadManual(localPath, storagePath) {
  await bucket.upload(localPath, {
    destination: storagePath,
    public: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
  console.log(`Uploaded ${localPath} to ${storagePath}`);
}

(async () => {
  try {
    await uploadManual(
      path.join(__dirname, 'public', 'manuals', 'MANUAL_USUARIO_CORTO.pdf'),
      'manuals/MANUAL_USUARIO_CORTO.pdf'
    );
    await uploadManual(
      path.join(__dirname, 'public', 'manuals', 'MANUAL_USUARIO_COMPLETO.pdf'),
      'manuals/MANUAL_USUARIO_COMPLETO.pdf'
    );
    console.log('Both manuals uploaded successfully!');
  } catch (err) {
    console.error('Error uploading manuals:', err);
  }
})();
