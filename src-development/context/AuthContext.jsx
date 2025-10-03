// Authentication Context for user roles and permissions
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// Mock user roles based on your requirements
const USER_ROLES = {
  PUBLIC: 'public',
  RESPONSIBLE: 'responsible', 
  ADMINISTRATOR: 'administrator'
}

const ROLE_PERMISSIONS = {
  [USER_ROLES.PUBLIC]: [
    'view_agreements',
    'search_agreements',
    'view_evidence',
    'download_evidence'
  ],
  [USER_ROLES.RESPONSIBLE]: [
    'view_agreements',
    'search_agreements', 
    'view_evidence',
    'download_evidence',
    'upload_evidence',
    'mark_completed'
  ],
  [USER_ROLES.ADMINISTRATOR]: [
    'view_agreements',
    'search_agreements',
    'view_evidence', 
    'download_evidence',
    'upload_evidence',
    'mark_completed',
    'manage_users',
    'send_notifications',
    'access_messages'
  ]
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock authentication check
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // For development, we'll simulate different user types
      // In production, this would check Firebase Auth or similar
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user - can be changed for testing different roles
      const mockUser = {
        uid: 'mock-user-1',
        name: 'MVZ. María del Refugio Medina Juárez',
        email: 'mmedia@yucatan.gob.mx',
        role: USER_ROLES.ADMINISTRATOR, // Change this to test different roles
        organization: 'CESO - Yucatán',
        permissions: ROLE_PERMISSIONS[USER_ROLES.ADMINISTRATOR]
      }
      
      setUser(mockUser)
      console.log('👤 User authenticated:', mockUser.name, `(${mockUser.role})`)
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    setLoading(true)
    try {
      // Mock login - in production, use Firebase Auth
      const { email, password } = credentials
      
      // Mock different users for testing
      let mockUser = null
      
      if (email.includes('admin')) {
        mockUser = {
          uid: 'admin-1',
          name: 'Administrador Sistema',
          email: email,
          role: USER_ROLES.ADMINISTRATOR,
          organization: 'SENASICA - Yucatán',
          permissions: ROLE_PERMISSIONS[USER_ROLES.ADMINISTRATOR]
        }
      } else if (email.includes('responsible')) {
        mockUser = {
          uid: 'resp-1', 
          name: 'MVZ. Francis A. Genovez Chanona',
          email: email,
          role: USER_ROLES.RESPONSIBLE,
          organization: 'CESO - Yucatán',
          permissions: ROLE_PERMISSIONS[USER_ROLES.RESPONSIBLE]
        }
      } else {
        mockUser = {
          uid: 'public-1',
          name: 'Usuario Público',
          email: email,
          role: USER_ROLES.PUBLIC,
          organization: 'Público',
          permissions: ROLE_PERMISSIONS[USER_ROLES.PUBLIC]
        }
      }
      
      setUser(mockUser)
      return mockUser
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      // Mock logout
      await new Promise(resolve => setTimeout(resolve, 500))
      setUser(null)
      console.log('👤 User logged out')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission) => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const hasRole = (roles) => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  const isAuthenticated = () => {
    return !!user
  }

  const isPublicUser = () => {
    return !user || user.role === USER_ROLES.PUBLIC
  }

  const isAdministrator = () => {
    return user?.role === USER_ROLES.ADMINISTRATOR
  }

  const isResponsible = () => {
    return user?.role === USER_ROLES.RESPONSIBLE || isAdministrator()
  }

  const contextValue = {
    user,
    loading,
    // Authentication methods
    login,
    logout,
    // Permission checks
    hasPermission,
    hasRole,
    isAuthenticated,
    isPublicUser,
    isAdministrator,
    isResponsible,
    // Constants
    USER_ROLES,
    ROLE_PERMISSIONS
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { USER_ROLES, ROLE_PERMISSIONS }
export default AuthContext