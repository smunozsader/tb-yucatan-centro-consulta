#!/usr/bin/env node
/*
 Small helper to import a CSV file into a Firestore collection.
 Usage:
  node tools/import_csv_to_firestore.js --file path/to/file.csv --collection acuerdos-ceso [--project your-project-id] [--dry-run] [--batch-size 500]

 Requirements: set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON or run on a machine with gcloud auth application-default login.
*/

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const {Firestore} = require('@google-cloud/firestore');

function parseArgs() {
  const argv = require('minimist')(process.argv.slice(2));
  if (!argv.file || !argv.collection) {
    console.error('Usage: node import_csv_to_firestore.js --file file.csv --collection target-collection [--project my-project] [--dry-run] [--batch-size 500]');
    process.exit(1);
  }
  return argv;
}

async function main() {
  const argv = parseArgs();
  const file = path.resolve(argv.file);
  const collection = argv.collection;
  const dryRun = !!argv['dry-run'];
  const batchSize = parseInt(argv['batch-size'] || '500', 10);

  if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    process.exit(1);
  }

  const input = fs.readFileSync(file, 'utf8');
  const records = parse(input, {columns: true, skip_empty_lines: true});

  const firestoreOptions = {};
  if (argv.project) firestoreOptions.projectId = argv.project;
  const db = new Firestore(firestoreOptions);

  console.log(`Parsed ${records.length} rows. Dry run: ${dryRun}. Batch size: ${batchSize}`);

  if (dryRun) {
    console.log('First 3 parsed rows:', records.slice(0,3));
    process.exit(0);
  }

  let batch = db.batch();
  let ops = 0;
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    // If CSV contains an `id` column, use it as document id; otherwise let Firestore generate one.
    const docRef = row.id ? db.collection(collection).doc(String(row.id)) : db.collection(collection).doc();
    // Convert empty strings to null and attempt to parse ISO dates if column name endsWith _at or _date
    const cleaned = {};
    Object.keys(row).forEach(k => {
      const v = row[k];
      if (v === '') { cleaned[k] = null; return; }
      if (/_at$|_date$/i.test(k)) {
        const d = new Date(v);
        if (!isNaN(d.getTime())) { cleaned[k] = d; return; }
      }
      cleaned[k] = v;
    });

    batch.set(docRef, cleaned, {merge: true});
    ops++;

    if (ops >= batchSize) {
      await batch.commit();
      console.log(`Committed ${ops} writes...`);
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
    console.log(`Committed final ${ops} writes.`);
  }

  console.log('Import complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
