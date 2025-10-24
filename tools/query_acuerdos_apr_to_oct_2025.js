// Query acuerdos-ceso for documents with date fields between 2025-04-01 and 2025-10-31.
// Usage: node tools/query_acuerdos_apr_to_oct_2025.js

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountPath) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not set in .env');
  process.exit(2);
}

try {
  const sa = require(serviceAccountPath);
  admin.initializeApp({ credential: admin.credential.cert(sa) });
} catch (err) {
  console.error('Failed to initialize admin SDK:', err.message || err);
  process.exit(3);
}

const db = admin.firestore();

const start = new Date('2025-04-01T00:00:00Z');
const end = new Date('2025-10-31T23:59:59Z');

function detectDateFields(data) {
  const dateFields = [];
  for (const [k, v] of Object.entries(data)) {
    if (!v) continue;
    // Firestore Timestamp
    if (v && typeof v.toDate === 'function') {
      dateFields.push({ key: k, value: v.toDate() });
      continue;
    }
    // ISO string
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
      const d = new Date(v);
      if (!isNaN(d)) dateFields.push({ key: k, value: d });
      continue;
    }
    // localized dd/mm/yyyy or dd-mm-yyyy
    if (typeof v === 'string' && /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.test(v)) {
      const parts = v.split(/[\/\-]/);
      const day = parseInt(parts[0], 10), month = parseInt(parts[1], 10), year = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month - 1, day));
      if (!isNaN(d)) dateFields.push({ key: k, value: d });
      continue;
    }
    // numeric serial (Excel-like) or epoch
    if (typeof v === 'number') {
      // epoch seconds or millis
      if (v > 1e12) { // millis
        const d = new Date(v);
        if (!isNaN(d)) dateFields.push({ key: k, value: d });
        continue;
      }
      if (v > 1e9) { // seconds
        const d = new Date(v * 1000);
        if (!isNaN(d)) dateFields.push({ key: k, value: d });
        continue;
      }
      // Excel serial number heuristic
      if (v > 40000 && v < 60000) {
        const jsDate = new Date(Math.round((v - 25569) * 86400 * 1000));
        if (!isNaN(jsDate)) dateFields.push({ key: k, value: jsDate });
        continue;
      }
    }
  }
  return dateFields;
}

(async () => {
  try {
    const snapshot = await db.collection('acuerdos-ceso').get();
    console.log('Total documentos in acuerdos-ceso:', snapshot.size);
    const matches = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateFields = detectDateFields(data);
      for (const f of dateFields) {
        if (f.value >= start && f.value <= end) {
          matches.push({ id: doc.id, field: f.key, date: f.value.toISOString(), title: data.titulo || data.nombre || data.nombre_acuerdo || '---' });
        }
      }
    });
    if (matches.length === 0) {
      console.log('No matches found between 2025-04-01 and 2025-10-31.');
    } else {
      console.log('Matches found:', matches.length);
      matches.forEach(m => console.log(`- ${m.id} | ${m.field} = ${m.date} | ${m.title}`));
    }
    process.exit(0);
  } catch (err) {
    console.error('Query failed:', err.message || err);
    process.exit(4);
  }
})();
