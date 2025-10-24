Import CSV to Firestore & safe rules deployment
===============================================

This short guide shows how to import CSV files into Firestore using the included script and how to deploy the new simplified security rules safely.

Prerequisites
-------------
- Node.js (recommended v18+ per project engines).
- Set GOOGLE_APPLICATION_CREDENTIALS to point to a Firebase service account JSON with Firestore/Storage admin privileges (or run on a machine with proper gcloud auth).
- Install dependencies for the importer: `npm install` in the repository root (this project already depends on `csv-parse` and `@google-cloud/firestore`).

Importing CSV data (dry-run first)
---------------------------------
1. Dry run to inspect parsed rows:

```
node tools/import_csv_to_firestore.js --file "path/to/your.csv" --collection acuerdos-ceso --dry-run
```

2. Actual import (example):

```
node tools/import_csv_to_firestore.js --file "path/to/your.csv" --collection acuerdos-ceso --project your-project-id --batch-size 400
```

Notes
-----
- If your CSV has an `id` column, the script will use that as the document id. Otherwise Firestore will generate document ids.
- Columns ending with `_at` or `_date` will be parsed into JS Dates when the value parses as a valid date.
- Empty strings are converted to `null`.

Deploying rules safely
----------------------
Option A — Use the Firebase Emulator (recommended for testing local behavior):

1. Ensure `firebase-tools` is installed (`npm install` or use global `firebase` CLI).
2. Start emulators: `npm run emulators:start` (this project has a script preconfigured to include firestore, auth, storage).
3. Use the local Firebase Admin credentials or connect your app to the emulators.

Option B — Deploy to a preview hosting channel (non-production):

1. Deploy only rules to a preview channel or create a preview site (using `firebase hosting:channel:deploy`), or deploy to `--only firestore:rules,storage:rules`.
2. Test the client against the preview rules and storage to ensure permissions behave as expected.

Rollback
--------
- Rules are versioned in Firebase; if you deploy a mistaken ruleset you can revert from the Firebase Console (Firestore > Rules > History) or re-deploy a previous rules file.

If you want, I can run the emulator locally (if you permit) to validate rule syntax and a small import. Otherwise follow the steps above and paste any error output here and I'll help fix it.
