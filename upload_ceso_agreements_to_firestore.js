// Node.js script to upload CESO agreements from CSV to Firestore
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ceso-aphis-yuc.firebaseio.com'
});
const db = admin.firestore();

// Read CSV file
const csvPath = path.join(__dirname, 'BASES DATOS', 'recuperado_base_datos_CESO.csv');

async function uploadAgreements() {
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });

  for (const agreement of records) {
    // Use agreement number or description as document ID if available
    let docId = agreement.numero || agreement.Numero || agreement.descripcion || agreement.Descripcion || undefined;
    if (!docId) docId = Math.random().toString(36).substring(2, 12);
    await db.collection('acuerdos_ceso').doc(docId.toString()).set(agreement);
    console.log(`Uploaded CESO agreement: ${docId}`);
  }
  console.log('All CESO agreements uploaded!');
}

uploadAgreements().catch(console.error);
