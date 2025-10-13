const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Initialize Firebase with client SDK
const firebaseConfig = require('./__/firebase/init.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsers() {
  try {
    console.log('🔍 Checking users in Firebase database...\n');

    // Check consolidated users collection
    console.log('📋 USERS COLLECTION (Consolidated):');
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      if (usersSnapshot.empty) {
        console.log('   ❌ No users found in "users" collection');
      } else {
        console.log(`   ✅ Found ${usersSnapshot.size} users in consolidated collection`);
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log(`   👤 ${userData.nombre || 'Sin nombre'} (${userData.correo || 'Sin correo'})`);
          console.log(`      - Rol: ${userData.rol || 'No definido'}`);
          console.log(`      - Organizaciones: ${userData.organizations ? userData.organizations.join(', ') : 'No definido'}`);
          console.log(`      - Permisos: ${userData.permissions ? userData.permissions.join(', ') : 'No definido'}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('   ❌ Error accessing "users" collection:', error.message);
    }

    // Check CESO users collection
    console.log('\n📋 USERS_CESO COLLECTION:');
    try {
      const cesoSnapshot = await getDocs(collection(db, 'users_ceso'));
      if (cesoSnapshot.empty) {
        console.log('   ❌ No users found in "users_ceso" collection');
      } else {
        console.log(`   ✅ Found ${cesoSnapshot.size} CESO users`);
        cesoSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log(`   👤 ${userData.nombre || 'Sin nombre'} (${userData.correo || 'Sin correo'})`);
          console.log(`      - Rol: ${userData.rol || 'No definido'}`);
          console.log(`      - Contraseña: ${userData.contrasena ? '✅ Configurada' : '❌ No configurada'}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('   ❌ Error accessing "users_ceso" collection:', error.message);
    }

    // Check APHIS users collection
    console.log('\n📋 USERS_APHIS COLLECTION:');
    try {
      const aphisSnapshot = await getDocs(collection(db, 'users_aphis'));
      if (aphisSnapshot.empty) {
        console.log('   ❌ No users found in "users_aphis" collection');
      } else {
        console.log(`   ✅ Found ${aphisSnapshot.size} APHIS users`);
        aphisSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log(`   👤 ${userData.nombre || 'Sin nombre'} (${userData.correo || 'Sin correo'})`);
          console.log(`      - Rol: ${userData.rol || 'No definido'}`);
          console.log(`      - Contraseña: ${userData.contrasena ? '✅ Configurada' : '❌ No configurada'}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('   ❌ Error accessing "users_aphis" collection:', error.message);
    }

    console.log('\n🔐 CREDENCIALES DE ADMINISTRADOR HARDCODED EN EL SISTEMA:');
    console.log('   CESO:');
    console.log('     📧 francis.genovez@sader.gob.mx');
    console.log('     🔑 CESOAdmin2025');
    console.log('   APHIS:');
    console.log('     📧 juan.rodriguez@sader.gob.mx');
    console.log('     🔑 APHISAdmin2025');
    console.log('   FEDERAL:');
    console.log('     📧 representacion.yuc@agricultura.gob.mx');
    console.log('     🔑 SaderYuc#2025');

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();