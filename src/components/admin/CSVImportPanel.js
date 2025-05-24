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
          const payload = {
            entries: data
              .filter(row => row.idsap)
              .map(row => ({
                idsap: row.idsap,
                nombre: row.nombre,
                grupo: row.grupo,
                descripcion: row.descripcion,
                puesto: row.puesto
              }))
          };

          const response = await fetch('/api/admin/importarAllowed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          const result = await response.json();
          setImportResult({
            success: true,
            inserted: result.inserted,
            message: `Importados ${result.inserted} registros`
          });

        } catch (error) {
          setImportResult({
            error: error.message.includes('405')
              ? 'Error: Configuración del servidor incorrecta'
              : error.message
          });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setImportResult({ error: `Error al procesar CSV: ${error.message}` });
        setLoading(false);
      }
    });
  };

  return (
    <div className="admin-import-panel">
      <h2>Importar Lista Maestro</h2>
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
