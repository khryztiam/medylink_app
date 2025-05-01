// DoctorPanel.js
import { useState } from 'react';

export default function DoctorPanel({ citas, onAtender, onFinalizar }) {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const doctors = [
    'FATIMA SOFIA MELARA PORTILLO',
    'CHRISTIAN LADISLAO CUELLAR MORÁN'
  ];

  return (
    <section className="doctor-panel">
      <h1 className="panel-title">Citas Programadas</h1>
      {citas.length === 0 ? (
        <p className="no-citas-message">No hay citas programadas.</p>
      ) : (
        citas.map((cita) => (
          <div 
            key={cita.id} 
            className={`drcard-material ${cita.emergency ? 'emergency-card' : ''}`}
            data-estado={cita.estado}
          >
            <h3>{cita.nombre} - #{cita.orden_llegada}</h3>
            <p><strong>SAP:</strong> {cita.idSAP}</p>
            <p><strong>Fecha/Hora:</strong> {new Date(cita.programmer_at).toLocaleString('es-MX', {
                  hour12: true,
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) || 'Por asignar'}</p>
            <p><strong>Motivo:</strong> {cita.motivo}</p>
            
            {/* Mostrar check_in si existe */}
            {cita.check_in && (
              <p className="time-info">
                <strong>Check-in:</strong> {new Date(cita.check_in).toLocaleString('es-MX')}
              </p>
            )}
            
            <p>
              <strong>Estado:</strong> 
              <span className={`estado-badge estado-${cita.estado.replace(' ', '-')}`}>
                {cita.estado}
              </span>
            </p>

            {cita.estado === 'en espera' && (
              <div className="doctor-selection">
                <select
                  className="doctor-select"
                  defaultValue=""
                  onChange={(e) => e.target.value && onAtender(cita.id, e.target.value)}
                >
                  <option value="">Seleccione medico...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor} value={doctor}>
                      {doctor}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {cita.estado === 'en consulta' && (
              <div className="action-buttons">
                <button 
                  onClick={() => onFinalizar(cita.id)}
                  className="finalizar-button"
                  data-action="finalizar"
                >
                  Finalizar Consulta
                </button>
                
                {/* Mostrar doctor asignado */}
                {cita.doctor_name && (
                  <p className="doctor-assigned">
                    <strong>Doctor:</strong> {cita.doctor_name}
                  </p>
                )}
              </div>
            )}
            
            {/* Mostrar check_out si existe */}
            {cita.estado === 'atendido' && cita.check_out && (
              <p className="time-info">
                <strong>Check-out:</strong> {new Date(cita.check_out).toLocaleString('es-MX')}
              </p>
            )}
          </div>
        ))
      )}
    </section>
  )
}