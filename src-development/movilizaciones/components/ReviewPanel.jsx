import React from 'react';

export default function ReviewPanel({ data, fileName, ventanilla }) {
  function handleDownload() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ventanilla}_${fileName.replace(/\.[^.]+$/, '')}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card p-4">
      <h4>Revisar y exportar datos ({ventanilla})</h4>
      <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f8f9fa' }}>{JSON.stringify(data, null, 2)}</pre>
      <button className="btn btn-primary btn-sm" onClick={handleDownload}>
        <span className="bi bi-download"></span> Descargar JSON
      </button>
      <div className="mt-3">
        <span className="bi bi-question-circle"></span> <b>Ayuda:</b> Revise los datos antes de exportar. Si detecta errores, regrese a la edición.
      </div>
    </div>
  );
}
