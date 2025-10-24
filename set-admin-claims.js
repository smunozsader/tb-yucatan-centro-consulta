// Script to set admin custom claims for Firebase Authentication users
// This script uses Firebase Admin SDK to grant admin privileges to specific users

require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || 'ceso-aphis-yuc'
});

/**
 * Set custom claims for a user with specific role
 * @param {string} uid - Firebase Auth user UID
 * @param {string} role - User role (ADMINISTRATOR, RESPONSABLE, PUBLIC)
 */
async function setUserRole(uid, role = 'PUBLIC') {
  try {
    console.log(`Setting role '${role}' for user ${uid}...`);

    const isAdmin = role === 'ADMINISTRATOR';
    const claims = {
      admin: isAdmin,
      role: role
    };

    await admin.auth().setCustomUserClaims(uid, claims);

    console.log(`✅ Role set successfully for user ${uid}`);
    console.log(`   - role: ${role}`);
    console.log(`   - admin: ${isAdmin}`);

    // Force token refresh by getting user data
    const userRecord = await admin.auth().getUser(uid);
    console.log(`   - Email: ${userRecord.email}`);
    console.log(`   - Display Name: ${userRecord.displayName || 'N/A'}`);

    return userRecord;
  } catch (error) {
    console.error(`❌ Error setting role for user ${uid}:`, error.message);
    throw error;
  }
}

/**
 * Set admin custom claims for a user
 * @param {string} uid - Firebase Auth user UID
 * @param {boolean} isAdmin - Whether to grant admin privileges
 */
async function setAdminClaims(uid, isAdmin = true) {
  const role = isAdmin ? 'ADMINISTRATOR' : 'PUBLIC';
  return setUserRole(uid, role);
}

/**
 * List all users with their custom claims
 */
async function listUsersWithClaims() {
  try {
    console.log('Listing all users with custom claims...\n');

    const listUsersResult = await admin.auth().listUsers(1000);

    console.log(`Found ${listUsersResult.users.length} users:\n`);

    listUsersResult.users.forEach((userRecord) => {
      const claims = userRecord.customClaims || {};
      const isAdmin = claims.admin === true;
      const role = claims.role || 'PUBLIC';

      console.log(`UID: ${userRecord.uid}`);
      console.log(`Email: ${userRecord.email}`);
      console.log(`Display Name: ${userRecord.displayName || 'N/A'}`);
      console.log(`Admin: ${isAdmin}`);
      console.log(`Role: ${role}`);
      console.log(`Created: ${userRecord.metadata.creationTime}`);
      console.log(`Last Sign In: ${userRecord.metadata.lastSignInTime || 'Never'}`);
      console.log('---');
    });

    return listUsersResult.users;
  } catch (error) {
    console.error('Error listing users:', error.message);
    throw error;
  }
}

/**
 * Grant responsible role to a specific email address
 */
async function grantResponsibleToEmail(email) {
  try {
    console.log(`Processing ${email} for RESPONSIBLE role...`);

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${userRecord.displayName || userRecord.email} (UID: ${userRecord.uid})`);

    // Set responsible role
    await setUserRole(userRecord.uid, 'RESPONSABLE');
    console.log(`✅ RESPONSIBLE role granted to ${email}\n`);

  } catch (error) {
    console.error(`❌ Error processing ${email}:`, error.message);
    console.log('');
  }
}

/**
 * Set user role by email address
 */
async function setUserRoleByEmail(email, role) {
  try {
    console.log(`Setting role '${role}' for ${email}...`);

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${userRecord.displayName || userRecord.email} (UID: ${userRecord.uid})`);

    // Set role
    await setUserRole(userRecord.uid, role);
    console.log(`✅ Role '${role}' set for ${email}\n`);

  } catch (error) {
    console.error(`❌ Error processing ${email}:`, error.message);
    console.log('');
  }
}

// Main execution logic
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🔥 Firebase Admin Claims Manager\n');
  console.log(`Project: ${process.env.FIREBASE_PROJECT_ID || 'ceso-aphis-yuc'}\n`);

  try {
    switch (command) {
      case 'list':
        await listUsersWithClaims();
        break;

      case 'grant-admin':
        const email = args[1];
        if (!email) {
          console.error('❌ Error: Please provide an email address');
          console.log('Usage: node set-admin-claims.js grant-admin user@example.com');
          process.exit(1);
        }
        await grantAdminToEmails([email]);
        break;

      case 'grant-admins':
        // Pre-defined list of administrator emails
        const adminEmails = [
          'admin@ceso.gob.mx',
          'admin@senasica.gob.mx',
          // Add your actual admin emails here
        ];
        await grantAdminToEmails(adminEmails);
        break;

      case 'set-responsible':
        const respEmail = args[1];
        if (!respEmail) {
          console.error('❌ Error: Please provide an email address');
          console.log('Usage: node set-admin-claims.js set-responsible user@example.com');
          process.exit(1);
        }
        await grantResponsibleToEmail(respEmail);
        break;

      case 'set-role':
        const roleEmail = args[1];
        const userRole = args[2];
        if (!roleEmail || !userRole) {
          console.error('❌ Error: Please provide email and role');
          console.log('Usage: node set-admin-claims.js set-role user@example.com RESPONSABLE');
          console.log('Roles: ADMINISTRATOR, RESPONSABLE, PUBLIC');
          process.exit(1);
        }
        await setUserRoleByEmail(roleEmail, userRole);
        break;

      default:
        console.log('Firebase Admin Claims Manager');
        console.log('');
        console.log('Usage:');
        console.log('  node set-admin-claims.js list                    # List all users with claims');
        console.log('  node set-admin-claims.js grant-admin <email>     # Grant admin to specific email');
        console.log('  node set-admin-claims.js set-responsible <email> # Grant responsible role to email');
        console.log('  node set-admin-claims.js set-role <email> <role> # Set specific role (ADMINISTRATOR, RESPONSABLE, PUBLIC)');
        console.log('  node set-admin-claims.js set-uid <uid> [true]    # Set admin claims by UID');
        console.log('');
        console.log('Examples:');
        console.log('  node set-admin-claims.js list');
        console.log('  node set-admin-claims.js grant-admin admin@ceso.gob.mx');
        console.log('  node set-admin-claims.js set-responsible user@domain.com');
        console.log('  node set-admin-claims.js set-role manager@domain.com RESPONSABLE');
        console.log('  node set-admin-claims.js set-uid abc123def456 true');
        console.log('');
        console.log('Roles:');
        console.log('  ADMINISTRATOR - Full admin access + evidence uploads');
        console.log('  RESPONSABLE   - Can upload evidence for their agreements');
        console.log('  PUBLIC        - Read-only access');
        break;
    }

    console.log('\n✅ Operation completed successfully!');
    console.log('\n📝 Note: Users need to sign out and sign back in for custom claims to take effect.');

  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});