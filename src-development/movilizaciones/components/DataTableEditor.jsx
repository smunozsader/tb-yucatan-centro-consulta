import React, { useState } from 'react';

export default function DataTableEditor({ data, setData, fileName }) {
  const [editData, setEditData] = useState(data);

  function handleChange(rowIdx, key, value) {
    const updated = editData.map((row, i) => i === rowIdx ? { ...row, [key]: value } : row);
    setEditData(updated);
  }

  function handleSave() {
    setData(editData);
    alert('Cambios guardados.');
  }

  function handleAddRow() {
    setEditData([...editData, {}]);
  }

  function handleDeleteRow(idx) {
    setEditData(editData.filter((_, i) => i !== idx));
  }

  if (!Array.isArray(editData) || editData.length === 0) {
    return <div className="alert alert-warning">No hay datos para editar.</div>;
  }

  const columns = Object.keys(editData[0]);

  return (
    <div className="card p-4">
      <h4>Editar datos ({fileName})</h4>
      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>{col} <span className="bi bi-question-circle" title={`Ayuda para ${col}`}></span></th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {editData.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col}>
                  <input className="form-control form-control-sm" value={row[col] ?? ''} onChange={e => handleChange(i, col, e.target.value)} />
                </td>
              ))}
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRow(i)} title="Eliminar fila">
                  <span className="bi bi-trash"></span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-secondary btn-sm me-2" onClick={handleAddRow}>
        <span className="bi bi-plus"></span> Agregar fila
      </button>
      <button className="btn btn-primary btn-sm" onClick={handleSave}>
        <span className="bi bi-save"></span> Guardar cambios
      </button>
      <div className="mt-3">
        <span className="bi bi-question-circle"></span> <b>Ayuda:</b> Edite los datos directamente en la tabla. Use "Agregar fila" para añadir más registros.
      </div>
    </div>
  );
}
