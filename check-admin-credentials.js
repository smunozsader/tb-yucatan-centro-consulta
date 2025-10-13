const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Initialize Firebase with client SDK
const firebaseConfig = require('./__/firebase/init.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAdminCredentials() {
  try {
    console.log('🔍 Checking admin credentials in Firebase database...\n');

    // Check for admin users in CESO collection
    console.log('🔐 CESO ADMINISTRATORS:');
    const cesoQuery = query(collection(db, 'users_ceso'), where('rol', '==', 'Administrador'));
    const cesoAdminSnapshot = await getDocs(cesoQuery);
    
    if (cesoAdminSnapshot.empty) {
      console.log('   ❌ No administrators found in CESO');
    } else {
      cesoAdminSnapshot.forEach(doc => {
        const userData = doc.data();
        console.log(`   👤 ${userData.nombre}`);
        console.log(`   📧 ${userData.correo}`);
        console.log(`   🔑 ${userData.contrasena}`);
        console.log(`   📊 Rol: ${userData.rol}`);
        console.log('');
      });
    }

    // Check for admin users in APHIS collection
    console.log('🔐 APHIS ADMINISTRATORS:');
    const aphisQuery = query(collection(db, 'users_aphis'), where('rol', '==', 'Administrador'));
    const aphisAdminSnapshot = await getDocs(aphisQuery);
    
    if (aphisAdminSnapshot.empty) {
      console.log('   ❌ No administrators found in APHIS');
    } else {
      aphisAdminSnapshot.forEach(doc => {
        const userData = doc.data();
        console.log(`   👤 ${userData.nombre}`);
        console.log(`   📧 ${userData.correo}`);
        console.log(`   🔑 ${userData.contrasena}`);
        console.log(`   📊 Rol: ${userData.rol}`);
        console.log('');
      });
    }

    // Check for your specific email
    console.log('🔍 CHECKING FOR SPECIFIC ADMIN EMAIL:');
    const adminEmails = [
      'smunoz.sader@gmail.com',
      'francis.genovez@sader.gob.mx',
      'juan.rodriguez@sader.gob.mx',
      'representacion.yuc@agricultura.gob.mx'
    ];

    for (const email of adminEmails) {
      console.log(`\n📧 Searching for: ${email}`);
      
      // Check CESO
      const cesoUserQuery = query(collection(db, 'users_ceso'), where('correo', '==', email));
      const cesoUserSnapshot = await getDocs(cesoUserQuery);
      if (!cesoUserSnapshot.empty) {
        cesoUserSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log(`   ✅ Found in CESO:`);
          console.log(`      👤 ${userData.nombre}`);
          console.log(`      🔑 ${userData.contrasena}`);
          console.log(`      📊 Rol: ${userData.rol}`);
        });
      }
      
      // Check APHIS
      const aphisUserQuery = query(collection(db, 'users_aphis'), where('correo', '==', email));
      const aphisUserSnapshot = await getDocs(aphisUserQuery);
      if (!aphisUserSnapshot.empty) {
        aphisUserSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log(`   ✅ Found in APHIS:`);
          console.log(`      👤 ${userData.nombre}`);
          console.log(`      🔑 ${userData.contrasena}`);
          console.log(`      📊 Rol: ${userData.rol}`);
        });
      }
      
      if (cesoUserSnapshot.empty && aphisUserSnapshot.empty) {
        console.log(`   ❌ Not found in either collection`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking admin credentials:', error);
  } finally {
    process.exit(0);
  }
}

checkAdminCredentials();