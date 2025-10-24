// Fetch given doc IDs from acuerdos-ceso, print full data, parse Fecha de Reunión and update a normalized fecha_reunion Timestamp
// Usage: node tools/normalize_fecha_reunion_for_ids.js id1 id2 id3 ...

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

const spanishMonths = {
  enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6, julio:7, agosto:8, septiembre:9, octubre:10, noviembre:11, diciembre:12
};

function tryParseDate(v) {
  if (!v && v !== 0) return null;
  if (v && typeof v.toDate === 'function') return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === 'number') {
    if (v > 1e12) { const d = new Date(v); if (!isNaN(d)) return d; }
    if (v > 1e9 && v < 1e12) { const d = new Date(v * 1000); if (!isNaN(d)) return d; }
    if (v > 40000 && v < 60000) { const d = new Date(Math.round((v - 25569) * 86400 * 1000)); if (!isNaN(d)) return d; }
    return null;
  }
  if (typeof v === 'string') {
    const s = v.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) { const d = new Date(s); if (!isNaN(d)) return d; }
    let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) { const day = parseInt(m[1],10), month = parseInt(m[2],10), year = parseInt(m[3],10); const d = new Date(Date.UTC(year, month-1, day)); if (!isNaN(d)) return d; }
    m = s.toLowerCase().match(/^(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4})$/i);
    if (m && spanishMonths[m[2]]) { const day = parseInt(m[1],10), month = spanishMonths[m[2]], year = parseInt(m[3],10); const d = new Date(Date.UTC(year, month-1, day)); if (!isNaN(d)) return d; }
    m = s.toLowerCase().match(/^(?:([a-zñ]+)\s+(\d{1,2})\s+(\d{4})|(\d{1,2})\s+([a-zñ]+)\s+(\d{4}))$/i);
    if (m) {
      if (m[1]) { const monthName = m[1], day = parseInt(m[2],10), year = parseInt(m[3],10); if (spanishMonths[monthName]) { const d = new Date(Date.UTC(year, spanishMonths[monthName]-1, day)); if (!isNaN(d)) return d; } } else { const day = parseInt(m[4],10), monthName = m[5], year = parseInt(m[6],10); if (spanishMonths[monthName]) { const d = new Date(Date.UTC(year, spanishMonths[monthName]-1, day)); if (!isNaN(d)) return d; } }
    }
    const d = new Date(s); if (!isNaN(d)) return d;
  }
  return null;
}

async function main() {
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error('Provide one or more document IDs as arguments');
    process.exit(2);
  }

  for (const id of ids) {
    const ref = db.collection('acuerdos-ceso').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log(id, 'does not exist');
      continue;
    }
    const data = snap.data();
    console.log('\n--- Document', id, '---');
    console.log(JSON.stringify(data, null, 2));

    // pick original field
    const keysToTry = ['Fecha de Reunión','Fecha de Reunion','fecha_reunion','fechaReunion','fecha'];
    let foundKey = null, rawVal = null;
    for (const k of keysToTry) {
      if (Object.prototype.hasOwnProperty.call(data, k)) { foundKey = k; rawVal = data[k]; break; }
    }
    if (!foundKey) {
      console.log('No Fecha de Reunión or fallback found for', id);
      continue;
    }
    const parsed = tryParseDate(rawVal);
    if (!parsed) { console.log('Could not parse date for', id, 'raw:', rawVal); continue; }

    const ts = admin.firestore.Timestamp.fromDate(parsed);
    console.log('Parsed date:', parsed.toISOString(), '-> storing as Timestamp');

    // write back a normalized field, preserve source
    const update = {
      fecha_reunion: ts,
      fecha_reunion_source: { field: foundKey, raw: rawVal }
    };
    await ref.update(update);
    console.log('Updated', id, 'with fecha_reunion and fecha_reunion_source');
  }
}

main().then(()=>process.exit(0)).catch(err=>{ console.error(err); process.exit(99); });
