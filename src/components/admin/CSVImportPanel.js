import { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImportPanel() {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }
  const handleUpload = async () => {
    if (!file) return

    setIsLoading(true);

  try{
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
      // Enviar datos al backend
          const response = await fetch('/api/admin/importarAllowed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: results.data }),
          })
          
          if (response.ok) {
            onUploadComplete?.(await response.json())
          }
        },
        error: (error) => {
          console.error('Error al cargar el CSV:', error)
          setIsLoading(false)
        }
      })
    } catch (error) {
      console.error('Eror de carga:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-import-panel">
      <h2>Importar Lista Maestro</h2>
        <div className='material-group'>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            disabled={!file || isLoading}
          />
        </div>
      {isLoading && <p>Importando...</p>}
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
