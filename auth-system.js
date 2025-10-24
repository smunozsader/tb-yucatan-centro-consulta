/**
 * Authentication System for Centro de Consulta de Acuerdos Sanitarios
 * Government of Mexico - Yucatan - SADER
 * Official gob.mx v3 framework integration
 *
 * This file is safe to include multiple times. The class definition is
 * registered once as window.GobMXAuthSystemClass and a single global
 * instance is created as window.gobmxAuth (if missing).
 */

if (typeof window !== 'undefined' && !window.GobMXAuthSystemClass) {
  (function () {
    class GobMXAuthSystem {
      constructor() {
        this.currentUser = null;
        this.sessionKey = 'gobmx_session_ceso_aphis';
        this.cesoUsers = [];
        this.aphisUsers = [];
        this.usersLoaded = false;
        this.initializeFirebase();
        this.checkExistingSession();
      }

      async initializeFirebase() {
        // Wait for Firebase to be available
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
          this.db = firebase.firestore();
          await this.loadUsersFromFirebase();
        } else {
          console.warn('[auth-system] Firebase not available, using placeholder users');
          this.initializePlaceholderUsers();
        }
      }

      initializePlaceholderUsers() {
        // Real users from Firebase database for development/fallback - Updated Oct 2025
        this.cesoUsers = [
          { nombre: "Sergio Muñoz de Alba Medrano", correo: "smunoz.sader@gmail.com", rol: "Administrador", contrasena: "MunozSader#99", organization: "CESO", permissions: ["view","download","upload","edit","admin"] },
          { nombre: "Jorge Carlos Berlín Montero", correo: "representacion.yuc@agricultura.gob.mx", rol: "Federal", contrasena: "SaderYuc#2025", organization: "CESO", permissions: ["view","download","upload","edit"] },
          { nombre: "Francis A. Genovés Chanona", correo: "francis.genoves@siniiga.gob.mx", rol: "Siniiga", contrasena: "GenovedChanona#45", organization: "CESO", permissions: ["view","download","upload"] },
          { nombre: "Luis Martín Flores Martínez", correo: "luis.floresm@yct.agricultura.gob.mx", rol: "Federal", contrasena: "FloresMartinez#78", organization: "CESO", permissions: ["view","download","upload"] }
        ];

        this.aphisUsers = [
          { nombre: "Sergio Muñoz de Alba Medrano", correo: "smunoz.sader@gmail.com", rol: "Administrador", contrasena: "MunozSader#99", organization: "APHIS", permissions: ["view","download","upload","edit","admin"] },
          { nombre: "Jorge Carlos Berlín Montero", correo: "representacion.yuc@agricultura.gob.mx", rol: "Federal", contrasena: "SaderYuc#2025", organization: "APHIS", permissions: ["view","download","upload","edit"] },
          { nombre: "Francis A. Genovés Chanona", correo: "francis.genoves@siniiga.gob.mx", rol: "Siiniiga", contrasena: "GenovedChanona#45", organization: "APHIS", permissions: ["view","download","upload"] },
          { nombre: "C. Noé J. Cepeda Lizama", correo: "noe.cepeda@ugroy.mx", rol: "Comite", contrasena: "APHISComite2025", organization: "APHIS", permissions: ["view","download"] }
        ];

        this.usersLoaded = true;
        console.log('[auth-system] Loaded fallback users - authentication ready');
      }

      async loadUsersFromFirebase() {
        try {
          console.log('[auth-system] Loading users from Firebase...');

          // Ensure we have an authenticated client user before attempting reads.
          // Firestore rules require `request.auth != null` for these collections.
          let currentUser = (firebase && firebase.auth && firebase.auth().currentUser) || null;
          if (!currentUser) {
            console.log('[auth-system] No client auth user yet — waiting up to 5s for onAuthStateChanged');
            currentUser = await new Promise(resolve => {
              let resolved = false;
              const timer = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  try { unsubscribe && unsubscribe(); } catch (e) {}
                  resolve(null);
                }
              }, 5000);
              let unsubscribe = null;
              try {
                unsubscribe = firebase.auth().onAuthStateChanged(user => {
                  if (!resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    try { unsubscribe && unsubscribe(); } catch (e) {}
                    resolve(user || null);
                  }
                });
              } catch (e) {
                clearTimeout(timer);
                resolve(null);
              }
            });
          }

          console.log('[auth-system] Auth user after wait:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : null);

          if (!currentUser) {
            console.warn('[auth-system] No authenticated client user available — skipping Firebase user load to avoid PERMISSION_DENIED. Using placeholder users.');
            this.initializePlaceholderUsers();
            return;
          }

          // Log ID token claims for debugging (custom claims)
          try {
            const idTokenResult = await currentUser.getIdTokenResult();
            console.log('[auth-system] ID token claims:', idTokenResult.claims);
          } catch (e) {
            console.warn('[auth-system] Failed to get ID token claims:', e && e.message ? e.message : e);
          }

          // Load CESO users
          const cesoSnapshot = await this.db.collection('users_ceso').get();
          this.cesoUsers = cesoSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            organization: 'CESO'
          }));

          // Load APHIS users
          const aphisSnapshot = await this.db.collection('users_aphis').get();
          this.aphisUsers = aphisSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            organization: 'APHIS'
          }));

          this.usersLoaded = true;
          console.log(`[auth-system] ✅ Loaded ${this.cesoUsers.length} CESO users and ${this.aphisUsers.length} APHIS users from Firebase`);
          
          // Log admin users for debugging
          const cesoAdmins = this.cesoUsers.filter(u => u.rol === 'Administrador');
          const aphisAdmins = this.aphisUsers.filter(u => u.rol === 'Administrador');
          console.log(`[auth-system] 👑 CESO Admins: ${cesoAdmins.length}`, cesoAdmins.map(u => u.correo));
          console.log(`[auth-system] 👑 APHIS Admins: ${aphisAdmins.length}`, aphisAdmins.map(u => u.correo));

        } catch (error) {
          console.error('[auth-system] Error loading users from Firebase:', error);
          // Helpful debug info: print Firebase client auth state and token claims if available
          try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
              const fbUser = firebase.auth().currentUser;
              console.log('[auth-system] Firebase client currentUser:', fbUser);
              if (fbUser && typeof fbUser.getIdTokenResult === 'function') {
                fbUser.getIdTokenResult().then(id => {
                  console.log('[auth-system] Firebase ID token claims:', id && id.claims ? id.claims : {});
                }).catch(idErr => {
                  console.warn('[auth-system] Failed to retrieve ID token claims for currentUser:', idErr && idErr.message ? idErr.message : idErr);
                });
              }
            } else {
              console.log('[auth-system] Firebase SDK not available to inspect auth state');
            }
          } catch (logErr) {
            console.warn('[auth-system] Error while logging firebase auth state:', logErr);
          }
          console.warn('[auth-system] Falling back to placeholder users');
          this.initializePlaceholderUsers();
        }
      }

      // Authentication method
      async authenticate(email, password, organization) {
        console.log('[auth-system] 🔍 authenticate() called with:', { email, organization, passwordLength: password ? password.length : 0 });

        // Wait for users to be loaded if not already loaded
        if (!this.usersLoaded) {
          console.log('[auth-system] ⏳ Waiting for users to load...');
          let attempts = 0;
          while (!this.usersLoaded && attempts < 50) { // Wait up to 5 seconds
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          if (!this.usersLoaded) {
            console.error('[auth-system] ⏰ Users failed to load, authentication unavailable');
            return {
              success: false,
              message: 'Sistema de autenticación no disponible. Intente nuevamente.'
            };
          }
        }

        const userDatabase = organization === 'CESO' ? this.cesoUsers : this.aphisUsers;
        const normalizedEmail = (email || '').toLowerCase();
        console.log('[auth-system] 🔍 Searching in', organization, 'database with', userDatabase.length, 'users');
        console.log('[auth-system] 📧 Looking for email:', normalizedEmail);

        const user = userDatabase.find(u => {
          const userEmail = (u.correo || '').toLowerCase();
          const userPassword = u.contrasena || '';
          const emailMatch = userEmail === normalizedEmail;
          const passwordMatch = userPassword === password;
          console.log('[auth-system] 🔍 Checking user:', u.nombre, '- Email match:', emailMatch, '- Password match:', passwordMatch);
          if (emailMatch && passwordMatch) {
            console.log('[auth-system] ✅ User matched:', { correo: u.correo, nombre: u.nombre, rol: u.rol });
            return true;
          }
          return false;
        });

        if (user) {
          this.currentUser = {
            ...user,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId()
          };

          // Store session
          try {
            sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
            console.debug('[auth-system] session stored with key', this.sessionKey);
          } catch (e) {
            console.warn('[auth-system] failed to store session in sessionStorage', e);
          }

          // Best-effort: if Firebase client SDK is available, attempt to sign the
          // client into Firebase Auth using email/password so firebase.auth().currentUser
          // is populated. This avoids storage/unauthorized errors when the app user
          // is authenticated by the local system but not signed into Firebase.
          try {
            if (typeof firebase !== 'undefined' && firebase.auth && typeof firebase.auth().signInWithEmailAndPassword === 'function') {
              // Use the same credentials the user supplied (password) to sign in.
              // This will succeed only if a corresponding Firebase Auth user exists.
              firebase.auth().signInWithEmailAndPassword(user.correo || user.email || normalizedEmail, user.contrasena || '')
                .then(() => {
                  console.log('[auth-system] 🔐 Signed into Firebase Auth for client user:', user.correo || user.email || normalizedEmail);
                })
                .catch(signInErr => {
                  // Not fatal — continue using local session; log details for debugging
                  console.warn('[auth-system] Could not sign into Firebase client automatically:', signInErr && signInErr.message ? signInErr.message : signInErr);
                });
            }
          } catch (fbSignErr) {
            console.warn('[auth-system] Error attempting Firebase client sign-in:', fbSignErr);
          }

          return {
            success: true,
            user: this.currentUser,
            message: `Bienvenido, ${user.nombre}`
          };
        }

        console.debug('[auth-system] no matching user found for', normalizedEmail, 'in', organization);
        return {
          success: false,
          message: 'Credenciales inválidas para ' + organization
        };
      }

      // Check existing session
      checkExistingSession() {
        const sessionData = sessionStorage.getItem(this.sessionKey);
        if (sessionData) {
          try {
            const userData = JSON.parse(sessionData);
            // Check if session is less than 8 hours old
            const loginTime = new Date(userData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 8) {
              this.currentUser = userData;
              // Best-effort: sign the Firebase client in using stored credentials
              // so firebase.auth().currentUser is populated. This will only
              // succeed if a matching Firebase Auth user exists.
              try {
                if (typeof firebase !== 'undefined' && firebase.auth && typeof firebase.auth().signInWithEmailAndPassword === 'function') {
                  const email = userData.correo || userData.email || '';
                  const pwd = userData.contrasena || '';
                  if (email && pwd) {
                    firebase.auth().signInWithEmailAndPassword(email, pwd)
                      .then(() => console.log('[auth-system] Restored session: signed into Firebase client for', email))
                      .catch(err => console.warn('[auth-system] Could not sign Firebase client during session restore:', err && err.message ? err.message : err));
                  }
                }
              } catch (signErr) {
                console.warn('[auth-system] Error attempting Firebase sign-in during session restore:', signErr);
              }
              return true;
            } else {
              this.logout();
            }
          } catch (e) {
            this.logout();
          }
        }
        return false;
      }

      // Permission checking
      hasPermission(action) {
        if (!this.currentUser) return false;
        return this.currentUser.permissions.includes(action);
      }

      // Role checking
      hasRole(role) {
        if (!this.currentUser) return false;
        return this.currentUser.rol === role;
      }

      // Organization access
      getOrganization() {
        return this.currentUser?.organization || null;
      }

      // Check if user is logged in
      isAuthenticated() {
        return this.currentUser !== null;
      }

      // Get current user
      getCurrentUser() {
        return this.currentUser;
      }

      // Logout
      logout() {
        this.currentUser = null;
        sessionStorage.removeItem(this.sessionKey);
        // Redirect to main page
        try {
          if (typeof firebase !== 'undefined' && firebase.auth && typeof firebase.auth().signOut === 'function') {
            firebase.auth().signOut().catch(() => {});
          }
        } catch (e) {
          // ignore
        }
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }

      // Generate session ID
      generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      }

      // Get role display name
      getRoleDisplayName() {
        const roleNames = {
          'Federal': 'Gobierno Federal',
          'Administrador': 'Administrador del Sistema', 
          'Estatal': 'Gobierno Estatal',
          'Comite': 'Miembro del Comité',
          'Siiniiga': 'SIINIIGA'
        };
        return roleNames[this.currentUser?.rol] || this.currentUser?.rol;
      }

      // Get role icon (Bootstrap Icons)
      getRoleIcon() {
        const roleIcons = {
          'Federal': 'bi-award',
          'Administrador': 'bi-gear',
          'Estatal': 'bi-building',
          'Comite': 'bi-people',
          'Siiniiga': 'bi-clipboard'
        };
        return roleIcons[this.currentUser?.rol] || 'bi-person';
      }

      // Get organization icon
      getOrganizationIcon() {
        const orgIcons = {
          'CESO': 'bi-building',
          'APHIS': 'bi-globe'
        };
        return orgIcons[this.currentUser?.organization] || 'bi-question-circle';
      }
    }

    // Register class globally so multiple includes do not redeclare it
    window.GobMXAuthSystemClass = GobMXAuthSystem;
  })();
}

// Initialize global authentication system only once
if (typeof window !== 'undefined' && !window.gobmxAuth) {
  try {
    window.gobmxAuth = new window.GobMXAuthSystemClass();
    console.log('🔐 GobMX Authentication System Initialized');
    console.log('📊 Will load users from Firebase Firestore on initialization');
  } catch (e) {
    console.warn('[auth-system] Failed to initialize GobMXAuthSystem:', e && e.message ? e.message : e);
  }
} else if (typeof window !== 'undefined' && window.gobmxAuth) {
  console.log('[auth-system] GobMXAuthSystem already initialized; skipping re-initialization');
}

/*
  Auth debug widget preserved but commented out.
  (omitted here for brevity)
*/