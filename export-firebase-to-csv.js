// Node.js script to export Firebase ACUERDOS collections to CSV
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('C:\\Users\\smuno\\FirebaseKeys\\ceso-aphis-yuc-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ceso-aphis-yuc.firebaseio.com'
});
const db = admin.firestore();

// Function to convert data to CSV
function arrayToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];

      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      } else if (value instanceof admin.firestore.Timestamp) {
        return value.toDate().toISOString();
      } else if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""');
      } else if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      } else {
        return String(value);
      }
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

// Function to export collection to CSV
async function exportCollectionToCSV(collectionName, outputFileName) {
  console.log(`📊 Exporting collection: ${collectionName}`);

  try {
    const snapshot = await db.collection(collectionName).get();
    const data = [];

    snapshot.forEach(doc => {
      const docData = doc.data();
      // Add document ID as first column
      data.push({
        id: doc.id,
        ...docData
      });
    });

    if (data.length === 0) {
      console.log(`❌ No data found in collection: ${collectionName}`);
      return false;
    }

    const csv = arrayToCSV(data);
    const outputPath = path.join(__dirname, 'BASES DATOS', outputFileName);

    // Ensure BASES DATOS directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, csv, 'utf8');
    console.log(`✅ Exported ${data.length} documents to: ${outputPath}`);
    return true;

  } catch (error) {
    console.error(`❌ Error exporting ${collectionName}:`, error.message);
    return false;
  }
}

// Main export function
async function exportAllCollections() {
  console.log('🚀 Starting Firebase to CSV export...');
  console.log('Centro de Consulta de Acuerdos Sanitarios');
  console.log('='.repeat(50));

  const collections = [
    { name: 'acuerdos_ceso', file: 'recuperado_base_datos_CESO.csv' },
    { name: 'acuerdos-ceso', file: 'recuperado_base_datos_CESO_alt.csv' },
    { name: 'acuerdos_aphis', file: 'recuperado_base_datos_APHIS_USDA.csv' },
    { name: 'acuerdos-aphis', file: 'recuperado_base_datos_APHIS_USDA_alt.csv' },
    { name: 'acuerdos', file: 'recuperado_todos_acuerdos.csv' }
  ];

  let successCount = 0;

  for (const collection of collections) {
    const success = await exportCollectionToCSV(collection.name, collection.file);
    if (success) successCount++;
  }

  console.log('\n📋 EXPORT SUMMARY:');
  console.log('='.repeat(30));
  console.log(`✅ Successfully exported: ${successCount} collections`);
  console.log(`❌ Failed exports: ${collections.length - successCount}`);

  if (successCount > 0) {
    console.log('\n📁 Files saved to: ./BASES DATOS/');
    console.log('🔄 You can now import these CSV files back to Excel');
  } else {
    console.log('\n⚠️  No data found in any collections. Firebase may be empty.');
  }
}

// Run the export
exportAllCollections().catch(console.error);