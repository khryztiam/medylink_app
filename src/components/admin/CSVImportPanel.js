// Componente CSVImportPanel.js
import { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImportPanel() {
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const idsapList = results.data.map(row => row.idsap).filter(Boolean);

        setLoading(true);
        try {
          const res = await fetch('/api/admin/importarAllowed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idsaps: idsapList })
          });

          const data = await res.json();
          setImportResult(data);
        } catch (err) {
          setImportResult({ error: 'Error al importar el CSV' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="admin-import-panel">
      <h2>Importar Lista de IDs SAP</h2>
        <div className='material-group'>
            <input type="file" accept=".csv" onChange={handleCSVUpload} />
        </div>
      {loading && <p>Importando...</p>}
      {importResult && (
        <div className="admin-import-result">
          {importResult.error && <p className="error">{importResult.error}</p>}
          {importResult.success && (
            <p>
              Importados: <strong>{importResult.inserted}</strong> nuevos IDs. <br />
              Eliminados: <strong>{importResult.deleted}</strong> que ya no estaban en el CSV.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
