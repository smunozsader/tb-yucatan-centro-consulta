// Language Context for bilingual support (Spanish ↔ English)
import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

const translations = {
  es: {
    // Navigation
    title: "Centro de Consulta de Acuerdos",
    subtitle: "Sanidad Pecuaria Yucatán",
    
    // Loading states
    loading: "Cargando datos de consulta...",
    errorLoading: "Error al cargar los datos",
    
    // Main sections
    summary: "Resumen de Acuerdos",
    navigation: "Navegación Principal",
    pending: "Acuerdos Pendientes",
    overdue: "Acuerdos Vencidos - Requieren Atención",
    dashboard: "Tablero de Acuerdos",
    dashboardDesc: "Gestión completa de acuerdos y seguimiento",
    goToDashboard: "Ir al Tablero",
    repository: "Repositorio de Documentos",
    repositoryDesc: "Actas firmadas y documentos oficiales",
    viewDocs: "Ver Documentos",
    profile: "Mi Perfil",
    profileDesc: "Información personal y configuración",
    settings: "Configurar",
    messages: "Mensajes",
    messagesDesc: "Sistema de convocatorias (Solo Administradores)",
    goToMessages: "Ir a Mensajes",
    logout: "Salir",
    
    // Statistics
    stats: {
      total: "Total",
      pending: "Pendientes",
      overdue: "Vencidos",
      inProgress: "En Progreso",
      completed: "Completados"
    },
    
    // Table headers
    table: {
      id: "ID Acuerdo",
      description: "Descripción",
      responsible: "Responsable",
      meetingDate: "Fecha Reunión",
      complianceDate: "Fecha Cumplimiento",
      status: "Estado",
      source: "Fuente",
      evidence: "Evidencia",
      actions: "Acciones"
    },
    
    // Status values
    status: {
      pending: "Pendiente",
      inProgress: "En Progreso",
      completed: "Completado",
      overdue: "Vencido"
    },
    
    // Evidence system
    evidence: {
      title: "Sistema de Evidencias",
      upload: "Subir Evidencia",
      download: "Descargar",
      view: "Ver Evidencias",
      noFiles: "No hay evidencias subidas",
      uploadSuccess: "Evidencia subida exitosamente",
      markCompleted: "Marcar como Cumplido"
    }
  },
  
  en: {
    // Navigation
    title: "Agreement Consultation Center",
    subtitle: "Animal Health Yucatan",
    
    // Loading states
    loading: "Loading consultation data...",
    errorLoading: "Error loading data",
    
    // Main sections
    summary: "Agreement Summary",
    navigation: "Main Navigation",
    pending: "Pending Agreements",
    overdue: "Overdue Agreements - Require Attention",
    dashboard: "Agreement Dashboard",
    dashboardDesc: "Complete agreement management and monitoring",
    goToDashboard: "Go to Dashboard",
    repository: "Document Repository",
    repositoryDesc: "Signed minutes and official documents",
    viewDocs: "View Documents",
    profile: "My Profile",
    profileDesc: "Personal information and settings",
    settings: "Settings",
    messages: "Messages",
    messagesDesc: "Meeting notification system (Administrators Only)",
    goToMessages: "Go to Messages",
    logout: "Logout",
    
    // Statistics
    stats: {
      total: "Total",
      pending: "Pending",
      overdue: "Overdue",
      inProgress: "In Progress",
      completed: "Completed"
    },
    
    // Table headers
    table: {
      id: "Agreement ID",
      description: "Description",
      responsible: "Responsible",
      meetingDate: "Meeting Date",
      complianceDate: "Compliance Date",
      status: "Status",
      source: "Source",
      evidence: "Evidence",
      actions: "Actions"
    },
    
    // Status values
    status: {
      pending: "Pending",
      inProgress: "In Progress",
      completed: "Completed",
      overdue: "Overdue"
    },
    
    // Evidence system
    evidence: {
      title: "Evidence System",
      upload: "Upload Evidence",
      download: "Download",
      view: "View Evidence",
      noFiles: "No evidence uploaded",
      uploadSuccess: "Evidence uploaded successfully",
      markCompleted: "Mark as Completed"
    }
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('es') // Default to Spanish

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es')
  }

  const contextValue = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isSpanish: language === 'es',
    isEnglish: language === 'en'
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext