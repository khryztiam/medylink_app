import { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImportPanel() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setStats(null);
    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      lastModified: new Date(file.lastModified).toLocaleString()
    });

    try {
      await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          encoding: 'UTF-8',
          complete: async (results) => {
            try {
              // Validación avanzada de datos
              const invalidRows = results.data.filter(row => 
                !row.idsap || 
                !row.nombre ||
                isNaN(Number(row.idsap)) ||
                (row.grupo && isNaN(Number(row.grupo)))
              );

              if (invalidRows.length > 0) {
                throw new Error(
                  `${invalidRows.length} filas inválidas. ` +
                  `IDs problemáticos: ${invalidRows.slice(0, 5).map(r => r.idsap).join(', ')}` +
                  `${invalidRows.length > 5 ? '...' : ''}`
                );
              }

              // Preparar datos para el backend
              const processedData = results.data.map(row => ({
                idsap: Number(row.idsap),
                nombre: row.nombre.trim(),
                grupo: row.grupo ? Number(row.grupo) : null,
                puesto: row.puesto ? row.puesto.trim() : null
              }));

              // Debug: mostrar primeros 3 registros
              console.log('Datos a enviar (muestra):', processedData.slice(0, 3));

              const response = await fetch('/api/admin/importarAllowed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: processedData })
              });

              const responseData = await response.json();

              if (!response.ok) {
                throw new Error(
                  responseData.error || 
                  responseData.message || 
                  `Error ${response.status}: ${response.statusText}`
                );
              }

              setStats(responseData);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          error: (error) => {
            reject(new Error(`Error al leer CSV: ${error.message}`));
          }
        });
      });
    } catch (err) {
      console.error('Error en importación:', err);
      setError({
        title: 'Error al procesar archivo',
        message: err.message,
        details: err.details || 'Verifica el formato del archivo CSV'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-import-panel">
      <h2>Importar Lista Maestro</h2>
      
      <div className="material-group">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </div>

      {fileInfo && (
        <div className="file-info">
          <p><strong>Archivo:</strong> {fileInfo.name}</p>
          <p><strong>Tamaño:</strong> {fileInfo.size}</p>
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <p>Procesando archivo...</p>
          <div className="progress-bar"></div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h3>{error.title || 'Error'}</h3>
          <p>{error.message}</p>
          {error.details && <p className="details">{error.details}</p>}
        </div>
      )}

      {stats && (
        <div className="import-results">
          <h3>Resultados de la importación</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total procesados:</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Nuevos agregados:</span>
              <span className="stat-value">{stats.added}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Actualizados:</span>
              <span className="stat-value">{stats.updated || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Eliminados:</span>
              <span className="stat-value">{stats.removed}</span>
            </div>
          </div>
          {stats.message && <p className="success-message">{stats.message}</p>}
        </div>
      )}
    </div>
  );
}