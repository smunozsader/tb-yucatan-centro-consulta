/*
  cleanup-repositorio-metadata.js
  - Deletes Firestore docs in `repositorio-ceso` where storagePath ends with '/'
  - Updates Firestore docs whose storagePath contains '/actas-ceso/' to set category 'actas-ceso'

  Usage (PowerShell):
    $env:SERVICE_ACCOUNT='C:\Users\smuno\FirebaseKeys\ceso-aphis-yuc-service-account.json'
    $env:FIREBASE_PROJECT_ID='ceso-aphis-yuc'
    node .\scripts\cleanup-repositorio-metadata.js

  Outputs: cleanup-report.json in repo root with lists of deleted/updated doc IDs.
*/

const fs = require('fs');
const path = require('path');

const serviceAccountPath = process.env.SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT || null;
if (!serviceAccountPath) {
  console.error('ERROR: Service account key path not provided. Set SERVICE_ACCOUNT env var or FIREBASE_SERVICE_ACCOUNT_KEY in .env');
  process.exit(1);
}

if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERROR: Service account JSON not found at', serviceAccountPath);
  process.exit(1);
}

const admin = require('firebase-admin');
const sa = require(serviceAccountPath);
const projectId = process.env.FIREBASE_PROJECT_ID || sa.project_id;
const storageBucketName = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

admin.initializeApp({
  credential: admin.credential.cert(sa),
  storageBucket: storageBucketName
});

const db = admin.firestore();

async function run() {
  const report = { deleted: [], updated: [], errors: [] };

  try {
    console.log('Scanning `repositorio-ceso` for placeholder storagePath entries...');
    const snap = await db.collection('repositorio-ceso').get();
    console.log('Found', snap.size, 'documents in repositorio-ceso');

    for (const doc of snap.docs) {
      try {
        const data = doc.data();
        const storagePath = data.storagePath || '';
        const filename = data.filename || '';

        if (storagePath && storagePath.endsWith('/')) {
          // Delete placeholder
          console.log('Deleting placeholder doc:', doc.id, storagePath);
          await db.collection('repositorio-ceso').doc(doc.id).delete();
          report.deleted.push({ id: doc.id, storagePath });
          continue;
        }

        // Update actas category if needed
        if (/\/actas-ceso\//i.test(storagePath) || /\/actas-ceso\//i.test(storagePath)) {
          if (data.category !== 'actas-ceso') {
            console.log('Updating category for', doc.id, 'to actas-ceso');
            await db.collection('repositorio-ceso').doc(doc.id).update({ category: 'actas-ceso' });
            report.updated.push({ id: doc.id, storagePath });
          }
        }
      } catch (e) {
        console.error('Error processing doc', doc.id, e.message || e);
        report.errors.push({ id: doc.id, error: e.message || String(e) });
      }
    }

    const outPath = path.join(process.cwd(), 'cleanup-report.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log('Cleanup complete. deleted=', report.deleted.length, 'updated=', report.updated.length, 'errors=', report.errors.length);
    console.log('Report written to', outPath);
  } catch (err) {
    console.error('Fatal error during cleanup:', err.message || err);
  }
}

run().catch(e => console.error('Unhandled error:', e));
