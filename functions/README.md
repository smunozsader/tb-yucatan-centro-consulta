Admin Upload Cloud Function

This function provides a secure hosted endpoint to upload files to Cloud Storage
and create Firestore metadata for the `repositorio-ceso` collection.

Usage
1. Deploy functions:
   firebase deploy --only functions:adminUpload

2. Configure an admin key for simple API-key access (optional):
   firebase functions:config:set admin.key="YOUR_SECRET_KEY"

3. Call endpoint from your hosted site or server:
   POST https://<YOUR_SITE>/admin-upload
   Headers: Authorization: Bearer <idToken>  OR  x-admin-api-key: <YOUR_SECRET_KEY>
   Body (JSON): { filename, category, title, fileBase64, contentType }
