// Componente CSVImportPanel.js
import { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImportPanel() {
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setImportResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          // 1. Formatea los datos (sin filtrar, para mantener consistencia con el backend)
          const entries = data.map(row => ({
            idsap: String(row.idsap || '').trim(),
            nombre: row.nombre?.trim() || '',
            grupo: row.grupo?.trim() || '',
            puesto: row.puesto?.trim() || '',
          }));

          // 2. Envía al endpoint
          const res = await fetch('/api/admin/importarAllowed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entries }),
          });

          const result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Error desconocido');

          // 3. Muestra resultados (asume que el backend devuelve {success, inserted, deleted})
          setImportResult({
            success: true,
            inserted: result.inserted || entries.length,
            deleted: result.deleted || 0,
          });
        } catch (err) {
          setImportResult({ 
            error: err.message.includes('405') 
              ? 'Error: Endpoint no disponible (contacta al administrador)' 
              : err.message 
          });
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        setImportResult({ error: 'El archivo CSV no es válido' });
        setLoading(false);
      },
    });
  };

  return (
    <div className="admin-import-panel">
      <h2>Importar Lista de IDs SAP</h2>
        <div className='material-group'>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleCSVUpload}
            disabled={loading}
          />
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
