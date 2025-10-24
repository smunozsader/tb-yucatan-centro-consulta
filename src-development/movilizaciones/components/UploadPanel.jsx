import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

export default function UploadPanel({ setData, setFileName, setStep }) {
  const fileInput = useRef();
  const [error, setError] = useState('');

  function handleFile(e) {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const json = JSON.parse(evt.target.result);
          setData(json);
          setStep(2);
        } catch (err) {
          setError('El archivo JSON no es válido.');
        }
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const workbook = XLSX.read(evt.target.result, { type: 'binary' });
          // For demo: just take first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
          setData(data);
          setStep(2);
        } catch (err) {
          setError('No se pudo leer el archivo Excel.');
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError('Solo se aceptan archivos .xlsx o .json');
    }
  }

  return (
    <div className="card p-4">
      <h4>Subir archivo de datos</h4>
      <p>Seleccione un archivo Excel (.xlsx) o JSON exportado del sistema.</p>
      <input type="file" accept=".xlsx,.json" ref={fileInput} onChange={handleFile} className="form-control mb-2" />
      {error && <div className="alert alert-danger">{error}</div>}
      <button className="btn btn-link" onClick={() => fileInput.current && fileInput.current.click()}>
        <span className="bi bi-upload"></span> Seleccionar archivo
      </button>
      <div className="mt-3">
        <span className="bi bi-question-circle"></span> <b>Ayuda:</b> Si tiene dudas sobre el formato, consulte la <a href="#">guía de usuario</a>.
      </div>
    </div>
  );
}
