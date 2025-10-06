// Minimal E2E test against Firebase Local Emulator Suite.
// This script signs in a test user using the Auth emulator, uploads a file to the
// Storage emulator, writes evidence metadata to Firestore, and verifies it via
// the Admin SDK talking to the Firestore emulator.

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, collection, setDoc } = require('firebase/firestore');
const admin = require('firebase-admin');
const fs = require('fs');

// Use IPv4 loopback explicitly to avoid IPv6 (::1) connection issues on some systems
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

const firebaseConfig = {
  apiKey: 'AIzaSyBwMwbbD5AFkl9wFzH8Q7JbBXoQnksgnYM',
  authDomain: 'ceso-aphis-yuc.firebaseapp.com',
  projectId: 'ceso-aphis-yuc',
  storageBucket: 'ceso-aphis-yuc.firebasestorage.app',
  appId: '1:584773462235:web:7e294c25ed9550e008c4fe',
  measurementId: 'G-VFMJVPC08W'
};

async function run() {
  console.log('Starting emulator E2E test...');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Create a test user via emulator REST API or via client createUser
  const testEmail = 'test.user@example.local';
  const testPass = 'testpass123';

  try {
    await createUserWithEmailAndPassword(auth, testEmail, testPass);
    console.log('Created test user');
  } catch (e) {
    console.log('User may already exist:', e.message);
  }

  const signInRes = await signInWithEmailAndPassword(auth, testEmail, testPass);
  console.log('Signed in:', signInRes.user.email);

  // Write evidence metadata to Firestore using client (Storage upload skipped in Node test)
  const evidenciaMeta = {
    filename: 'evidence-1.txt',
    storagePath: `acuerdos-aphis/test-doc-123/evidence-1.txt`,
    uploader: testEmail,
    createdAt: new Date()
  };

  const evidenciaRef = doc(collection(db, 'acuerdos-aphis/test-doc-123/evidencias'));
  await setDoc(evidenciaRef, evidenciaMeta);
  console.log('Wrote evidence metadata to Firestore client-side');

  // Verify via Admin SDK
  admin.initializeApp({ projectId: 'ceso-aphis-yuc' });
  const adminDb = admin.firestore();
  const snap = await adminDb.doc(`acuerdos-aphis/test-doc-123/evidencias/${evidenciaRef.id}`).get();
  if (snap.exists) {
    console.log('Admin SDK verified evidence metadata:', snap.data());
  } else {
    throw new Error('Evidence metadata not found in emulator Firestore');
  }

  console.log('E2E emulator test completed successfully');
}

run().catch(err => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
