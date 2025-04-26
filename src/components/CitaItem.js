// components/CitaItem.js
export default function CitaItem({ cita, onAtender, onFinalizar }) {
    return (
      <li className="item-cita">
        <p><strong>{cita.nombre}</strong> - {cita.motivo}</p>
        <p><strong>Hora:</strong> {cita.programmer_at || 'Sin asignar'}</p>
        <p><strong>Estado:</strong> {cita.estado}</p>
  
        {onAtender && cita.estado === 'programado' && (
          <button onClick={() => onAtender(cita.id)}>Atender</button>
        )}
  
        {onFinalizar && cita.estado === 'en consulta' && (
          <button onClick={() => onFinalizar(cita.id)}>Finalizar Consulta</button>
        )}
      </li>
    )
  }
  