/**
 * Authentication System for Centro de Consulta de Acuerdos Sanitarios
 * Government of Mexico - Yucatan - SADER
 * Official gob.mx v3 framework integration
 */
class GobMXAuthSystem {
  constructor() {
    this.currentUser = null;
    this.sessionKey = 'gobmx_session_ceso_aphis';
    this.initializeUserDatabases();
    this.checkExistingSession();
  }

  initializeUserDatabases() {
    // NOTE: This in-memory user database is for local development and testing ONLY.
    // Do NOT store real credentials here. Replace entries with placeholder accounts
    // or configure the Firebase Auth emulator for safe E2E tests.

    // CESO Users (development placeholders)
    this.cesoUsers = [
      { nombre: "Usuario CESO 1", correo: "ceso.user1@example.local", rol: "Administrador", contrasena: "dev-pass-ceso-1", organization: "CESO", permissions: ["view","download","upload","edit"] },
      { nombre: "Usuario CESO 2", correo: "ceso.user2@example.local", rol: "Federal", contrasena: "dev-pass-ceso-2", organization: "CESO", permissions: ["view","download","upload"] }
    ];

    // APHIS Users (development placeholders)
    this.aphisUsers = [
      { nombre: "Usuario APHIS 1", correo: "aphis.user1@example.local", rol: "Administrador", contrasena: "dev-pass-aphis-1", organization: "APHIS", permissions: ["view","download","upload","edit"] },
      { nombre: "Usuario APHIS 2", correo: "aphis.user2@example.local", rol: "Comite", contrasena: "dev-pass-aphis-2", organization: "APHIS", permissions: ["view","download"] }
    ];
  }

  // Authentication method
  authenticate(email, password, organization) {
    const userDatabase = organization === 'CESO' ? this.cesoUsers : this.aphisUsers;
    const normalizedEmail = (email || '').toLowerCase();
    console.debug('[auth-system] authenticate() called for', { email: normalizedEmail, organization });

    const user = userDatabase.find(u => {
      const match = (u.correo || '').toLowerCase() === normalizedEmail && u.contrasena === password;
      if (match) console.debug('[auth-system] user matched in database:', { correo: u.correo, nombre: u.nombre, rol: u.rol });
      return match;
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

// Initialize global authentication system
window.gobmxAuth = new GobMXAuthSystem();

// Console log for debugging
console.log('🔐 GobMX Authentication System Initialized');
console.log('📊 CESO Users:', window.gobmxAuth.cesoUsers.length);
console.log('🇺🇸 APHIS Users:', window.gobmxAuth.aphisUsers.length);