const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Initialize Firebase with client SDK (same as website)
const firebaseConfig = require('./__/firebase/init.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testClientAccess() {
  try {
    console.log('🔍 Testing client access to user collections...\n');

    // Test CESO users access
    console.log('📋 Testing CESO collection access...');
    const cesoSnapshot = await getDocs(collection(db, 'users_ceso'));
    console.log(`✅ CESO Collection accessible: ${cesoSnapshot.size} users`);
    
    cesoSnapshot.forEach((doc, index) => {
      const user = doc.data();
      if (index < 3) { // Show first 3 users
        console.log(`  ${index + 1}. ${user.nombre} (${user.correo}) - ${user.rol}`);
      }
    });

    // Test APHIS users access
    console.log('\n📋 Testing APHIS collection access...');
    const aphisSnapshot = await getDocs(collection(db, 'users_aphis'));
    console.log(`✅ APHIS Collection accessible: ${aphisSnapshot.size} users`);
    
    aphisSnapshot.forEach((doc, index) => {
      const user = doc.data();
      if (index < 3) { // Show first 3 users
        console.log(`  ${index + 1}. ${user.nombre} (${user.correo}) - ${user.rol}`);
      }
    });

    // Test admin access specifically
    console.log('\n🔐 Testing admin access...');
    let adminFound = false;
    
    [...cesoSnapshot.docs, ...aphisSnapshot.docs].forEach(doc => {
      const user = doc.data();
      if (user.correo === 'smunoz.sader@gmail.com') {
        console.log(`👑 Admin found in ${user.organization}:`);
        console.log(`   Email: ${user.correo}`);
        console.log(`   Role: ${user.rol}`);
        console.log(`   Password set: ${user.contrasena ? 'Yes' : 'No'}`);
        adminFound = true;
      }
    });

    if (adminFound) {
      console.log('\n✅ Client SDK can successfully read user collections!');
      console.log('🎯 auth-system.js should now work correctly');
      console.log('🔗 Test login at: https://ceso-aphis-yuc.web.app');
    } else {
      console.log('\n❌ Admin user not found in collections');
    }

  } catch (error) {
    console.error('❌ Error testing client access:', error);
    if (error.code === 'permission-denied') {
      console.error('🚫 Permission denied - check Firestore rules');
    }
  } finally {
    process.exit(0);
  }
}

testClientAccess();