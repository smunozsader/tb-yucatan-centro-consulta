const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, deleteDoc, getDocs } = require('firebase/firestore');
const XLSX = require('xlsx');
const path = require('path');

// Initialize Firebase with client SDK
const firebaseConfig = require('./__/firebase/init.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadConsolidatedUsers() {
  try {
    console.log('🚀 Starting consolidated user upload to Firebase...\n');

    // Read the consolidated Excel file
    const filePath = path.join(__dirname, 'BASES DATOS', 'usuarios_consolidados.xlsx');
    console.log('📂 Reading file:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const users = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📊 Found ${users.length} users in consolidated file\n`);

    // Clear existing collections first
    console.log('🗑️ Clearing existing user collections...');
    
    // Clear users_ceso
    const cesoSnapshot = await getDocs(collection(db, 'users_ceso'));
    for (const doc of cesoSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Clear users_aphis
    const aphisSnapshot = await getDocs(collection(db, 'users_aphis'));
    for (const doc of aphisSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    console.log('✅ Existing collections cleared\n');

    // Process each user
    let cesoCount = 0;
    let aphisCount = 0;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Log user data for debugging
      console.log(`Processing user ${i + 1}:`, {
        nombre: user.nombre || user.Nombre || user.NOMBRE,
        correo: user.correo || user.Correo || user.CORREO,
        organizations: user.organizaciones || user.Organizaciones || user.ORGANIZACIONES || user.organizations
      });
      
      // Extract user data with multiple possible column names
      const userData = {
        nombre: user.nombre || user.Nombre || user.NOMBRE || '',
        correo: user.correo || user.Correo || user.CORREO || user.email || user.Email || user.EMAIL || '',
        rol: user.rol || user.Rol || user.ROL || 'Comite',
        contrasena: user.contrasena || user.Contrasena || user.CONTRASENA || user.password || user.Password || user.PASSWORD || 'DefaultPass123',
        organizations: user.organizaciones || user.Organizaciones || user.ORGANIZACIONES || user.organizations || user.Organizations || '',
        telefono: user.telefono || user.Telefono || user.TELEFONO || '',
        cargo: user.cargo || user.Cargo || user.CARGO || '',
        dependencia: user.dependencia || user.Dependencia || user.DEPENDENCIA || ''
      };

      // Skip if no email
      if (!userData.correo) {
        console.log(`⚠️ Skipping user ${i + 1}: No email found`);
        continue;
      }

      // Parse organizations
      const orgs = userData.organizations.toString().split(',').map(org => org.trim());
      
      // Add permissions based on role
      if (userData.rol === 'Administrador') {
        userData.permissions = ['view', 'download', 'upload', 'edit', 'admin'];
      } else if (userData.rol === 'Federal') {
        userData.permissions = ['view', 'download', 'upload', 'edit'];
      } else if (userData.rol === 'Estatal') {
        userData.permissions = ['view', 'download', 'upload'];
      } else {
        userData.permissions = ['view', 'download'];
      }

      // Add to CESO collection if user belongs to CESO
      if (orgs.includes('CESO') || orgs.includes('ceso')) {
        await addDoc(collection(db, 'users_ceso'), {
          ...userData,
          organization: 'CESO'
        });
        cesoCount++;
        console.log(`✅ Added to CESO: ${userData.nombre} (${userData.correo})`);
      }

      // Add to APHIS collection if user belongs to APHIS
      if (orgs.includes('APHIS') || orgs.includes('aphis') || orgs.includes('APHIS-USDA')) {
        await addDoc(collection(db, 'users_aphis'), {
          ...userData,
          organization: 'APHIS'
        });
        aphisCount++;
        console.log(`✅ Added to APHIS: ${userData.nombre} (${userData.correo})`);
      }
    }

    console.log('\n🎉 Consolidated user upload completed successfully!');
    console.log(`📊 Results:`);
    console.log(`   - CESO users: ${cesoCount}`);
    console.log(`   - APHIS users: ${aphisCount}`);
    console.log(`   - Total processed: ${users.length}`);

    // Verify Sergio's admin account
    console.log('\n🔍 Verifying Sergio\'s admin account...');
    const cesoVerify = await getDocs(collection(db, 'users_ceso'));
    const aphisVerify = await getDocs(collection(db, 'users_aphis'));
    
    let sergioFound = false;
    [...cesoVerify.docs, ...aphisVerify.docs].forEach(doc => {
      const user = doc.data();
      if (user.correo === 'smunoz.sader@gmail.com') {
        console.log(`✅ Sergio found in ${user.organization}:`, {
          nombre: user.nombre,
          rol: user.rol,
          contrasena: user.contrasena
        });
        sergioFound = true;
      }
    });
    
    if (!sergioFound) {
      console.log('⚠️ Sergio not found, adding manually...');
      const sergioData = {
        nombre: 'Sergio Muñoz de Alba Medrano',
        correo: 'smunoz.sader@gmail.com',
        rol: 'Administrador',
        contrasena: 'MunozSader#99',
        organizations: 'CESO,APHIS',
        permissions: ['view', 'download', 'upload', 'edit', 'admin']
      };
      
      await addDoc(collection(db, 'users_ceso'), { ...sergioData, organization: 'CESO' });
      await addDoc(collection(db, 'users_aphis'), { ...sergioData, organization: 'APHIS' });
      console.log('✅ Sergio added to both collections');
    }

  } catch (error) {
    console.error('❌ Error uploading consolidated users:', error);
  } finally {
    process.exit(0);
  }
}

uploadConsolidatedUsers();