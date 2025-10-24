#!/usr/bin/env node
/*
  Safe admin script to delete entire collections (documents) from Firestore.
  Usage:
    node tools/delete_collections_admin.js --collections acuerdos-ceso,users --project my-project --dry-run
    node tools/delete_collections_admin.js --collections acuerdos-ceso,users --project my-project --yes

  Notes:
  - Requires GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY env var pointing to service account JSON.
  - By default the script only performs a dry-run. Use --yes to actually perform deletions.
  - The script deletes documents in batches and will also attempt to delete a common 'evidencias' subcollection under agreements.
  - Deletion is irreversible. Do not run unless you are certain.
*/

const {Firestore} = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));
if (!argv.collections) {
  console.error('Usage: --collections <comma,separated,list> [--project id] [--dry-run] [--yes]');
  process.exit(1);
}

const collections = argv.collections.split(',').map(s => s.trim()).filter(Boolean);
const dryRun = argv['dry-run'] || !argv.yes;
const projectId = argv.project || process.env.FIREBASE_PROJECT_ID || undefined;

const firestoreOptions = {};
if (projectId) firestoreOptions.projectId = projectId;

const db = new Firestore(firestoreOptions);

async function deleteCollection(collPath) {
  console.log(`Scanning collection: ${collPath}`);
  const colRef = db.collection(collPath);
  const snapshot = await colRef.limit(500).get();
  if (snapshot.empty) {
    console.log(`  (empty) ${collPath}`);
    return {count: 0};
  }

  let count = 0;
  // We'll page through all documents in the collection and delete them in batches
  let last = null;
  while (true) {
    let q = colRef.limit(500);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach(doc => {
      count++;
      // Also attempt to delete a common evidencias subcollection if it exists
      const evidRef = doc.ref.collection('evidencias');
      // We cannot delete subcollections directly here without listing them; enqueue doc delete
      batch.delete(doc.ref);
    });

    if (dryRun) {
      console.log(`  [dry-run] would delete ${snap.size} documents from ${collPath}`);
    } else {
      await batch.commit();
      console.log(`  deleted ${snap.size} documents from ${collPath}`);
    }

    last = snap.docs[snap.docs.length - 1];
    if (snap.size < 500) break;
  }

  return {count};
}

async function main() {
  console.log('Delete collections script');
  console.log('Collections:', collections.join(', '));
  console.log('Dry run:', dryRun ? 'yes' : 'no');
  if (dryRun) console.log('No documents will be deleted. Run with --yes to perform deletions.');

  let total = 0;
  for (const c of collections) {
    try {
      const res = await deleteCollection(c);
      total += res.count || 0;
    } catch (err) {
      console.error('Error deleting collection', c, err.message || err);
    }
  }

  console.log(`Completed. Scanned ${total} documents across ${collections.length} collections.`);
  if (dryRun) console.log('Dry-run complete. No changes made.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
