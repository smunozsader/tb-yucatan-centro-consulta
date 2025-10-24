# Automated Development Log — 2025-10-22

Summary: Implemented server-side evidence upload flow (Plan C) and migrated status-change flows in both CESO and APHIS hall pages to POST to `/admin-upload` instead of performing client-side Firebase Storage uploads. This prevents client-side "storage/unauthorized" errors when the Firebase client is unsigned or lacks admin claims.

Files changed/created:
- server.js: Added handling for payload.target === 'evidence' with agreementId; saves to `evidencia-ceso/{agreementId}/status-changes/` and creates Firestore metadata under `acuerdos-ceso/{agreementId}/evidencias`.
- hall-ceso.html: Replaced direct client Storage.put for status-change evidence with POST to `/admin-upload`. Uses returned `fileUrl` for Firestore updates.
- hall-aphis.html: Same change applied for APHIS hall.

Build output (npm run build):
```
vite v4.5.14 building for production...
... (truncated)
✓ built in 2.29s
```

Deploy attempt (npm run deploy):
```
=== Deploying to 'ceso-aphis-yuc'...

i  deploying storage, firestore, hosting

There was an issue deploying your functions. Verify that your project has a Google App Engine instance setup at https://console.cloud.google.com/appengine and try again. If this issue persists, please contact support.
Error: HTTP Error: 404, Resource 'projects/ceso-aphis-yuc/locations/global/applications/ceso-aphis-yuc' was not found
```

Git commit:
- Branch: chore/replace-xlsx-with-exceljs
- Commit: feat: server-side evidence upload + migrate status-change flows to /admin-upload
- Files: server.js, hall-ceso.html, hall-aphis.html

Notes & next steps:
1. Deploy failed due to missing App Engine application for this project. To fix:
   - Create App Engine for the project in Google Cloud Console (App Engine > Create application) OR
   - Deploy functions using a region that doesn't require an App Engine instance, or use Cloud Run for server endpoints.
2. Validate Cloud Function `adminUpload` configuration and invoker IAM if 403s persist; check functions config admin.key if using API key.
3. Migrate other client-side upload spots (`repositorio-*.html`, `acuerdos-*.html`) to `/admin-upload` to fully avoid client Storage writes where not authorized.

Logged by automation on 2025-10-22.
