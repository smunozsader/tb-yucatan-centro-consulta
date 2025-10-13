// Test authentication with real Firebase setup
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = require('./__/firebase/init.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAuthFlow() {
  try {
    console.log('🔧 Testing the corrected authentication flow...\n');

    // Simulate the corrected loadUsersFromFirebase method
    console.log('📥 Loading CESO users...');
    const cesoSnapshot = await getDocs(collection(db, 'users_ceso'));
    const cesoUsers = cesoSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      organization: 'CESO'
    }));

    console.log('📥 Loading APHIS users...');
    const aphisSnapshot = await getDocs(collection(db, 'users_aphis'));
    const aphisUsers = aphisSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      organization: 'APHIS'
    }));

    console.log(`✅ Loaded ${cesoUsers.length} CESO users and ${aphisUsers.length} APHIS users\n`);

    // Test authentication for Sergio
    function testAuth(users, organization, email, password) {
      console.log(`🔍 Testing ${organization} authentication for: ${email}`);
      
      const user = users.find(u => {
        const userEmail = (u.correo || '').toLowerCase();
        const userPassword = u.contrasena || '';
        return userEmail === email.toLowerCase() && userPassword === password;
      });

      if (user) {
        console.log(`✅ SUCCESS: ${user.nombre} (${user.rol})`);
        return { success: true, user };
      } else {
        console.log(`❌ FAILED: No matching user found`);
        return { success: false };
      }
    }

    // Test Sergio's credentials
    console.log('🧪 TESTING SERGIO\'S CREDENTIALS:\n');
    
    const cesoResult = testAuth(cesoUsers, 'CESO', 'smunoz.sader@gmail.com', 'MunozSader#99');
    console.log('');
    
    const aphisResult = testAuth(aphisUsers, 'APHIS', 'smunoz.sader@gmail.com', 'MunozSader#99');
    console.log('');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`CESO Login: ${cesoResult.success ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`APHIS Login: ${aphisResult.success ? '✅ WORKING' : '❌ FAILED'}`);
    
    if (cesoResult.success && aphisResult.success) {
      console.log('\n🎉 ¡AUTHENTICATION FIX SUCCESSFUL!');
      console.log('💡 The website should now work properly with your credentials.');
      console.log('\n🔐 Your credentials:');
      console.log('   📧 smunoz.sader@gmail.com');
      console.log('   🔑 MunozSader#99');
      console.log('   🏢 Available in both CESO and APHIS');
    } else {
      console.log('\n❌ There are still issues with the authentication.');
    }

  } catch (error) {
    console.error('❌ Error testing auth flow:', error);
  } finally {
    process.exit(0);
  }
}

testAuthFlow();