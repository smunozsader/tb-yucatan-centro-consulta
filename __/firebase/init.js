if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');
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
// Initialize Firestore
const db = firebase.firestore();