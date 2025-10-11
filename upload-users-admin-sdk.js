const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

async function uploadUsersWithAdminSDK() {
  try {
    console.log('🚀 Starting user upload with Firebase Admin SDK...\n');

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
    const cesoSnapshot = await db.collection('users_ceso').get();
    const cesoBatch = db.batch();
    cesoSnapshot.docs.forEach(doc => {
      cesoBatch.delete(doc.ref);
    });
    if (cesoSnapshot.docs.length > 0) {
      await cesoBatch.commit();
    }
    
    // Clear users_aphis
    const aphisSnapshot = await db.collection('users_aphis').get();
    const aphisBatch = db.batch();
    aphisSnapshot.docs.forEach(doc => {
      aphisBatch.delete(doc.ref);
    });
    if (aphisSnapshot.docs.length > 0) {
      await aphisBatch.commit();
    }
    
    console.log('✅ Existing collections cleared\n');

    // Process each user with batch writes for better performance
    const cesoBatch2 = db.batch();
    const aphisBatch2 = db.batch();
    let cesoCount = 0;
    let aphisCount = 0;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Extract user data with multiple possible column names
      const userData = {
        nombre: user.nombre || user.Nombre || user.NOMBRE || '',
        correo: user.correo || user.Correo || user.CORREO || user.email || user.Email || user.EMAIL || '',
        rol: user.rol || user.Rol || user.ROL || 'Comite',
        contrasena: user.contrasena || user.Contrasena || user.CONTRASENA || user.password || user.Password || user.PASSWORD || 'DefaultPass123',
        organizations: user.organizaciones || user.Organizaciones || user.ORGANIZACIONES || user.organizations || user.Organizations || '',
        telefono: user.telefono || user.Telefono || user.TELEFONO || '',
        cargo: user.cargo || user.Cargo || user.CARGO || '',
        dependencia: user.dependencia || user.Dependencia || user.DEPENDENCIA || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
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

      console.log(`Processing user ${i + 1}: ${userData.nombre} (${userData.correo}) - Orgs: ${orgs.join(', ')}`);

      // Add to CESO collection if user belongs to CESO
      if (orgs.includes('CESO') || orgs.includes('ceso')) {
        const cesoRef = db.collection('users_ceso').doc();
        cesoBatch2.set(cesoRef, {
          ...userData,
          organization: 'CESO'
        });
        cesoCount++;
        console.log(`✅ Queued for CESO: ${userData.nombre}`);
      }

      // Add to APHIS collection if user belongs to APHIS
      if (orgs.includes('APHIS') || orgs.includes('aphis') || orgs.includes('APHIS-USDA')) {
        const aphisRef = db.collection('users_aphis').doc();
        aphisBatch2.set(aphisRef, {
          ...userData,
          organization: 'APHIS'
        });
        aphisCount++;
        console.log(`✅ Queued for APHIS: ${userData.nombre}`);
      }
    }

    // Commit all batches
    console.log('\n📝 Committing CESO users...');
    if (cesoCount > 0) {
      await cesoBatch2.commit();
      console.log(`✅ CESO batch committed: ${cesoCount} users`);
    }

    console.log('📝 Committing APHIS users...');
    if (aphisCount > 0) {
      await aphisBatch2.commit();
      console.log(`✅ APHIS batch committed: ${aphisCount} users`);
    }

    console.log('\n🎉 User upload completed successfully with Admin SDK!');
    console.log(`📊 Results:`);
    console.log(`   - CESO users: ${cesoCount}`);
    console.log(`   - APHIS users: ${aphisCount}`);
    console.log(`   - Total processed: ${users.length}`);

    // Verify upload by reading back
    console.log('\n🔍 Verifying upload...');
    const cesoVerify = await db.collection('users_ceso').get();
    const aphisVerify = await db.collection('users_aphis').get();
    
    console.log(`✅ Verification - CESO: ${cesoVerify.size} docs, APHIS: ${aphisVerify.size} docs`);

    // Check for Sergio specifically
    let sergioFound = false;
    cesoVerify.docs.forEach(doc => {
      const user = doc.data();
      if (user.correo === 'smunoz.sader@gmail.com') {
        console.log(`👑 Sergio found in CESO:`, {
          nombre: user.nombre,
          rol: user.rol,
          organization: user.organization
        });
        sergioFound = true;
      }
    });

    if (!sergioFound) {
      console.log('⚠️ Sergio not found, check the Excel file data');
    }

    console.log('\n🎯 Collections should now be visible in Firebase Console!');
    console.log('🔗 Check at: https://console.firebase.google.com/project/ceso-aphis-yuc/firestore');

  } catch (error) {
    console.error('❌ Error uploading users with Admin SDK:', error);
  } finally {
    process.exit(0);
  }
}

uploadUsersWithAdminSDK();