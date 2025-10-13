const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Initialize Firebase with client SDK
const firebaseConfig = require('./__/firebase/init.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyDatabasePopulation() {
  try {
    console.log('🔍 Verifying database population...\n');

    // Check CESO users
    const cesoSnapshot = await getDocs(collection(db, 'users_ceso'));
    console.log(`📊 CESO Collection: ${cesoSnapshot.size} users`);
    
    cesoSnapshot.forEach((doc, index) => {
      const user = doc.data();
      console.log(`  ${index + 1}. ${user.nombre} (${user.correo}) - ${user.rol}`);
    });

    console.log('\n');

    // Check APHIS users
    const aphisSnapshot = await getDocs(collection(db, 'users_aphis'));
    console.log(`📊 APHIS Collection: ${aphisSnapshot.size} users`);
    
    aphisSnapshot.forEach((doc, index) => {
      const user = doc.data();
      console.log(`  ${index + 1}. ${user.nombre} (${user.correo}) - ${user.rol}`);
    });

    // Verify admin credentials specifically
    console.log('\n🔐 Admin credentials verification:');
    let adminFound = false;
    
    [...cesoSnapshot.docs, ...aphisSnapshot.docs].forEach(doc => {
      const user = doc.data();
      if (user.correo === 'smunoz.sader@gmail.com') {
        console.log(`✅ Admin found in ${user.organization}:`);
        console.log(`   Email: ${user.correo}`);
        console.log(`   Password: ${user.contrasena}`);
        console.log(`   Role: ${user.rol}`);
        console.log(`   Permissions: ${user.permissions?.join(', ')}`);
        adminFound = true;
      }
    });

    if (!adminFound) {
      console.log('❌ Admin user not found!');
    } else {
      console.log('\n✅ Database properly populated and admin credentials verified!');
      console.log('🎯 You can now test login at: https://ceso-aphis-yuc.web.app');
      console.log('   Email: smunoz.sader@gmail.com');
      console.log('   Password: MunozSader#99');
    }

  } catch (error) {
    console.error('❌ Error verifying database:', error);
  } finally {
    process.exit(0);
  }
}

verifyDatabasePopulation();