// Node.js script to upload APHIS agreements from Excel to Firestore
const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ceso-aphis-yuc.firebaseio.com'
});
const db = admin.firestore();

// Read Excel file
const excelPath = path.join(__dirname, 'BASES DATOS', 'base datos APHIS USDA.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const records = XLSX.utils.sheet_to_json(sheet);

async function uploadAgreements() {
  for (const agreement of records) {
    // Use agreement number or description as document ID if available
    let docId = agreement.numero || agreement.Numero || agreement.descripcion || agreement.Descripcion || undefined;
    if (!docId) docId = Math.random().toString(36).substring(2, 12);
    await db.collection('acuerdos_aphis').doc(docId.toString()).set(agreement);
    console.log(`Uploaded APHIS agreement: ${docId}`);
  }
  console.log('All APHIS agreements uploaded!');
}

uploadAgreements().catch(console.error);
