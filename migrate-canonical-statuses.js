#!/usr/bin/env node
/**
 * migrate-canonical-statuses.js
 *
 * Safe Firestore migration to add a non-destructive canonical status field
 * for agreements whose status appears to mean 'permanent' (Permanente).
 *
 * Usage:
 *   node migrate-canonical-statuses.js            # dry-run (no writes)
 *   node migrate-canonical-statuses.js --apply    # perform updates
 *   node migrate-canonical-statuses.js --help
 *
 * By default the script will connect to the Firestore emulator if
 * FIRESTORE_EMULATOR_HOST is set. Otherwise it uses the Application
 * Default Credentials (GOOGLE_APPLICATION_CREDENTIALS).
 */

const { Firestore } = require('@google-cloud/firestore');
const argv = require('minimist')(process.argv.slice(2));
const collections = (argv.collections || argv.c || 'acuerdos-ceso,acuerdos-aphis').split(',').map(s => s.trim()).filter(Boolean);
const apply = !!argv.apply;
const batchSize = parseInt(argv.batchSize || argv.b || '500', 10);
const dryRun = !apply;
const confirm = argv.yes || argv.y;
const keyFile = argv.key || argv.k || process.env.GOOGLE_APPLICATION_CREDENTIALS || null;
const projectIdFlag = argv.project || argv.p || null;

function normalizeForMatch(s) {
  if (!s) return '';
  // Remove diacritics and lowercase
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

async function initFirestore() {
  // Use @google-cloud/firestore which respects emulator env var
  const opts = {};
  if (projectIdFlag) opts.projectId = projectIdFlag;
  if (keyFile) opts.keyFilename = keyFile;

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('Connecting to Firestore emulator at', process.env.FIRESTORE_EMULATOR_HOST);
  } else if (keyFile) {
    console.log('Using service account key file:', keyFile);
  } else if (projectIdFlag) {
    console.log('Using projectId:', projectIdFlag, '- ensure Application Default Credentials are available');
  } else {
    console.log('No emulator, key file, or projectId provided — Firestore client will attempt to use Application Default Credentials');
  }

  const firestore = new Firestore(opts);
  return firestore;
}

function shouldCanonicalizeStatus(rawStatus) {
  const s = normalizeForMatch(rawStatus || '');
  if (!s) return false;
  // If contains 'perman' (permanente/permanencia) treat as permanent
  if (s.includes('perman')) return true;
  // You may add additional heuristics here if desired
  return false;
}

async function scanAndPlan(db, collName) {
  console.log(`Scanning collection: ${collName}`);
  const collRef = db.collection(collName);
  const snapshot = await collRef.get();
  console.log(`  documents scanned: ${snapshot.size}`);

  const planned = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    const rawStatus = data.status || data.Estado || data.estado || data.estatus || '';
    if (shouldCanonicalizeStatus(rawStatus)) {
      // Only plan if canonical field not present or differs
      if (data.statusCanonical !== 'Completado') {
        planned.push({ id: doc.id, ref: doc.ref, currentStatus: rawStatus });
      }
    }
  });

  return planned;
}

async function applyPlans(planned, db) {
  if (planned.length === 0) return 0;
  console.log(`Applying ${planned.length} updates in batches of ${batchSize}...`);
  let applied = 0;
  for (let i = 0; i < planned.length; i += batchSize) {
    const batch = db.batch();
    const chunk = planned.slice(i, i + batchSize);
    chunk.forEach(item => {
      const payload = {
        statusCanonical: 'Completado',
        statusCanonicalSource: 'migration-2025-10-21',
        statusCanonicalSetAt: new Date().toISOString()
      };
      batch.update(item.ref, payload);
    });
    await batch.commit();
    applied += chunk.length;
    console.log(`  applied ${applied}/${planned.length}`);
  }
  return applied;
}

async function main() {
  console.log('Migration script: migrate-canonical-statuses.js');
  console.log(`Mode: ${dryRun ? 'DRY-RUN (no writes)' : 'APPLY (will write changes)'}; collections=${collections.join(',')}`);

  if (!dryRun && !confirm) {
    console.log('To perform writes, re-run with --apply --yes (or --apply -y)');
    return process.exit(0);
  }

  const db = await initFirestore();

  let totalPlanned = 0;
  const plansByCollection = {};

  for (const coll of collections) {
    const planned = await scanAndPlan(db, coll);
    plansByCollection[coll] = planned;
    totalPlanned += planned.length;
    console.log(`  planned updates for ${coll}: ${planned.length}`);
  }

  console.log(`Total planned document updates: ${totalPlanned}`);

  if (totalPlanned === 0) {
    console.log('No documents require migration. Exiting.');
    return process.exit(0);
  }

  // Show a small sample
  Object.keys(plansByCollection).forEach(coll => {
    const p = plansByCollection[coll];
    if (p.length > 0) {
      console.log(`Sample planned for ${coll}:`);
      p.slice(0, 5).forEach(item => console.log(`  - id=${item.id} currentStatus='${item.currentStatus}'`));
    }
  });

  if (dryRun) {
    console.log('\nDRY-RUN complete. No writes performed.');
    console.log('To apply changes re-run with: node migrate-canonical-statuses.js --apply --yes');
    return process.exit(0);
  }

  // If apply
  let totalApplied = 0;
  for (const coll of collections) {
    const planned = plansByCollection[coll];
    if (planned.length === 0) continue;
    const n = await applyPlans(planned, db);
    totalApplied += n;
  }

  console.log(`Migration applied. documents updated: ${totalApplied}`);
  console.log('Done.');
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
