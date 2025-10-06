// Home Page - Welcome and System Overview
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useAuth()

  const features = [
    {
      icon: '🔍',
      title: 'Búsqueda de Acuerdos',
      description: 'Busca acuerdos por número o descripción'
    },
    {
      icon: '🎛',
      title: 'Filtros Avanzados',
      description: 'Filtra por estado: Pendiente, Completado, Vencidos'
    },
    {
      icon: '📂',
      title: 'Sistema de Evidencias',
      description: 'Visualiza y descarga archivos de evidencia'
    },
    {
      icon: '👁',
      title: 'Consulta Detallada',
      description: 'Información completa de cada acuerdo'
    },
    {
      icon: '🌐',
      title: 'Bilingüe',
      description: 'Español ↔ Inglés'
    },
    {
      icon: '📱',
      title: 'Móvil Responsive',
      description: 'Acceso completo desde cualquier dispositivo'
    }
  ]

  const restrictedFeatures = [
    {
      icon: '📎',
      title: 'Carga de Evidencias',
      description: 'Subir archivos de cumplimiento (PDF, JPG, PNG, Word)'
    },
    {
      icon: '✅',
      title: 'Marcar Completado',
      description: 'Cambiar estado de acuerdos con evidencia obligatoria'
    },
    {
      icon: '📧',
      title: 'Notificaciones de Reuniones',
      description: 'Generar cartas formales para reuniones ordinarias y extraordinarias'
    }
  ]

  return (
    <div className="container my-5">
      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <div className="bg-governo-principal-claro p-5 rounded">
            <h1 className="display-4 text-white mb-3">
              Centro de Consulta de Acuerdos Sanitarios
            </h1>
            <p className="lead text-white mb-4">
              Sistema integral para la gestión de acuerdos sanitarios entre CESO y APHIS-USDA en Yucatán
            </p>
            <button 
              className="btn btn-governo-dorado btn-lg me-3"
              onClick={() => navigate('/dashboard')}
            >
              🚀 Acceder al Sistema
            </button>
            <button 
              className="btn btn-outline-light btn-lg"
              onClick={() => navigate('/repository')}
            >
              📚 Consultar Documentos
            </button>
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <div className="row mb-5">
        <div className="col-md-6">
          <div className="card card-governo h-100">
            <div className="card-body">
              <h3 className="card-title text-governo-principal">
                🏢 CESO
              </h3>
              <h5 className="text-muted">Consejo Estatal de Seguimiento Operativo del SINIDA</h5>
              <p className="card-text">
                Alineado con la NOM-001-SAG/GAN-2015 para el Sistema Nacional de 
                Identificación Animal de Bovinos y Colmenas.
              </p>
              <div className="mt-3">
                <span className="badge bg-governo-verde me-2">NOM-001-SAG/GAN-2015</span>
                <span className="badge bg-governo-secundario">SINIDA</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card card-governo h-100">
            <div className="card-body">
              <h3 className="card-title text-governo-principal">
                🇺🇸 APHIS-USDA
              </h3>
              <h5 className="text-muted">Grupo de Trabajo APHIS-USDA/SENASICA</h5>
              <p className="card-text">
                Para el control de la tuberculosis bovina y la atención de recomendaciones 
                críticas en seguimiento a las visitas de certificación.
              </p>
              <div className="mt-3">
                <span className="badge bg-governo-verde me-2">Control TB Bovina</span>
                <span className="badge bg-governo-secundario">Exportación USA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Features */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-governo-principal mb-4">✨ Funciones Públicas</h2>
          <p className="text-muted mb-4">Sin autenticación requerida</p>
          <div className="row">
            {features.map((feature, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className="card h-100 border-governo-principal-claro">
                  <div className="card-body text-center">
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <h5 className="card-title text-governo-principal">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restricted Features */}
      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-governo-secundario mb-4">🔐 Funciones Restringidas</h2>
          <p className="text-muted mb-4">
            Requiere rol de Administrador/Responsable
            {!user && (
              <span className="ms-2">
                <button className="btn btn-sm btn-governo-outline" onClick={() => navigate('/login')}>
                  Iniciar Sesión
                </button>
              </span>
            )}
          </p>
          <div className="row">
            {restrictedFeatures.map((feature, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className={`card h-100 ${!user ? 'opacity-75' : ''}`}>
                  <div className="card-body text-center">
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <h5 className="card-title text-governo-secundario">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                    {!user && (
                      <div className="mt-2">
                        <span className="badge bg-warning">🔒 Autenticación Requerida</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="bg-governo-verde-claro p-4 rounded text-center">
            <h3 className="text-white mb-4">📊 Estadísticas del Sistema</h3>
            <div className="row">
              <div className="col-md-3">
                <div className="display-6 text-governo-dorado">999</div>
                <p className="text-white mb-0">Acuerdos CESO</p>
              </div>
              <div className="col-md-3">
                <div className="display-6 text-governo-dorado">998</div>
                <p className="text-white mb-0">Acuerdos APHIS-USDA</p>
              </div>
              <div className="col-md-3">
                <div className="display-6 text-governo-dorado">2.5.0</div>
                <p className="text-white mb-0">Versión del Sistema</p>
              </div>
              <div className="col-md-3">
                <div className="display-6 text-governo-dorado">100%</div>
                <p className="text-white mb-0">Móvil Responsive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="row">
        <div className="col-12 text-center">
          <div className="card card-governo">
            <div className="card-body">
              <h3 className="card-title text-governo-principal">
                🚀 ¿Listo para comenzar?
              </h3>
              <p className="card-text text-muted mb-4">
                Accede al dashboard para consultar acuerdos, ver evidencias y gestionar el cumplimiento.
              </p>
              <button 
                className="btn btn-governo-principal btn-lg me-3"
                onClick={() => navigate('/dashboard')}
              >
                Ir al Dashboard
              </button>
              <button 
                className="btn btn-governo-outline btn-lg"
                onClick={() => navigate('/repository')}
              >
                Ver Documentos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}