// Footer Component with Government Information
import React from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gobierno-verde text-white mt-5">
      <div className="container py-4">
        <div className="row">
          <div className="col-md-8">
            <h5 className="text-governo-dorado-claro mb-3">
              Centro de Consulta de Acuerdos Sanitarios
            </h5>
            <p className="mb-2">
              Sistema desarrollado por la Representación de la Secretaría de Agricultura y Desarrollo Rural 
              (Gobierno Federal Mexicano) en Yucatán, en beneficio de la Ganadería yucateca.
            </p>
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-governo-dorado-claro">🏢 CESO</h6>
                <p className="small mb-2">
                  Consejo Estatal de Seguimiento Operativo del SINIDA<br/>
                  NOM-001-SAG/GAN-2015
                </p>
              </div>
              <div className="col-md-6">
                <h6 className="text-governo-dorado-claro">🇺🇸 APHIS-USDA</h6>
                <p className="small mb-2">
                  Grupo de Trabajo APHIS-USDA/SENASICA<br/>
                  Control de tuberculosis bovina
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <h6 className="text-governo-dorado-claro mb-3">Enlaces de Interés</h6>
            <ul className="list-unstyled">
              <li className="mb-1">
                <a href="https://www.gob.mx/agricultura" className="text-governo-dorado-claro text-decoration-none">
                  🌐 Secretaría de Agricultura
                </a>
              </li>
              <li className="mb-1">
                <a href="https://www.gob.mx/senasica" className="text-governo-dorado-claro text-decoration-none">
                  🌐 SENASICA
                </a>
              </li>
              <li className="mb-1">
                <a href="https://www.aphis.usda.gov" className="text-governo-dorado-claro text-decoration-none">
                  🌐 APHIS-USDA
                </a>
              </li>
            </ul>
            
            <div className="mt-3">
              <p className="small mb-1">
                📧 Contacto: contacto@tb-yucatan.gob.mx
              </p>
              <p className="small mb-0">
                📞 Tel: +52 (999) 123-4567
              </p>
            </div>
          </div>
        </div>
        
        <hr className="my-4 border-governo-dorado-claro" />
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0 small">
              © 2024 Gobierno de México • Secretaría de Agricultura y Desarrollo Rural
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0 small">
              🚀 Sistema v2.5.0 • Desarrollado con tecnología React + Firebase
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}