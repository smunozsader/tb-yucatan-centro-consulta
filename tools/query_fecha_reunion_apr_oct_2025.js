// Query `acuerdos-ceso` for documents where `Fecha de Reunión` (or fallback) is between 2025-04-01 and 2025-10-31.
// Usage: node tools/query_fecha_reunion_apr_oct_2025.js

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

const spanishMonths = {
  enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6, julio:7, agosto:8, septiembre:9, octubre:10, noviembre:11, diciembre:12
};

function tryParseDate(v) {
  if (!v && v !== 0) return null;
  // Firestore Timestamp
  if (v && typeof v.toDate === 'function') return v.toDate();
  // If it's a Date already
  if (v instanceof Date) return v;
  // number: epoch millis or seconds or excel serial
  if (typeof v === 'number') {
    // ms
    if (v > 1e12) {
      const d = new Date(v); if (!isNaN(d)) return d;
    }
    // seconds
    if (v > 1e9 && v < 1e12) {
      const d = new Date(v * 1000); if (!isNaN(d)) return d;
    }
    // Excel serial heuristic
    if (v > 40000 && v < 60000) {
      const d = new Date(Math.round((v - 25569) * 86400 * 1000)); if (!isNaN(d)) return d;
    }
    return null;
  }
  if (typeof v === 'string') {
    const s = v.trim();
    // ISO-ish YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const d = new Date(s); if (!isNaN(d)) return d;
    }
    // dd/mm/yyyy or dd-mm-yyyy
    let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const day = parseInt(m[1],10), month = parseInt(m[2],10), year = parseInt(m[3],10);
      const d = new Date(Date.UTC(year, month-1, day)); if (!isNaN(d)) return d;
    }
    // Spanish "10 de octubre de 2025" (allow capitals)
    m = s.toLowerCase().match(/^(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4})$/i);
    if (m && spanishMonths[m[2]]) {
      const day = parseInt(m[1],10), month = spanishMonths[m[2]], year = parseInt(m[3],10);
      const d = new Date(Date.UTC(year, month-1, day)); if (!isNaN(d)) return d;
    }
    // Other common patterns: "Octubre 10 2025" or "10 Octubre 2025"
    m = s.toLowerCase().match(/^(?:([a-zñ]+)\s+(\d{1,2})\s+(\d{4})|(\d{1,2})\s+([a-zñ]+)\s+(\d{4}))$/i);
    if (m) {
      if (m[1]) { // month name first
        const monthName = m[1], day = parseInt(m[2],10), year = parseInt(m[3],10);
        if (spanishMonths[monthName]) { const d = new Date(Date.UTC(year, spanishMonths[monthName]-1, day)); if (!isNaN(d)) return d; }
      } else {
        const day = parseInt(m[4],10), monthName = m[5], year = parseInt(m[6],10);
        if (spanishMonths[monthName]) { const d = new Date(Date.UTC(year, spanishMonths[monthName]-1, day)); if (!isNaN(d)) return d; }
      }
    }
    // fallback: try Date constructor
    const d = new Date(s); if (!isNaN(d)) return d;
  }
  return null;
}

(async () => {
  try {
    const snapshot = await db.collection('acuerdos-ceso').get();
    console.log('Total documentos in acuerdos-ceso:', snapshot.size);
    const matches = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // try exact field and fallback
      const candidates = [];
      if (Object.prototype.hasOwnProperty.call(data, 'Fecha de Reunión')) candidates.push({ key: 'Fecha de Reunión', val: data['Fecha de Reunión'] });
      if (Object.prototype.hasOwnProperty.call(data, 'Fecha de Reunion')) candidates.push({ key: 'Fecha de Reunion', val: data['Fecha de Reunion'] });
      // sometimes stored under normalized keys like fecha_reunion or fechaDeReunion
      if (Object.prototype.hasOwnProperty.call(data, 'fecha_reunion')) candidates.push({ key: 'fecha_reunion', val: data['fecha_reunion'] });
      if (Object.prototype.hasOwnProperty.call(data, 'fechaReunion')) candidates.push({ key: 'fechaReunion', val: data['fechaReunion'] });
      if (Object.prototype.hasOwnProperty.call(data, 'fecha')) candidates.push({ key: 'fecha', val: data['fecha'] });

      for (const c of candidates) {
        const parsed = tryParseDate(c.val);
        if (parsed && parsed >= start && parsed <= end) {
          matches.push({ id: doc.id, field: c.key, date: parsed.toISOString(), title: data.titulo || data.nombre || data['Nombre del acuerdo'] || '---' });
        }
      }
    });

    if (matches.length === 0) {
      console.log('No matches found between 2025-04-01 and 2025-10-31 for `Fecha de Reunión`.');
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
