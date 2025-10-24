import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportButtons({ data, fileName }) {
  function handleExcel() {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, fileName.replace(/\.[^.]+$/, '') + '_export.xlsx');
  }

  function handlePDF() {
    const doc = new jsPDF();
    const columns = Object.keys(data[0] || {});
    const rows = data.map(row => columns.map(col => row[col]));
    doc.text('Reporte de Movilizaciones', 14, 16);
    doc.autoTable({ head: [columns], body: rows, startY: 20 });
    doc.save(fileName.replace(/\.[^.]+$/, '') + '_export.pdf');
  }

  return (
    <div className="mb-3">
      <button className="btn btn-primary btn-sm me-2" onClick={handleExcel}>
        <span className="bi bi-file-earmark-excel"></span> Descargar Excel
      </button>
      <button className="btn btn-danger btn-sm" onClick={handlePDF}>
        <span className="bi bi-file-earmark-pdf"></span> Descargar PDF
      </button>
    </div>
  );
}
