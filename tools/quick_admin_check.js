// Quick Admin SDK check: initializes firebase-admin using FIREBASE_SERVICE_ACCOUNT_KEY from .env
// and lists top-level Firestore collections.

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountPath) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not set in .env');
  process.exit(2);
}

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at', serviceAccountPath);
  process.exit(3);
}

const admin = require('firebase-admin');
try {
  const sa = require(serviceAccountPath);
  admin.initializeApp({ credential: admin.credential.cert(sa) });
} catch (err) {
  console.error('Failed to initialize admin SDK:', err.message || err);
  process.exit(4);
}

const db = admin.firestore();
(async () => {
  try {
    console.log('Admin SDK initialized. Project:', process.env.FIREBASE_PROJECT_ID || (admin.app().options && admin.app().options.projectId));
    const cols = await db.listCollections();
    console.log('Top-level collections (count ' + cols.length + '):');
    cols.forEach(c => console.log('-', c.id));
    process.exit(0);
  } catch (err) {
    console.error('Firestore call failed:', err.message || err);
    process.exit(5);
  }
})();
