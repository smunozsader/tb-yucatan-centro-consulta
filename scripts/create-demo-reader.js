/**
 * scripts/create-demo-reader.js
 *
 * Create a safe demo "reader" user in Firebase Auth and a corresponding
 * user document in Firestore (users_ceso or users_aphis). This script is
 * intended to be run locally by a developer with access to a Firebase
 * service account JSON file. Do NOT commit your service account file.
 *
 * Usage (PowerShell):
 *   $env:SERVICE_ACCOUNT='C:\Users\you\keys\service-account.json'; node .\scripts\create-demo-reader.js --org CESO --email demo.reader+ceso@example.com --password DemoReader#1
 * Or pass the service account via --serviceAccount path:
 *   node .\scripts\create-demo-reader.js --serviceAccount C:\path\to\service-account.json --org APHIS --email demo.reader+aphis@example.com --password DemoReader#1
 *
 * The script will:
 *  - initialize firebase-admin using the provided service account
 *  - create an Auth user with the provided email & password (if not existing)
 *  - set a custom claim `role: 'Reader'` and `permissions: ['view','download']`
 *  - write a document to `users_ceso` or `users_aphis` with minimal public profile
 *
 * Notes:
 *  - Requires Node.js >= 18 and the project's deps (firebase-admin installed in package.json)
 *  - This is for demo/testing only. Use strong passwords for any public demo accounts.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const argv = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const serviceAccountPath = args.serviceAccount || process.env.SERVICE_ACCOUNT;
  const org = (args.org || 'CESO').toUpperCase();
  const email = args.email || `demo.reader+${org.toLowerCase()}@example.com`;
  const password = args.password || 'DemoReader#1';

  if (!serviceAccountPath) {
    console.error('\nERROR: service account path is required. Provide via --serviceAccount or SERVICE_ACCOUNT env var.');
    process.exit(1);
  }

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`\nERROR: Service account file not found at ${serviceAccountPath}`);
    process.exit(1);
  }

  const serviceAccount = require(path.resolve(serviceAccountPath));

  // Initialize admin SDK (avoid re-init if already)
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  try {
    // Check if user already exists
    let userRecord = null;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`User already exists in Auth: ${email} (uid=${userRecord.uid})`);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/user-not-found') {
        userRecord = null;
      } else {
        // Some other error
        throw err;
      }
    }

    if (!userRecord) {
      console.log(`Creating Auth user: ${email}`);
      userRecord = await auth.createUser({
        email: email,
        emailVerified: false,
        password: password,
        displayName: `Demo Reader (${org})`,
        disabled: false
      });
      console.log('Created user uid=', userRecord.uid);
    }

    // Set custom claims for role & minimal permissions
    const claims = { role: 'Reader', permissions: ['view', 'download'], organization: org };
    await auth.setCustomUserClaims(userRecord.uid, claims);
    console.log('Assigned custom claims:', claims);

    // Add or update Firestore user document in the org-specific collection
    const collection = org === 'APHIS' ? 'users_aphis' : 'users_ceso';
    const userDoc = {
      nombre: `Demo Reader (${org})`,
      correo: email,
      rol: 'Reader',
      contrasena: password, // For local demo use only — do not store plain passwords in production
      permissions: ['view', 'download'],
      organization: org,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection(collection).doc(userRecord.uid).set(userDoc, { merge: true });
    console.log(`Wrote user document to ${collection}/${userRecord.uid}`);

    console.log('\n✅ Demo reader user created/updated successfully.');
    console.log('Use the following credentials for login in the client (CESO/APHIS selection matters):');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log('\nIMPORTANT: Remove or rotate this account after demos. Do not commit service account JSON to source control.');

  } catch (error) {
    console.error('Error creating demo user:', error);
    process.exit(2);
  } finally {
    // Graceful shutdown
    try { await admin.app().delete(); } catch (e) {}
    process.exit(0);
  }
}

main();
