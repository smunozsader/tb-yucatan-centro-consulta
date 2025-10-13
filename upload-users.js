const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase with client SDK
const firebaseConfig = require('./__/firebase/init.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadUsers() {
  try {
    console.log('🚀 Starting user data upload to Firebase...');

    // Upload CESO users
    console.log('📤 Uploading CESO users...');
    const cesoData = fs.readFileSync(path.join(__dirname, 'BASES DATOS', 'usuarios_ceso_new_web_app.csv'), 'utf8');
    const cesoLines = cesoData.split('\n').filter(line => line.trim());
    const cesoHeaders = cesoLines[0].split(',');

    for (let i = 1; i < cesoLines.length; i++) {
      const values = cesoLines[i].split(',');
      if (values.length >= cesoHeaders.length) {
        const user = {};
        cesoHeaders.forEach((header, index) => {
          user[header.trim()] = values[index] ? values[index].trim() : '';
        });

        // Add permissions based on role
        if (user.rol === 'Administrador') {
          user.permissions = ['view', 'download', 'upload', 'admin'];
        } else if (user.rol === 'Federal') {
          user.permissions = ['view', 'download', 'upload'];
        } else {
          user.permissions = ['view', 'download'];
        }

        await addDoc(collection(db, 'users_ceso'), user);
        console.log(`✅ Added CESO user: ${user.nombre} (${user.correo})`);
      }
    }

    // Upload APHIS users
    console.log('📤 Uploading APHIS users...');
    const aphisData = fs.readFileSync(path.join(__dirname, 'BASES DATOS', 'usuarios_aphis-usda_new_web_app.csv'), 'utf8');
    const aphisLines = aphisData.split('\n').filter(line => line.trim());
    const aphisHeaders = aphisLines[0].split(',');

    for (let i = 1; i < aphisLines.length; i++) {
      const values = aphisLines[i].split(',');
      if (values.length >= aphisHeaders.length) {
        const user = {};
        aphisHeaders.forEach((header, index) => {
          user[header.trim()] = values[index] ? values[index].trim() : '';
        });

        // Add permissions based on role
        if (user.rol === 'Administrador') {
          user.permissions = ['view', 'download', 'upload', 'admin'];
        } else if (user.rol === 'Federal') {
          user.permissions = ['view', 'download', 'upload'];
        } else {
          user.permissions = ['view', 'download'];
        }

        await addDoc(collection(db, 'users_aphis'), user);
        console.log(`✅ Added APHIS user: ${user.nombre} (${user.correo})`);
      }
    }

    console.log('🎉 User data upload completed successfully!');
    console.log('📊 Collections populated: users_ceso and users_aphis');

  } catch (error) {
    console.error('❌ Error uploading user data:', error);
  } finally {
    process.exit(0);
  }
}

uploadUsers();