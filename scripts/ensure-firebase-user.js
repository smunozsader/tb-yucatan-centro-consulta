#!/usr/bin/env node
/**
 * ensure-firebase-user.js
 *
 * Creates a Firebase Authentication user if it does not exist and sets custom claims.
 * Usage:
 *   node scripts/ensure-firebase-user.js <email> <password> [role]
 * Example:
 *   node scripts/ensure-firebase-user.js smunoz.sader@gmail.com MunozSader#99 ADMINISTRATOR
 *
 * Requirements:
 * - Set environment variable FIREBASE_SERVICE_ACCOUNT_KEY to the path of the service account JSON
 * - Optionally set FIREBASE_PROJECT_ID
 */

require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKeyPath) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY env var is not set. Point it to your service account JSON.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = require(path.resolve(serviceAccountKeyPath));
} catch (e) {
  console.error('❌ Failed to load service account JSON from', serviceAccountKeyPath, e.message || e);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || (serviceAccount.project_id || null)
});

async function ensureUser(email, password, role = 'RESPONSABLE') {
  try {
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log('ℹ️ Found existing Firebase Auth user:', userRecord.uid, userRecord.email);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/user-not-found') {
        console.log('ℹ️ User not found in Firebase Auth. Creating user:', email);
        userRecord = await admin.auth().createUser({ email, password, emailVerified: true });
        console.log('✅ Created user:', userRecord.uid);
      } else {
        throw err;
      }
    }

    const isAdmin = (role === 'ADMINISTRATOR');
    const claims = { role: role, admin: !!isAdmin };
    await admin.auth().setCustomUserClaims(userRecord.uid, claims);
    console.log('✅ Set custom claims for', email, claims);

    // Print the user and claims for confirmation
    const updated = await admin.auth().getUser(userRecord.uid);
    console.log('🔎 Final user record:', { uid: updated.uid, email: updated.email, customClaims: updated.customClaims });

    // Helpful note
    console.log('\nNote: The user must sign out and sign back in for client tokens to pick up new claims, or call getIdToken(true) in the client to force refresh.');

  } catch (e) {
    console.error('❌ Error ensuring user:', e && e.message ? e.message : e);
    process.exitCode = 2;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const role = args[2] || 'RESPONSABLE';
  if (!email || !password) {
    console.error('Usage: node scripts/ensure-firebase-user.js <email> <password> [role]');
    process.exit(1);
  }
  ensureUser(email, password, role).then(() => process.exit(0));
}
