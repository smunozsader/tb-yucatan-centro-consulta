// Profile Page - User Account Management
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Profile() {
  const { user, updateUserProfile, logout } = useAuth()
  const { t, currentLanguage, setLanguage } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || '',
    phone: user?.phone || '',
    position: user?.position || ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      await updateUserProfile(formData)
      setIsEditing(false)
      alert('Perfil actualizado correctamente')
    } catch (error) {
      alert('Error al actualizar el perfil: ' + error.message)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      organization: user?.organization || '',
      phone: user?.phone || '',
      position: user?.position || ''
    })
    setIsEditing(false)
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrator':
        return { class: 'bg-danger', text: '👑 Administrador', description: 'Acceso completo al sistema' }
      case 'Responsible':
        return { class: 'bg-warning', text: '🔑 Responsable', description: 'Gestión de evidencias y acuerdos' }
      default:
        return { class: 'bg-secondary', text: '👤 Usuario', description: 'Consulta de información pública' }
    }
  }

  const roleInfo = getRoleBadge(user?.role)

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
                  Debes iniciar sesión para acceder a tu perfil
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
    <div className="container my-5">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-governo-principal-claro p-4 rounded text-white">
            <h1 className="display-5 mb-2">👤 Mi Perfil</h1>
            <p className="lead mb-0">
              Gestiona tu información personal y preferencias del sistema
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Profile Information */}
        <div className="col-md-8">
          <div className="card card-governo">
            <div className="card-header bg-governo-principal text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📝 Información Personal</h5>
                {!isEditing ? (
                  <button 
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Editar
                  </button>
                ) : (
                  <div>
                    <button 
                      className="btn btn-success btn-sm me-2"
                      onClick={handleSave}
                    >
                      ✅ Guardar
                    </button>
                    <button 
                      className="btn btn-outline-light btn-sm"
                      onClick={handleCancel}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre Completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo"
                    />
                  ) : (
                    <p className="form-control-plaintext border-bottom">{user.name || 'No especificado'}</p>
                  )}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Correo Electrónico</label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu.email@ejemplo.com"
                    />
                  ) : (
                    <p className="form-control-plaintext border-bottom">{user.email || 'No especificado'}</p>
                  )}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Organización</label>
                  {isEditing ? (
                    <select
                      className="form-select"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar organización</option>
                      <option value="CESO">CESO - Consejo Estatal de Seguimiento Operativo</option>
                      <option value="APHIS-USDA">APHIS-USDA - Animal and Plant Health Inspection Service</option>
                      <option value="SENASICA">SENASICA - Servicio Nacional de Sanidad</option>
                      <option value="SADER">SADER - Secretaría de Agricultura y Desarrollo Rural</option>
                      <option value="Otro">Otro</option>
                    </select>
                  ) : (
                    <p className="form-control-plaintext border-bottom">{user.organization || 'No especificado'}</p>
                  )}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Teléfono</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+52 (999) 123-4567"
                    />
                  ) : (
                    <p className="form-control-plaintext border-bottom">{user.phone || 'No especificado'}</p>
                  )}
                </div>
                
                <div className="col-12 mb-3">
                  <label className="form-label">Cargo/Posición</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Tu cargo o posición"
                    />
                  ) : (
                    <p className="form-control-plaintext border-bottom">{user.position || 'No especificado'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Summary & Settings */}
        <div className="col-md-4">
          {/* Role & Permissions */}
          <div className="card card-governo mb-4">
            <div className="card-header bg-governo-secundario text-white">
              <h6 className="mb-0">🎭 Rol y Permisos</h6>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <span className={`badge ${roleInfo.class} fs-6 px-3 py-2`}>
                  {roleInfo.text}
                </span>
              </div>
              <p className="text-muted small text-center mb-3">
                {roleInfo.description}
              </p>
              
              <div className="mt-3">
                <h6 className="text-governo-principal">Permisos Activos:</h6>
                <ul className="list-unstyled">
                  <li className="small">✅ Consulta de acuerdos</li>
                  <li className="small">✅ Visualización de evidencias</li>
                  <li className="small">✅ Descarga de documentos</li>
                  {(user.role === 'Administrator' || user.role === 'Responsible') && (
                    <>
                      <li className="small text-warning">🔑 Carga de evidencias</li>
                      <li className="small text-warning">🔑 Cambio de estados</li>
                    </>
                  )}
                  {user.role === 'Administrator' && (
                    <li className="small text-danger">👑 Gestión de usuarios</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="card card-governo mb-4">
            <div className="card-header bg-governo-verde text-white">
              <h6 className="mb-0">🌐 Configuración de Idioma</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className={`btn ${currentLanguage === 'es' ? 'btn-governo-principal' : 'btn-governo-outline'}`}
                  onClick={() => setLanguage('es')}
                >
                  🇲🇽 Español
                </button>
                <button
                  className={`btn ${currentLanguage === 'en' ? 'btn-governo-principal' : 'btn-governo-outline'}`}
                  onClick={() => setLanguage('en')}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card card-governo">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">⚙️ Acciones de Cuenta</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-governo-outline">
                  🔑 Cambiar Contraseña
                </button>
                <button className="btn btn-outline-warning">
                  📱 Configurar 2FA
                </button>
                <hr />
                <button 
                  className="btn btn-outline-danger"
                  onClick={logout}
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card card-governo">
            <div className="card-header bg-governo-dorado text-white">
              <h5 className="mb-0">📊 Resumen de Actividad</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="border-end">
                    <div className="display-6 text-governo-principal">28</div>
                    <p className="text-muted mb-0">Acuerdos Consultados</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border-end">
                    <div className="display-6 text-governo-secundario">12</div>
                    <p className="text-muted mb-0">Evidencias Subidas</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border-end">
                    <div className="display-6 text-governo-verde">156</div>
                    <p className="text-muted mb-0">Documentos Descargados</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="display-6 text-governo-dorado">7</div>
                  <p className="text-muted mb-0">Días Activo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}