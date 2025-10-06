// Messages Page - System Notifications and Communications
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Messages() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)

  // Mock messages data
  const messages = [
    {
      id: 1,
      type: 'system',
      priority: 'high',
      subject: 'Acuerdo CESO-2024-001 próximo a vencer',
      preview: 'El acuerdo sobre identificación de bovinos vence en 3 días',
      content: 'El acuerdo CESO-2024-001 sobre "Sistema de identificación de bovinos en rancho La Esperanza" tiene fecha de vencimiento el 15 de marzo de 2024. Es necesario revisar el cumplimiento y cargar evidencias antes de la fecha límite.',
      sender: 'Sistema Automático',
      date: '2024-03-12T10:30:00',
      read: false,
      actions: ['view_agreement', 'upload_evidence']
    },
    {
      id: 2,
      type: 'notification',
      priority: 'medium',
      subject: 'Nueva evidencia cargada para APHIS-2024-025',
      preview: 'Juan Pérez ha subido documentación de cumplimiento',
      content: 'Se ha cargado nueva evidencia para el acuerdo APHIS-2024-025 "Control de tuberculosis bovina - Zona Norte". Documentos subidos: certificado_veterinario.pdf, analisis_laboratorio.pdf. La evidencia está pendiente de revisión.',
      sender: 'Juan Pérez (Responsable)',
      date: '2024-03-11T16:45:00',
      read: true,
      actions: ['view_evidence', 'review']
    },
    {
      id: 3,
      type: 'meeting',
      priority: 'high',
      subject: 'Convocatoria Reunión Extraordinaria CESO',
      preview: 'Reunión programada para el 20 de marzo de 2024',
      content: 'Se convoca a reunión extraordinaria del Consejo Estatal de Seguimiento Operativo (CESO) para revisar el cumplimiento de la NOM-001-SAG/GAN-2015. Fecha: 20 de marzo de 2024, 10:00 hrs. Lugar: Oficinas SADER Yucatán. Temas: Revisión de acuerdos vencidos, nuevos protocolos de identificación animal.',
      sender: 'Coordinación CESO',
      date: '2024-03-10T09:15:00',
      read: false,
      actions: ['confirm_attendance', 'view_agenda']
    },
    {
      id: 4,
      type: 'update',
      priority: 'low',
      subject: 'Actualización del sistema v2.5.0',
      preview: 'Nuevas funcionalidades disponibles',
      content: 'El sistema ha sido actualizado a la versión 2.5.0. Nuevas características: Mejoras en el sistema de evidencias, filtros avanzados en el dashboard, soporte mejorado para dispositivos móviles, nuevas plantillas de documentos oficiales.',
      sender: 'Administrador del Sistema',
      date: '2024-03-09T14:20:00',
      read: true,
      actions: ['view_changelog']
    },
    {
      id: 5,
      type: 'reminder',
      priority: 'medium',
      subject: 'Recordatorio: Revisión mensual de acuerdos',
      preview: 'Es momento de realizar la revisión mensual',
      content: 'Recordatorio automático: Es momento de realizar la revisión mensual de todos los acuerdos activos. Por favor, verificar el estado de cumplimiento y actualizar la documentación necesaria. Fecha límite para completar la revisión: 31 de marzo de 2024.',
      sender: 'Sistema Automático',
      date: '2024-03-08T08:00:00',
      read: true,
      actions: ['start_review']
    }
  ]

  const messageTypes = [
    { id: 'all', name: 'Todos', icon: '📬', count: messages.length },
    { id: 'system', name: 'Sistema', icon: '🔔', count: messages.filter(m => m.type === 'system').length },
    { id: 'notification', name: 'Notificaciones', icon: '📢', count: messages.filter(m => m.type === 'notification').length },
    { id: 'meeting', name: 'Reuniones', icon: '📅', count: messages.filter(m => m.type === 'meeting').length },
    { id: 'update', name: 'Actualizaciones', icon: '🚀', count: messages.filter(m => m.type === 'update').length },
    { id: 'reminder', name: 'Recordatorios', icon: '⏰', count: messages.filter(m => m.type === 'reminder').length }
  ]

  const filteredMessages = selectedFilter === 'all' 
    ? messages 
    : messages.filter(m => m.type === selectedFilter)

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return { class: 'bg-danger', text: '🔴 Alta', color: 'text-danger' }
      case 'medium':
        return { class: 'bg-warning', text: '🟡 Media', color: 'text-warning' }
      default:
        return { class: 'bg-success', text: '🟢 Baja', color: 'text-success' }
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'system': return '🔔'
      case 'notification': return '📢'
      case 'meeting': return '📅'
      case 'update': return '🚀'
      case 'reminder': return '⏰'
      default: return '📧'
    }
  }

  const handleActionClick = (action, message) => {
    // In a real implementation, these would trigger actual actions
    const actionLabels = {
      view_agreement: 'Ver Acuerdo',
      upload_evidence: 'Subir Evidencia',
      view_evidence: 'Ver Evidencia',
      review: 'Revisar',
      confirm_attendance: 'Confirmar Asistencia',
      view_agenda: 'Ver Agenda',
      view_changelog: 'Ver Cambios',
      start_review: 'Iniciar Revisión'
    }
    
    alert(`Acción: ${actionLabels[action]}\nMensaje: ${message.subject}`)
  }

  const markAsRead = (messageId) => {
    // In a real implementation, this would update the message status
    console.log('Marking message as read:', messageId)
  }

  if (!user) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card card-governo">
              <div className="card-body text-center">
                <div className="display-1 text-muted mb-3">🔒</div>
                <h3 className="text-governo-principal">Acceso Restringido</h3>
                <p className="text-muted">
                  Debes iniciar sesión para ver tus mensajes
                </p>
                <button className="btn btn-governo-principal">
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid my-5">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-governo-principal-claro p-4 rounded text-white">
            <h1 className="display-5 mb-2">📬 Centro de Mensajes</h1>
            <p className="lead mb-0">
              Notificaciones del sistema, recordatorios y comunicaciones oficiales
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar with Message Types */}
        <div className="col-md-3">
          <div className="card card-governo">
            <div className="card-header bg-governo-secundario text-white">
              <h6 className="mb-0">📂 Categorías</h6>
            </div>
            <div className="list-group list-group-flush">
              {messageTypes.map(type => (
                <button
                  key={type.id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                    selectedFilter === type.id ? 'active bg-governo-principal-claro text-white' : ''
                  }`}
                  onClick={() => setSelectedFilter(type.id)}
                >
                  <span>
                    {type.icon} {type.name}
                  </span>
                  <span className={`badge ${selectedFilter === type.id ? 'bg-light text-dark' : 'bg-governo-principal'}`}>
                    {type.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card card-governo mt-3">
            <div className="card-header bg-governo-verde text-white">
              <h6 className="mb-0">📊 Resumen</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>📬 Total mensajes:</span>
                <strong>{messages.length}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>📭 No leídos:</span>
                <strong className="text-danger">{messages.filter(m => !m.read).length}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>🔴 Prioridad alta:</span>
                <strong className="text-warning">{messages.filter(m => m.priority === 'high').length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="col-md-9">
          {selectedMessage ? (
            /* Message Detail View */
            <div className="card card-governo">
              <div className="card-header bg-governo-principal text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{selectedMessage.subject}</h5>
                    <small>
                      {getTypeIcon(selectedMessage.type)} {selectedMessage.sender} • 
                      {new Date(selectedMessage.date).toLocaleString('es-MX')}
                    </small>
                  </div>
                  <button 
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setSelectedMessage(null)}
                  >
                    ← Volver
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <span className={`badge ${getPriorityBadge(selectedMessage.priority).class} me-2`}>
                    {getPriorityBadge(selectedMessage.priority).text}
                  </span>
                  {!selectedMessage.read && (
                    <span className="badge bg-info">📭 No leído</span>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="lead">{selectedMessage.content}</p>
                </div>
                
                {selectedMessage.actions && selectedMessage.actions.length > 0 && (
                  <div className="d-flex gap-2 flex-wrap">
                    {selectedMessage.actions.map(action => {
                      const actionLabels = {
                        view_agreement: { text: '📋 Ver Acuerdo', class: 'btn-governo-principal' },
                        upload_evidence: { text: '📎 Subir Evidencia', class: 'btn-warning' },
                        view_evidence: { text: '👁 Ver Evidencia', class: 'btn-info' },
                        review: { text: '✅ Revisar', class: 'btn-success' },
                        confirm_attendance: { text: '✓ Confirmar Asistencia', class: 'btn-primary' },
                        view_agenda: { text: '📄 Ver Agenda', class: 'btn-secondary' },
                        view_changelog: { text: '📋 Ver Cambios', class: 'btn-info' },
                        start_review: { text: '🔍 Iniciar Revisión', class: 'btn-warning' }
                      }
                      
                      const actionInfo = actionLabels[action] || { text: action, class: 'btn-secondary' }
                      
                      return (
                        <button
                          key={action}
                          className={`btn ${actionInfo.class}`}
                          onClick={() => handleActionClick(action, selectedMessage)}
                        >
                          {actionInfo.text}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Messages List View */
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-governo-principal mb-0">
                  {messageTypes.find(t => t.id === selectedFilter)?.icon} {messageTypes.find(t => t.id === selectedFilter)?.name}
                  <span className="text-muted ms-2">({filteredMessages.length})</span>
                </h5>
                <button className="btn btn-governo-outline btn-sm">
                  ✓ Marcar todos como leídos
                </button>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="text-center py-5">
                  <div className="display-1 text-muted mb-3">📭</div>
                  <h4 className="text-muted">No hay mensajes en esta categoría</h4>
                </div>
              ) : (
                <div className="list-group">
                  {filteredMessages.map(message => {
                    const priorityInfo = getPriorityBadge(message.priority)
                    
                    return (
                      <div
                        key={message.id}
                        className={`list-group-item list-group-item-action ${!message.read ? 'border-start border-warning border-3' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedMessage(message)
                          if (!message.read) markAsRead(message.id)
                        }}
                      >
                        <div className="d-flex w-100 justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <span className="me-2">{getTypeIcon(message.type)}</span>
                              <h6 className={`mb-0 ${!message.read ? 'fw-bold' : ''}`}>
                                {message.subject}
                              </h6>
                              {!message.read && (
                                <span className="badge bg-info ms-2">Nuevo</span>
                              )}
                            </div>
                            <p className="mb-1 text-muted">{message.preview}</p>
                            <small className="text-muted">
                              👤 {message.sender} • 
                              📅 {new Date(message.date).toLocaleString('es-MX')}
                            </small>
                          </div>
                          <div className="text-end">
                            <span className={`badge ${priorityInfo.class} mb-2`}>
                              {priorityInfo.text}
                            </span>
                            <br />
                            <small className="text-muted">
                              {new Date(message.date).toLocaleDateString('es-MX')}
                            </small>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}