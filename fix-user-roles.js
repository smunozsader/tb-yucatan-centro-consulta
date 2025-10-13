const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, query, where } = require('firebase/firestore');

// Initialize Firebase with client SDK
const firebaseConfig = require('./__/firebase/init.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixUserRoles() {
  try {
    console.log('🔧 Starting user role corrections...\n');
    
    const SERGIO_EMAIL = 'smunoz.sader@gmail.com';
    const updates = [];

    // Function to process a collection
    async function processCollection(collectionName) {
      console.log(`📋 Processing ${collectionName} collection...`);
      
      const snapshot = await getDocs(collection(db, collectionName));
      
      snapshot.forEach(document => {
        const userData = document.data();
        const docId = document.id;
        
        if (userData.rol === 'Administrador') {
          if (userData.correo === SERGIO_EMAIL) {
            console.log(`✅ ${userData.nombre} (${userData.correo}) - Mantiene rol Administrador`);
          } else {
            // Determine appropriate role based on email domain and current info
            let newRole = 'Federal'; // Default
            
            if (userData.correo && userData.correo.includes('yucatan.gob.mx')) {
              newRole = 'Estatal';
            } else if (userData.correo && userData.correo.includes('senasica.gob.mx')) {
              newRole = 'Federal';
            } else if (userData.correo && userData.correo.includes('siniiga.gob.mx')) {
              newRole = 'Siniiga';
            } else if (userData.correo && (userData.correo.includes('@gmail.com') || userData.correo.includes('@hotmail.com') || userData.correo.includes('.org'))) {
              newRole = 'Comite';
            }
            
            updates.push({
              collection: collectionName,
              docId: docId,
              userData: userData,
              newRole: newRole,
              oldRole: userData.rol
            });
            
            console.log(`🔄 ${userData.nombre} (${userData.correo}) - Cambiar de '${userData.rol}' a '${newRole}'`);
          }
        }
      });
    }

    // Process both collections
    await processCollection('users_ceso');
    await processCollection('users_aphis');

    console.log(`\n📊 Total de cambios necesarios: ${updates.length}`);
    
    if (updates.length === 0) {
      console.log('✅ No se necesitan cambios de roles.');
      return;
    }

    // Ask for confirmation
    console.log('\n🤔 ¿Proceder con estos cambios? (y/N)');
    console.log('   Solo Sergio Muñoz mantendrá el rol de Administrador');
    console.log('   Los demás usuarios serán reasignados a roles apropiados\n');

    // Auto-proceed for script execution (in production, you might want user input)
    const proceed = true; // Change to false if you want to review first

    if (proceed) {
      console.log('🚀 Ejecutando cambios...\n');
      
      for (const update of updates) {
        try {
          const docRef = doc(db, update.collection, update.docId);
          await updateDoc(docRef, {
            rol: update.newRole
          });
          
          console.log(`✅ Actualizado: ${update.userData.nombre} -> ${update.newRole} (${update.collection})`);
        } catch (error) {
          console.error(`❌ Error actualizando ${update.userData.nombre}:`, error);
        }
      }
      
      console.log('\n🎉 Roles corregidos exitosamente!');
      console.log(`🔐 Solo Sergio Muñoz (${SERGIO_EMAIL}) mantiene el rol de Administrador`);
      
    } else {
      console.log('❌ Operación cancelada');
    }

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    process.exit(0);
  }
}

fixUserRoles();