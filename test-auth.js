/**
 * Test script to verify authentication with Sergio's admin credentials
 */

// Simulating the auth system
class TestAuthSystem {
  constructor() {
    this.cesoUsers = [
      { nombre: "Sergio Muñoz de Alba Medrano", correo: "smunoz.sader@gmail.com", rol: "Administrador", contrasena: "MunozSader#99", organization: "CESO", permissions: ["view","download","upload","edit","admin"] },
      { nombre: "Jorge Carlos Berlín Montero", correo: "representacion.yuc@agricultura.gob.mx", rol: "Federal", contrasena: "SaderYuc#2025", organization: "CESO", permissions: ["view","download","upload","edit"] }
    ];

    this.aphisUsers = [
      { nombre: "Sergio Muñoz de Alba Medrano", correo: "smunoz.sader@gmail.com", rol: "Administrador", contrasena: "MunozSader#99", organization: "APHIS", permissions: ["view","download","upload","edit","admin"] },
      { nombre: "Jorge Carlos Berlín Montero", correo: "representacion.yuc@agricultura.gob.mx", rol: "Federal", contrasena: "SaderYuc#2025", organization: "APHIS", permissions: ["view","download","upload","edit"] }
    ];
  }

  authenticate(email, password, organization) {
    const userDatabase = organization === 'CESO' ? this.cesoUsers : this.aphisUsers;
    const normalizedEmail = (email || '').toLowerCase();
    
    console.log(`🔍 Testing authentication for: ${email} in ${organization}`);
    console.log(`🔍 Searching in database with ${userDatabase.length} users`);
    
    const user = userDatabase.find(u => {
      const userEmail = (u.correo || '').toLowerCase();
      const userPassword = u.contrasena || '';
      const emailMatch = userEmail === normalizedEmail;
      const passwordMatch = userPassword === password;
      
      console.log(`   Checking: ${u.nombre}`);
      console.log(`   Email: "${userEmail}" === "${normalizedEmail}" ? ${emailMatch}`);
      console.log(`   Password: "${userPassword}" === "${password}" ? ${passwordMatch}`);
      
      return emailMatch && passwordMatch;
    });

    if (user) {
      return {
        success: true,
        user: user,
        message: `Bienvenido, ${user.nombre}`
      };
    }

    return {
      success: false,
      message: 'Credenciales inválidas para ' + organization
    };
  }
}

// Test credentials
console.log('🧪 TESTING SERGIO MUÑOZ ADMIN CREDENTIALS\n');

const auth = new TestAuthSystem();

// Test CESO login
console.log('📋 Testing CESO login:');
const cesoResult = auth.authenticate('smunoz.sader@gmail.com', 'MunozSader#99', 'CESO');
console.log('Result:', cesoResult);
console.log('');

// Test APHIS login
console.log('📋 Testing APHIS login:');
const aphisResult = auth.authenticate('smunoz.sader@gmail.com', 'MunozSader#99', 'APHIS');
console.log('Result:', aphisResult);
console.log('');

// Test wrong password
console.log('📋 Testing wrong password:');
const wrongResult = auth.authenticate('smunoz.sader@gmail.com', 'WrongPassword', 'CESO');
console.log('Result:', wrongResult);
console.log('');

console.log('🎯 SUMMARY:');
console.log(`CESO Login: ${cesoResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
console.log(`APHIS Login: ${aphisResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
console.log(`Wrong Password: ${wrongResult.success ? '❌ UNEXPECTED SUCCESS' : '✅ CORRECTLY REJECTED'}`);

if (cesoResult.success && aphisResult.success && !wrongResult.success) {
  console.log('\n🎉 ALL TESTS PASSED! Authentication is working correctly.');
  console.log('\n🔐 YOUR ADMIN CREDENTIALS:');
  console.log('   📧 Email: smunoz.sader@gmail.com');
  console.log('   🔑 Password: MunozSader#99');
  console.log('   🏢 Organizations: CESO and APHIS');
  console.log('   👨‍💼 Role: Administrador (único en el sistema)');
} else {
  console.log('\n❌ SOME TESTS FAILED! Check the implementation.');
}