import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <main className="page">
      <div className="container">
        <div className="min-vh-100" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
          {/* Header gubernamental */}
          <div className="gob-header" style={{ backgroundColor: 'rgb(19, 50, 46)' }}>
            <div className="container-fluid">
              <div className="row align-items-center py-3">
                <div className="col-md-8">
                  <div className="d-flex align-items-center">
                    <div 
                      className="me-3 d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                        borderRadius: '4px' 
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🏛️</span>
                    </div>
                    <div className="text-white">
                      <h6 
                        className="mb-0 gm-font-patria" 
                        style={{ fontSize: '1.1rem', fontWeight: '600' }}
                      >
                        Centro de Consulta de Acuerdos Zoo-Sanitarios en Yucatán
                      </h6>
                      <small 
                        className="gm-font-nunito" 
                        style={{ opacity: '0.85', fontSize: '0.875rem' }}
                      >
                        Sanidad Pecuaria Yucatán
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <small 
                    className="text-white gm-font-nunito" 
                    style={{ opacity: '0.7' }}
                  >
                    v3.3.1 | 🏛️ SEPT 25 16:45
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="container my-5">
            <div className="row justify-content-center">
              <div className="col-lg-10 col-xl-8">
                
                {/* Título principal */}
                <div className="text-center mb-5">
                  <h1 
                    className="gm-font-patria mb-3" 
                    style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: '700', 
                      color: 'rgb(19, 50, 46)', 
                      lineHeight: '1.2' 
                    }}
                  >
                    🚀 ¡Vite súper rápido! - Acceso al Sistema
                  </h1>
                  <p 
                    className="gm-font-nunito lead mb-4" 
                    style={{ 
                      color: 'rgb(84, 84, 84)', 
                      fontSize: '1.125rem' 
                    }}
                  >
                    Seleccione su grupo de trabajo para acceder al centro de consulta especializado
                  </p>
                </div>

                {/* Cards de acceso */}
                <div className="row g-4 mb-5">
                  {/* Card CESO */}
                  <div className="col-md-6">
                    <div 
                      className="card h-100 border-0 shadow-sm" 
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="card-body p-4 text-center">
                        <div className="mb-4">
                          <div 
                            className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                            style={{ 
                              width: '80px', 
                              height: '80px', 
                              backgroundColor: 'rgb(97, 18, 50)', 
                              boxShadow: 'rgba(97, 18, 50, 0.2) 0px 4px 12px' 
                            }}
                          >
                            <i 
                              className="bi bi-shield-check text-white" 
                              style={{ fontSize: '2rem' }}
                            ></i>
                          </div>
                        </div>
                        <h4 
                          className="gm-font-patria mb-2" 
                          style={{ color: 'rgb(19, 50, 46)', fontSize: '1.5rem' }}
                        >
                          CESO
                        </h4>
                        <p 
                          className="gm-font-nunito text-muted mb-4" 
                          style={{ fontSize: '0.95rem' }}
                        >
                          Consejo Estatal de Seguimiento Operativo (CESO) del Sistema Nacional de Identificación y Registro de la Movilización de Animales (SINIIGA-SINIDA)
                        </p>
                        <button 
                          className="btn btn-lg w-100 gm-font-nunito fw-semibold"
                          onClick={() => navigate('/ceso')}
                          style={{ 
                            backgroundColor: 'rgb(220, 53, 69)', 
                            borderColor: 'rgb(220, 53, 69)', 
                            color: 'rgb(255, 255, 255)', 
                            borderRadius: '8px', 
                            padding: '12px 24px', 
                            fontSize: '1rem', 
                            transition: '0.3s' 
                          }}
                        >
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          ⚡ Acceder como CESO (¡Vite rápido!)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card APHIS-USDA */}
                  <div className="col-md-6">
                    <div 
                      className="card h-100 border-0 shadow-sm" 
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="card-body p-4 text-center">
                        <div className="mb-4">
                          <div 
                            className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                            style={{ 
                              width: '80px', 
                              height: '80px', 
                              backgroundColor: 'rgb(165, 127, 44)', 
                              boxShadow: 'rgba(165, 127, 44, 0.2) 0px 4px 12px' 
                            }}
                          >
                            <i 
                              className="bi bi-globe-americas text-white" 
                              style={{ fontSize: '2rem' }}
                            ></i>
                          </div>
                        </div>
                        <h4 
                          className="gm-font-patria mb-2" 
                          style={{ color: 'rgb(19, 50, 46)', fontSize: '1.5rem' }}
                        >
                          APHIS-USDA
                        </h4>
                        <p 
                          className="gm-font-nunito text-muted mb-4" 
                          style={{ fontSize: '0.95rem' }}
                        >
                          Grupo de Trabajo de Seguimiento a Recomendaciones Críticas APHIS-USDA y SENASICA
                        </p>
                        <button 
                          className="btn btn-lg w-100 gm-font-nunito fw-semibold"
                          onClick={() => navigate('/aphis')}
                          style={{ 
                            backgroundColor: 'rgb(165, 127, 44)', 
                            borderColor: 'rgb(165, 127, 44)', 
                            color: 'rgb(255, 255, 255)', 
                            borderRadius: '8px', 
                            padding: '12px 24px', 
                            fontSize: '1rem', 
                            transition: '0.3s' 
                          }}
                        >
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Accede como APHIS-USDA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de características */}
                <div className="row">
                  <div className="col-12">
                    <div 
                      className="card border-0" 
                      style={{ 
                        backgroundColor: 'rgb(248, 249, 250)', 
                        borderRadius: '12px' 
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="row text-center g-4">
                          <div className="col-md-4">
                            <div className="d-flex flex-column align-items-center">
                              <div 
                                className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" 
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  backgroundColor: 'rgb(221, 201, 163)' 
                                }}
                              >
                                <i 
                                  className="bi bi-clipboard-data" 
                                  style={{ 
                                    fontSize: '1.5rem', 
                                    color: 'rgb(19, 50, 46)' 
                                  }}
                                ></i>
                              </div>
                              <h6 
                                className="gm-font-patria mb-2" 
                                style={{ color: 'rgb(19, 50, 46)' }}
                              >
                                Sistema Especializado
                              </h6>
                              <small 
                                className="gm-font-nunito" 
                                style={{ color: 'rgb(84, 84, 84)' }}
                              >
                                Consulta de acuerdos zoo-sanitarios
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="d-flex flex-column align-items-center">
                              <div 
                                className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" 
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  backgroundColor: 'rgb(221, 201, 163)' 
                                }}
                              >
                                <i 
                                  className="bi bi-shield-lock" 
                                  style={{ 
                                    fontSize: '1.5rem', 
                                    color: 'rgb(19, 50, 46)' 
                                  }}
                                ></i>
                              </div>
                              <h6 
                                className="gm-font-patria mb-2" 
                                style={{ color: 'rgb(19, 50, 46)' }}
                              >
                                Acceso Seguro
                              </h6>
                              <small 
                                className="gm-font-nunito" 
                                style={{ color: 'rgb(84, 84, 84)' }}
                              >
                                Autenticación por grupos
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="d-flex flex-column align-items-center">
                              <div 
                                className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" 
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  backgroundColor: 'rgb(221, 201, 163)' 
                                }}
                              >
                                <i 
                                  className="bi bi-people-fill" 
                                  style={{ 
                                    fontSize: '1.5rem', 
                                    color: 'rgb(19, 50, 46)' 
                                  }}
                                ></i>
                              </div>
                              <h6 
                                className="gm-font-patria mb-2" 
                                style={{ color: 'rgb(19, 50, 46)' }}
                              >
                                Colaborativo
                              </h6>
                              <small 
                                className="gm-font-nunito" 
                                style={{ color: 'rgb(84, 84, 84)' }}
                              >
                                CESO y APHIS-USDA
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer informativo */}
                <div className="text-center mt-4">
                  <small 
                    className="gm-font-nunito" 
                    style={{ color: 'rgb(84, 84, 84)' }}
                  >
                    <i className="bi bi-info-circle me-1"></i>
                    Sistema desarrollado conforme a las guías gob.mx v3 | 
                    <strong> 16 usuarios activos</strong> | 
                    <strong>2 grupos especializados</strong>
                  </small>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;