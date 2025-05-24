import { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImportPanel() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const response = await fetch('/api/admin/importarAllowed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: results.data })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(errorText || 'Error en la solicitud')
          }

          setStats(await response.json())
        },
        error: (error) => {
          throw new Error(`Error al procesar CSV: ${error.message}`)
        }
      })
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
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
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </div>
      {isLoading && <p>Importando...</p>}
      {stats && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
          <h3>Resultados de la sincronización:</h3>
          <p><strong>Total en CSV:</strong> {stats.total}</p>
          <p><strong>Nuevos usuarios agregados:</strong> {stats.added}</p>
          <p><strong>Usuarios eliminados:</strong> {stats.removed}</p>
          <p>{stats.message}</p>
        </div>
      )}
    </div>
  );
}
