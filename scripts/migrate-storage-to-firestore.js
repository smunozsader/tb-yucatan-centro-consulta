/*
  migrate-storage-to-firestore.js
  One-shot migration: list files under Repositorio-ceso/* and ensure a Firestore
  document exists for each file in collection `repositorio-ceso`.

  Usage:
    # from project root (Windows PowerShell)
    $env:SERVICE_ACCOUNT='C:\Users\smuno\FirebaseKeys\ceso-aphis-yuc-service-account.json'
    node .\scripts\migrate-storage-to-firestore.js

  The script uses the Admin SDK and will not modify files that already have
  matching Firestore documents (it matches by storagePath). It logs a summary
  to stdout and writes `migrate-report.json` in the project root.
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
// Prefer explicit FIREBASE_PROJECT_ID from environment, otherwise derive from service account
const projectId = process.env.FIREBASE_PROJECT_ID || sa.project_id;
const storageBucketName = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

admin.initializeApp({
  credential: admin.credential.cert(sa),
  storageBucket: storageBucketName
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Map storage folder names to category IDs used in the UI
// Accept both capitalized and lowercase folder names (console vs programmatic)
const folderToCategory = {
  'actas-ceso': 'actas-ceso',
  'Actas-ceso': 'actas-ceso',
  'normativas-sinida': 'normativas-ceso',
  'Normativas-SINIDA': 'normativas-ceso',
  'manuales-operativos': 'manuales-ceso',
  'Manuales-Operativos': 'manuales-ceso',
  'formatos-y-plantillas': 'formatos-ceso',
  'Formatos-y-Plantillas': 'formatos-ceso',
  'reportes-de-seguimiento': 'reportes-ceso',
  'Reportes-de-Seguimiento': 'reportes-ceso',
  'certificaciones': 'certificaciones-ceso',
  'Certificaciones': 'certificaciones-ceso',
  'otros': 'otros-ceso',
  'Otros': 'otros-ceso'
};

async function listFiles(prefix) {
  const options = { prefix };
  const [files] = await bucket.getFiles(options);
  return files;
}

async function fileHasDoc(storagePath) {
  const snapshot = await db.collection('repositorio-ceso').where('storagePath', '==', storagePath).limit(1).get();
  return !snapshot.empty;
}

function guessCategoryFromPath(storagePath) {
  // storagePath like: 'Repositorio-ceso/Certificaciones/1234_filename.pdf'
  const parts = storagePath.split('/');
  if (parts.length >= 2 && parts[0].toLowerCase().startsWith('repositorio')) {
    // take the second segment as folder
    const folder = parts[1];
    return folderToCategory[folder] || 'otros-ceso';
  }
  return 'otros-ceso';
}

function filenameFromPath(storagePath) {
  return storagePath.split('/').pop();
}

async function run() {
  console.log('Starting migration using service account:', serviceAccountPath);

  const prefixes = [
    'Repositorio-ceso/Certificaciones',
    'Repositorio-ceso/Formatos-y-Plantillas',
    'Repositorio-ceso/Manuales-Operativos',
    'Repositorio-ceso/Normativas-SINIDA',
    'Repositorio-ceso/Reportes-de-Seguimiento',
    'Repositorio-ceso/Actas-ceso',
    'Repositorio-ceso/Otros'
  ];

  const report = { created: [], skipped: [], errors: [] };

  let totalMatches = 0;
  for (const p of prefixes) {
    console.log('Listing files under prefix:', p);
    let files;
    try {
      files = await listFiles(p + '/');
    } catch (e) {
      console.error('Error listing', p, e.message || e);
      report.errors.push({ prefix: p, error: e.message || String(e) });
      continue;
    }

    console.log('Found', files.length, 'files under', p);

    for (const file of files) {
        const storagePath = file.name; // path within bucket
        // Skip folder placeholder objects (console adds zero-byte objects with trailing slash)
        if (storagePath.endsWith('/')) {
          console.log('Skipping placeholder folder object:', storagePath);
          report.skipped.push({ storagePath, reason: 'folder-placeholder' });
          continue;
        }
      try {
        const exists = await fileHasDoc(storagePath);
        if (exists) {
          report.skipped.push({ storagePath });
          continue;
        }

        // Get metadata from storage if available
        const [meta] = await file.getMetadata();
        const createdAt = meta.timeCreated ? new Date(meta.timeCreated) : admin.firestore.FieldValue.serverTimestamp();

        const doc = {
          category: guessCategoryFromPath(storagePath),
          filename: filenameFromPath(storagePath),
          storagePath: storagePath,
          uploader: meta.metadata && meta.metadata.uploader ? meta.metadata.uploader : 'console-import',
          createdAt: admin.firestore.Timestamp.fromDate(new Date(createdAt instanceof Date ? createdAt : Date.now()))
        };

        // Create doc in Firestore
        await db.collection('repositorio-ceso').add(doc);
        report.created.push({ storagePath, doc });
        console.log('Created metadata for', storagePath);
      } catch (e) {
        console.error('Error processing', file.name, e.message || e);
        report.errors.push({ storagePath: file.name, error: e.message || String(e) });
      }
      totalMatches++;
    }
  }

  // If we found nothing with the explicit prefixes, do a wider (limited) scan
  if (totalMatches === 0) {
    console.log('No files found under standard prefixes. Performing a broader scan for any paths containing "repositorio-ceso" (case-insensitive). This may take a moment...');
    try {
      // Retrieve up to 5000 files and filter client-side
      const [allFiles] = await bucket.getFiles({ maxResults: 5000 });
      const candidateFiles = allFiles.filter(f => /repositorio-ceso/i.test(f.name));
      console.log('Found', candidateFiles.length, 'candidate files matching "repositorio-ceso"');
      for (const file of candidateFiles) {
        const storagePath = file.name;
        try {
          const exists = await fileHasDoc(storagePath);
          if (exists) { report.skipped.push({ storagePath }); continue; }
          const [meta] = await file.getMetadata();
          const createdAt = meta.timeCreated ? new Date(meta.timeCreated) : admin.firestore.FieldValue.serverTimestamp();
          const doc = {
            category: guessCategoryFromPath(storagePath),
            filename: filenameFromPath(storagePath),
            storagePath: storagePath,
            uploader: meta.metadata && meta.metadata.uploader ? meta.metadata.uploader : 'console-import',
            createdAt: admin.firestore.Timestamp.fromDate(new Date(createdAt instanceof Date ? createdAt : Date.now()))
          };
          await db.collection('repositorio-ceso').add(doc);
          report.created.push({ storagePath, doc });
          console.log('Created metadata for', storagePath);
        } catch (e) {
          console.error('Error processing', file.name, e.message || e);
          report.errors.push({ storagePath: file.name, error: e.message || String(e) });
        }
      }
    } catch (e) {
      console.error('Error during broader scan:', e.message || e);
      report.errors.push({ prefix: 'broad-scan', error: e.message || String(e) });
    }
  }

  const outPath = path.join(process.cwd(), 'migrate-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('Migration complete. Summary: created=', report.created.length, 'skipped=', report.skipped.length, 'errors=', report.errors.length);
  console.log('Report written to', outPath);
}

run().catch(err => {
  console.error('Fatal error during migration:', err.message || err);
  process.exit(1);
});
