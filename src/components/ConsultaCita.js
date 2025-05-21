import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'


export default function ConsultaCita({ citas }) {
  const { role, idsap } = useAuth()
  const [searchSAP, setSearchSAP] = useState('')
  const [filteredCitas, setFilteredCitas] = useState([])


  const esPaciente = role === 'paciente'

  useEffect(() => {
    if (!Array.isArray(citas)) return
    if (esPaciente && idsap) {
      const citasPaciente = citas.filter(
        (c) => String(c.idSAP) === String(idsap)
      )
      setFilteredCitas(citasPaciente)
    }
  }, [citas, idsap, esPaciente])

  const buscar = () => {
    if (!Array.isArray(citas)) return
    if (!searchSAP.trim()) {
      alert('Ingresa un ID SAP para buscar citas')
      return
    }

    const encontradas = citas.filter(
      (c) => String(c.idSAP) === searchSAP.trim()
    )

    setFilteredCitas(encontradas.length ? encontradas : [])
    if (encontradas.length === 0) {
      alert('No se encontró ninguna cita con ese ID SAP')
    }
  }

   // Función para determinar la clase CSS según el estado
  const getRowStyle = (estado) => {
    switch(estado) {
      case 'programado':
        return { backgroundColor: '#e6f7ff', borderLeft: '4px solid #1890ff' }
      case 'atendido':
        return { backgroundColor: '#f6ffed', borderLeft: '4px solid #52c41a' }
      case 'pendiente':
        return { backgroundColor: '#fff2f0', borderLeft: '4px solid #fa8c16' }
      default:
        return {}
    }
  }

  return (
    <div className="consulta-cita">

      {!esPaciente && (       
        <div className="concita-form-group">
          <input
            type="text"
            placeholder="Ingresa ID SAP"
            value={searchSAP}
            onChange={(e) => setSearchSAP(e.target.value)}
            className='concita-form-control'
          />
          <button onClick={buscar}>Buscar Cita</button>
        </div>
      )}

      <div className="table-container">
        <h3>Historial de solicitudes de Citas:</h3>
        <table className="table-material">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>SAP</th>
              <th>Motivo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Cita</th>
            </tr>
          </thead>
          <tbody>
            {filteredCitas.length > 0 ? (
              filteredCitas.map((cita) => (
                <tr 
                  key={cita.id} 
                  style={{
                    ...getRowStyle(cita.estado),
                    // Mantenemos el hover y zebra striping de tus estilos
                    ':hover': { backgroundColor: '#ebf8ff' }
                  }}
                >
                  <td>{cita.nombre}</td>
                  <td>{cita.idSAP}</td>
                  <td>{cita.motivo}</td>
                  <td>
                    {new Date(cita.created_at).toLocaleString('es-MX', {
                      hour12: true,
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td>{cita.estado}</td>
                  <td>
                    {cita.programmer_at ?
                    new Date(cita.programmer_at).toLocaleString('es-MX', {
                      hour12: true,
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      }): '' }
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  No hay citas programadas o no se encontró la cita.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
