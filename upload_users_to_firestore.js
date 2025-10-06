// Node.js script to upload users from CSV to Firestore
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

// Helper to upload users from a CSV file to a Firestore collection
async function uploadUsers(csvFile, collectionName) {
  const csvData = fs.readFileSync(csvFile, 'utf8');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });
  for (const user of records) {
    // Use email as document ID for uniqueness
    const docId = user.correo.replace(/[^a-zA-Z0-9]/g, '_');
    await db.collection(collectionName).doc(docId).set(user);
    console.log(`Uploaded: ${user.nombre} (${user.correo}) to ${collectionName}`);
  }
}

async function main() {
  await uploadUsers(path.join(__dirname, 'BASES DATOS', 'usuarios_ceso_new_web_app.csv'), 'users_ceso');
  await uploadUsers(path.join(__dirname, 'BASES DATOS', 'usuarios_aphis-usda_new_web_app.csv'), 'users_aphis');
  console.log('All users uploaded!');
}

main().catch(console.error);
