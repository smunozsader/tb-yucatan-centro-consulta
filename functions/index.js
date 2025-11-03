const { onRequest, onCall } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Set global options for all functions
setGlobalOptions({
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10
});

// Initialize admin if not already
try {
  admin.initializeApp();
} catch (e) {
  // already initialized
}

const db = admin.firestore();

// Gen 2 HTTPS Function - Modern architecture with better performance
exports.adminUploadV2 = onRequest({ cors: true }, async (req, res) => {
  // CORS is handled by the onRequest options
  if (req.method !== 'POST') return res.status(405).send({ error: 'POST only' });

  try {
    const authHeader = req.get('Authorization') || '';
    const apiKey = req.get('x-admin-api-key');
    // Use environment variable (now with actual existing API key)
    const serverKey = process.env.ADMIN_UPLOAD_API_KEY;

    let uploader = 'unknown';

      if (serverKey && apiKey && apiKey === serverKey) {
        uploader = 'api-key';
      } else if (authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1].trim();
        const decoded = await admin.auth().verifyIdToken(idToken);
        if (!(decoded.admin === true || decoded.role === 'ADMINISTRATOR' || decoded.role === 'Administrador')) {
          return res.status(403).send({ error: 'Admin claim required' });
        }
        uploader = decoded.email || decoded.uid;
      } else {
        return res.status(401).send({ error: 'Auth required' });
      }

  const { filename, category, title, fileBase64, contentType, target, agreementId } = req.body || {};
      if (!filename || !category || !fileBase64) return res.status(400).send({ error: 'Missing filename, category or fileBase64' });

      // Validate file size (20 MB limit) and allowed content types
      const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
      let buffer;
      try {
        buffer = Buffer.from(fileBase64, 'base64');
      } catch (e) {
        return res.status(400).send({ error: 'Invalid base64 file data' });
      }
      if (buffer.length > MAX_BYTES) return res.status(413).send({ error: 'File too large (max 20 MB)' });

      const allowedTypes = new Set([
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]);

      // If contentType provided, check it; otherwise derive from filename extension
      let detectedType = contentType && String(contentType).toLowerCase();
      if (!detectedType) {
        const ext = (filename.split('.').pop() || '').toLowerCase();
        const extMap = {
          'pdf': 'application/pdf',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'ppt': 'application/vnd.ms-powerpoint',
          'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };
        detectedType = extMap[ext] || '';
      }
      if (!allowedTypes.has(detectedType)) {
        return res.status(415).send({ error: 'Unsupported file type', detectedType });
      }

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

      let storagePath;
      let writeRes;

      if (target === 'evidence' && agreementId) {
        // Save under evidencia-ceso/{agreementId}/status-changes/
        storagePath = `evidencia-ceso/${agreementId}/status-changes/${timestamp}_${filename}`;
        const file = bucket.file(storagePath);
        await file.save(buffer, { metadata: { contentType: detectedType || 'application/octet-stream' } });

        // Save metadata under acuerdos-ceso/{agreementId}/evidencias
        const doc = {
          fileName: filename,
          fileUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`,
          comment: title || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          uploadedBy: uploader
        };
        writeRes = await db.collection('acuerdos-ceso').doc(agreementId).collection('evidencias').add(doc);
        return res.status(200).send({ success: true, storagePath, docId: writeRes.id, fileUrl: doc.fileUrl });
      } else {
        const folderName = storageFolderMap[category] || storageFolderMap['otros-ceso'];
        storagePath = `Repositorio-ceso/${folderName}/${timestamp}_${filename}`;
        const file = bucket.file(storagePath);
        await file.save(buffer, { metadata: { contentType: detectedType || 'application/octet-stream' } });

        const doc = {
          category,
          title: title || filename,
          filename,
          storagePath,
          uploader,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        writeRes = await db.collection('repositorio-ceso').add(doc);
        return res.status(200).send({ success: true, storagePath, docId: writeRes.id });
      }
    } catch (err) {
      console.error('adminUpload error:', err);
      return res.status(500).send({ error: err && err.message ? err.message : String(err) });
    }
});

// Gen 2 Callable Function - Modern user role management
exports.setCustomUserRoleV2 = onCall(async (request) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  // Check if the user has admin privileges
  const callerToken = request.auth.token;
  if (!(callerToken.admin === true || callerToken.role === 'ADMINISTRATOR')) {
    throw new Error('Only administrators can set user roles');
  }

  const { uid, role } = request.data;
  
  // Validate input
  if (!uid || !role) {
    throw new Error('uid and role are required');
  }

  // Validate role values
  const validRoles = ['ADMINISTRATOR', 'RESPONSIBLE', 'PUBLIC'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  try {
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(uid, { 
      role: role,
      admin: role === 'ADMINISTRATOR'
    });

    console.log(`Successfully set role ${role} for user ${uid}`);
    
    return { 
      success: true, 
      message: `Role ${role} set successfully for user ${uid}`,
      uid: uid,
      role: role
    };
  } catch (error) {
    console.error('Error setting custom user claims:', error);
    throw new Error(`Failed to set user role: ${error.message}`);
  }
});

// Note: setCustomUserRole temporarily removed to avoid deployment issues.
// If you need this function, restore it and ensure it's configured for the
// correct Cloud Functions generation (Gen 1 vs Gen 2) and runtime settings.
