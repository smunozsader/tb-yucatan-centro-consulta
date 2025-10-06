if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');
firebase.initializeApp({
  "apiKey": "AIzaSyDJKLkfx0Trhpsnho20fBmbvxvXfms-qCc",
  "appId": "1:456046576905:web:9b3b09ce0df87a7e003fd8",
  "authDomain": "tb-yucatan.firebaseapp.com",
  "databaseURL": "",
  "measurementId": "G-EDDNCEYL8Y",
  "messagingSenderId": "456046576905",
  "projectId": "tb-yucatan",
  "storageBucket": "tb-yucatan.firebasestorage.app"
});
// Initialize Firestore
const db = firebase.firestore();