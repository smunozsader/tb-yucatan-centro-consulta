// Query acuerdos-ceso for documents with date fields between two dates.
// Usage: node tools/query_acuerdos_by_date_range.js

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

const start = new Date('2025-06-01T00:00:00Z');
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
    // numeric serial (Excel-like) or epoch
    if (typeof v === 'number') {
      // if it's clearly epoch seconds
      if (v > 1e9) {
        const d = new Date(v);
        if (!isNaN(d)) dateFields.push({ key: k, value: d });
        continue;
      }
      // Excel serial number heuristic
      if (v > 40000 && v < 60000) {
        // Excel serial to JS Date
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
      console.log('No matches found in the given date range.');
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
