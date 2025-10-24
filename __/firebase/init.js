if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');

// Initialize app only once (idempotent). Some pages include this file twice via
// gobmx runtime injection or manual includes — guard against double-init.
if (!firebase.apps || firebase.apps.length === 0) {
  firebase.initializeApp({
    "apiKey": "AIzaSyBwMwbbD5AFkl9wFzH8Q7JbBXoQnksgnYM",
    "appId": "1:584773462235:web:7e294c25ed9550e008c4fe",
    "authDomain": "ceso-aphis-yuc.firebaseapp.com",
    "databaseURL": "",
    "measurementId": "G-VFMJVPC08W",
    "messagingSenderId": "584773462235",
    "projectId": "ceso-aphis-yuc",
    "storageBucket": "ceso-aphis-yuc.firebasestorage.app"
  });
} else {
  console.warn('hosting/init.js: Firebase app already initialized — skipping initializeApp');
}

// Expose a global `db` that is safe to reference even if this file is executed
// multiple times. Use window.db instead of const to avoid redeclaration errors
// when the script is included more than once on the page.
if (!window.db) {
  window.db = firebase.firestore();
} else {
  // If db already exists, keep it — but ensure it's a Firestore instance
  try {
    if (!window.db.collection) window.db = firebase.firestore();
  } catch (e) {
    window.db = firebase.firestore();
  }
}