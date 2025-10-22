const http = require('http');
const fs = require('fs');
const path = require('path');
// Admin SDK for server-side uploads
const admin = require('firebase-admin');

// Initialize Firebase Admin if SERVICE_ACCOUNT env var provided
try {
  const serviceAccountPath = process.env.SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(path.resolve(serviceAccountPath));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: (serviceAccount.project_id ? `${serviceAccount.project_id}.appspot.com` : undefined)
    });
    console.log('Firebase Admin initialized from', serviceAccountPath);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    admin.initializeApp();
    console.log('Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    console.log('Firebase Admin not initialized - SERVICE_ACCOUNT not set or file missing. Admin upload endpoint will be unavailable.');
  }
} catch (e) {
  console.error('Failed to initialize Firebase Admin SDK:', e && e.message ? e.message : e);
}

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  
  // Handle routing
  if (filePath === './') {
    filePath = './index.html';
  } else if (filePath === './ceso' || filePath === './ceso/') {
    filePath = './ceso.html';
  } else if (filePath === './aphis' || filePath === './aphis/') {
    filePath = './aphis.html';
  } else if (filePath === './auth-modal.html') {
    filePath = './auth-modal.html';
  } else if (filePath === './auth-system.js') {
    filePath = './auth-system.js';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Admin upload endpoint: POST /admin-upload
  if (req.url === '/admin-upload' && req.method === 'POST') {
    // Require admin SDK initialized
    if (!admin || !admin.apps || admin.apps.length === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Admin SDK not initialized on server' }));
      return;
    }

    // Collect body (expecting JSON with base64 file)
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { filename, category, title, fileBase64, contentType: fileContentType } = payload;
        const apiKey = req.headers['x-admin-api-key'];

        // Simple auth: either a valid Firebase ID token in Authorization header
        // or a server-side API key that matches ADMIN_UPLOAD_KEY env var (optional)
        const authHeader = req.headers['authorization'] || '';
        let verifiedUid = null;
        let verifiedEmail = null;

        // Check API key first (if configured)
        const serverKey = process.env.ADMIN_UPLOAD_KEY;
        if (serverKey && apiKey && apiKey === serverKey) {
          verifiedUid = 'api-key-admin';
          verifiedEmail = 'api-key';
        } else if (authHeader.startsWith('Bearer ')) {
          const idToken = authHeader.split('Bearer ')[1].trim();
          try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            // Check admin claim or role
            if (decoded.admin === true || decoded.role === 'ADMINISTRATOR' || decoded.role === 'Administrador') {
              verifiedUid = decoded.uid;
              verifiedEmail = decoded.email || decoded.uid;
            } else {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Insufficient privileges. Admin role required.' }));
              return;
            }
          } catch (idErr) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid or expired Firebase ID token' }));
            return;
          }
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Authorization required (Bearer idToken or x-admin-api-key)' }));
          return;
        }

        if (!filename || !fileBase64 || !category) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'filename, category and fileBase64 are required' }));
          return;
        }

        // Map category to storage folder map (same as client)
        const storageFolderMap = {
          'actas-ceso': 'Actas-ceso',
          'normativas-ceso': 'Normativas-SINIDA',
          'manuales-ceso': 'Manuales-Operativos',
          'formatos-ceso': 'Formatos-y-Plantillas',
          'reportes-ceso': 'Reportes-de-Seguimiento',
          'certificaciones-ceso': 'Certificaciones',
          'otros-ceso': 'Otros'
        };

        const timestamp = Date.now();
        const bucket = admin.storage().bucket();
        const buffer = Buffer.from(fileBase64, 'base64');

        if (payload.target === 'evidence' && payload.agreementId) {
          const storagePath = `evidencia-ceso/${payload.agreementId}/status-changes/${timestamp}_${filename}`;
          const file = bucket.file(storagePath);
          await file.save(buffer, { metadata: { contentType: fileContentType || 'application/octet-stream' } });

          // Create Firestore metadata under acuerdos-ceso/{agreementId}/evidencias
          const db = admin.firestore();
          const doc = {
            fileName: filename,
            fileUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`,
            comment: title || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            uploadedBy: verifiedEmail || verifiedUid
          };
          const writeRes = await db.collection('acuerdos-ceso').doc(payload.agreementId).collection('evidencias').add(doc);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, storagePath, docId: writeRes.id, fileUrl: doc.fileUrl }));
          return;
        }

        const folderName = storageFolderMap[category] || storageFolderMap['otros-ceso'];
        const storagePath = `Repositorio-ceso/${folderName}/${timestamp}_${filename}`;
        const file = bucket.file(storagePath);
        await file.save(buffer, { metadata: { contentType: fileContentType || 'application/octet-stream' } });

        // Create Firestore metadata
        const db = admin.firestore();
        const doc = {
          category,
          title: title || filename,
          filename,
          storagePath,
          uploader: verifiedEmail || verifiedUid,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const writeRes = await db.collection('repositorio-ceso').add(doc);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, storagePath, docId: writeRes.id }));
      } catch (err) {
        console.error('Admin upload error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err && err.message ? err.message : String(err) }));
      }
    });
    return;
  }

  // Regular static file serving continues below
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🏛️  Centro de Consulta de Acuerdos Sanitarios`);
  console.log(`🌐 Server running at http://localhost:${PORT}/`);
  console.log(`📂 Serving from: ${__dirname}`);
});