const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Initialize Firebase with client SDK
const firebaseConfig = require('./__/firebase/init.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName) {
  console.log(`🗑️ Clearing existing ${collectionName} collection...`);
  const snapshot = await getDocs(collection(db, collectionName));
  const deletePromises = snapshot.docs.map(document => deleteDoc(doc(db, collectionName, document.id)));
  await Promise.all(deletePromises);
  console.log(`✅ Cleared ${snapshot.docs.length} documents from ${collectionName}`);
}

async function uploadUsersFromExcel() {
  try {
    console.log('🚀 Starting user data upload from Excel files to Firebase...\n');

    // Clear existing collections first
    await clearCollection('users_ceso');
    await clearCollection('users_aphis');

    // Upload CESO users from Excel
    console.log('📤 Loading CESO users from Excel...');
    const cesoPath = path.join(__dirname, 'BASES DATOS', 'usuarios_ceso_new_web_app_updated.xlsx');
    
    if (!fs.existsSync(cesoPath)) {
      console.error('❌ CESO Excel file not found:', cesoPath);
      return;
    }

    const cesoWorkbook = XLSX.readFile(cesoPath);
    const cesoSheetName = cesoWorkbook.SheetNames[0];
    const cesoData = XLSX.utils.sheet_to_json(cesoWorkbook.Sheets[cesoSheetName]);

    console.log(`📊 Found ${cesoData.length} CESO users in Excel`);

    for (const userData of cesoData) {
      // Clean and format user data
      const user = {
        nombre: userData.nombre || userData.Nombre || '',
        correo: userData.correo || userData.Correo || userData.email || '',
        rol: userData.rol || userData.Rol || 'Comite',
        contrasena: userData.contrasena || userData.Contraseña || userData.password || '',
        organization: 'CESO',
        permissions: userData.rol === 'Administrador' ? ['view', 'download', 'upload', 'edit', 'admin'] :
                   userData.rol === 'Federal' ? ['view', 'download', 'upload', 'edit'] :
                   ['view', 'download'],
        createdAt: new Date().toISOString(),
        source: 'excel_import'
      };

      if (user.correo && user.nombre) {
        await addDoc(collection(db, 'users_ceso'), user);
        console.log(`✅ Added CESO user: ${user.nombre} (${user.correo}) - ${user.rol}`);
      } else {
        console.warn(`⚠️ Skipped incomplete CESO user:`, userData);
      }
    }

    // Upload APHIS users from Excel
    console.log('\n📤 Loading APHIS users from Excel...');
    const aphisPath = path.join(__dirname, 'BASES DATOS', 'usuarios_aphis-usda_new_web_app_updated.xlsx');
    
    if (!fs.existsSync(aphisPath)) {
      console.error('❌ APHIS Excel file not found:', aphisPath);
      return;
    }

    const aphisWorkbook = XLSX.readFile(aphisPath);
    const aphisSheetName = aphisWorkbook.SheetNames[0];
    const aphisData = XLSX.utils.sheet_to_json(aphisWorkbook.Sheets[aphisSheetName]);

    console.log(`📊 Found ${aphisData.length} APHIS users in Excel`);

    for (const userData of aphisData) {
      // Clean and format user data
      const user = {
        nombre: userData.nombre || userData.Nombre || '',
        correo: userData.correo || userData.Correo || userData.email || '',
        rol: userData.rol || userData.Rol || 'Comite',
        contrasena: userData.contrasena || userData.Contraseña || userData.password || '',
        organization: 'APHIS',
        permissions: userData.rol === 'Administrador' ? ['view', 'download', 'upload', 'edit', 'admin'] :
                   userData.rol === 'Federal' ? ['view', 'download', 'upload', 'edit'] :
                   ['view', 'download'],
        createdAt: new Date().toISOString(),
        source: 'excel_import'
      };

      if (user.correo && user.nombre) {
        await addDoc(collection(db, 'users_aphis'), user);
        console.log(`✅ Added APHIS user: ${user.nombre} (${user.correo}) - ${user.rol}`);
      } else {
        console.warn(`⚠️ Skipped incomplete APHIS user:`, userData);
      }
    }

    // Verify upload
    console.log('\n🔍 Verifying upload...');
    const cesoSnapshot = await getDocs(collection(db, 'users_ceso'));
    const aphisSnapshot = await getDocs(collection(db, 'users_aphis'));
    
    console.log(`✅ CESO users in Firebase: ${cesoSnapshot.size}`);
    console.log(`✅ APHIS users in Firebase: ${aphisSnapshot.size}`);

    // Check for admin users
    const cesoAdmins = [];
    const aphisAdmins = [];
    
    cesoSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.rol === 'Administrador') {
        cesoAdmins.push(userData);
      }
    });
    
    aphisSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.rol === 'Administrador') {
        aphisAdmins.push(userData);
      }
    });

    console.log(`\n👑 CESO Administrators: ${cesoAdmins.length}`);
    cesoAdmins.forEach(admin => console.log(`   - ${admin.nombre} (${admin.correo})`));
    
    console.log(`👑 APHIS Administrators: ${aphisAdmins.length}`);
    aphisAdmins.forEach(admin => console.log(`   - ${admin.nombre} (${admin.correo})`));

    console.log('\n🎉 User data upload completed successfully!');
    console.log('📊 Collections populated: users_ceso and users_aphis');
    console.log('🔐 You should now be able to login with your credentials!');

  } catch (error) {
    console.error('❌ Error uploading user data:', error);
  } finally {
    process.exit(0);
  }
}

uploadUsersFromExcel();