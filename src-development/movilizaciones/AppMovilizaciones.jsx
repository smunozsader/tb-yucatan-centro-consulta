import React, { useState, useContext } from 'react';
import VentanillaLoginModal from './components/VentanillaLoginModal';
import { AuthContext } from '../context/AuthContext.jsx';

import UploadPanel from './components/UploadPanel';
import DataTableEditor from './components/DataTableEditor';
import ReviewPanel from './components/ReviewPanel';
import ExportButtons from './components/ExportButtons';
import 'bootstrap/dist/css/bootstrap.min.css';



export default function AppMovilizaciones() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [ventanilla, setVentanilla] = useState('UGROY');
  const [showLogin, setShowLogin] = useState(true);
  const { user } = useContext(AuthContext);

  // Only allow ADMINISTRATOR or RESPONSIBLE roles
  const allowedRoles = ['ADMINISTRATOR', 'RESPONSIBLE'];
  const isAuthorized = user && user.role && allowedRoles.includes(user.role);

  function handleLoginSuccess() {
    setShowLogin(false);
  }

  if (!isAuthorized) {
    return (
      <VentanillaLoginModal show={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
    );
  }

  return (
    <main className="page">
      <div className="container py-4">
        <h1 className="mb-3">Módulo de Movilizaciones</h1>
        <div className="mb-3">
          <label className="form-label me-2"><b>Seleccione Ventanilla:</b></label>
          <select className="form-select form-select-sm d-inline-block w-auto" value={ventanilla} onChange={e => setVentanilla(e.target.value)}>
            <option value="UGROY">UGROY</option>
            <option value="UGRY">UGRY</option>
          </select>
          <span className="ms-2 bi bi-question-circle" title="Elija la ventanilla que va a gestionar."></span>
        </div>
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">Inicio</li>
          <li className="breadcrumb-item">Subir archivo</li>
          <li className="breadcrumb-item">Editar datos</li>
          <li className="breadcrumb-item">Revisar y exportar</li>
        </ol>
        <div className="mb-4">
          <button className="btn btn-primary btn-sm me-2" onClick={() => setStep(1)}>1. Subir archivo</button>
          <button className="btn btn-secondary btn-sm me-2" onClick={() => setStep(2)} disabled={!data}>2. Editar datos</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setStep(3)} disabled={!data}>3. Revisar y exportar</button>
        </div>
        {step === 1 && <UploadPanel setData={setData} setFileName={setFileName} setStep={setStep} ventanilla={ventanilla} />}
        {step === 2 && data && <DataTableEditor data={data} setData={setData} fileName={fileName} ventanilla={ventanilla} />}
        {step === 3 && data && (
          <>
            <ExportButtons data={data} fileName={fileName} />
            <ReviewPanel data={data} fileName={fileName} ventanilla={ventanilla} />
          </>
        )}
        <div className="mt-4">
          <HelpSection />
        </div>
      </div>
    </main>
  );
}

function HelpSection() {
  return (
    <div className="alert alert-info">
      <h5>Ayuda para el usuario</h5>
      <ul>
        <li>Puede subir archivos Excel (.xlsx) o JSON exportados del sistema.</li>
        <li>Revise los datos antes de guardar o exportar.</li>
        <li>Si tiene dudas, haga clic en los íconos de ayuda <span className="bi bi-question-circle"></span> en cada sección.</li>
        <li>Para asistencia técnica, contacte a soporte.</li>
      </ul>
    </div>
  );
}
