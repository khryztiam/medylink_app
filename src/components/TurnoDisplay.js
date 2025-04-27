import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { FaSignOutAlt, FaUserClock, FaClock, FaInfoCircle, FaUserMd } from 'react-icons/fa';

export default function TurnoVisual() {
  const [citaActual, setCitaActual] = useState(null);
  const [showWaiting, setShowWaiting] = useState(false); // 👈 Nuevo estado
  const { logout } = useAuth();

  const fetchCitasEnConsulta = async () => {
    const { data, error } = await supabase
      .from('citas')
      .select('*')
      .eq('estado', 'en consulta')
      .order('programmer_at', { ascending: true });

    if (error) {
      console.error(error);
      setCitaActual(null);
      return;
    }

    if (data && data.length > 0) {
      setCitaActual(data[0]); // Mostrar solo el primer turno en "en consulta"
      setShowWaiting(false);
    } else {
      setCitaActual(null);
      setShowWaiting(true); // 👈 Mostrar transición
    }
  };

  useEffect(() => {
    fetchCitasEnConsulta();

    const canal = supabase
      .channel('supabase_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'citas' },
        (payload) => {
          const newEstado = payload.new?.estado;
          const oldEstado = payload.old?.estado;

          // Si el estado cambia a "en consulta", actualiza el turno actual
          if (newEstado === 'en consulta' || oldEstado === 'en consulta') {
            fetchCitasEnConsulta();
          }

          // Si el estado cambia a "atendido" o "finalizado", revisamos si hay otro turno activo
          if (newEstado === 'atendido' || newEstado === 'finalizado') {
            fetchCitasEnConsulta();  // Verifica si queda alguna cita en consulta
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const formatoHora = citaActual?.programmer_at
    ? new Date(citaActual.programmer_at).toLocaleString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : '--:--';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="turno-visual-container">
      <button 
        onClick={handleLogout}
        className="turno-salir"
      >
        <FaSignOutAlt />
      </button>

      {/* Mostrar el turno activo */}
      {citaActual && !showWaiting && (
        <div className="turno-content animate-fade-in">
          <div className="turno-header">
            <h1>Turno Actual</h1>
          </div>

          <div className="turno-patient">
            <div className="avatar-circle">
              <FaUserClock className="avatar-icon" />
            </div>
            <h2 className="patient-name">{citaActual.nombre}</h2>
          </div>

          <div className="turno-details">
          {/*  <div className="detail-item">
              <FaClock className="detail-icon" />
              <span className="detail-label">Hora:</span>
              <span className="detail-value">{formatoHora}</span>
            </div>
          */}
            <div className="detail-item">
              <FaInfoCircle className="detail-icon" />
              <span className="detail-label">Estado:</span>
              <span className={`status-badge ${citaActual.estado.toLowerCase().replace(' ', '-')}`}>
                {citaActual.estado.toUpperCase()}
              </span>
            </div>

            <div className="detail-item">
              <FaUserMd className="detail-icon" />
              <span className="detail-label">Doctor:</span>
              <span className="detail-value doctor">
                {citaActual.doctor_name || 'Por asignar'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar mensaje de espera */}
      {!citaActual && showWaiting && (
        <div className="waiting-message animate-fade-in">
          <FaUserClock className="waiting-icon" />
          <p>Esperando que un doctor inicie una consulta...</p>
        </div>
      )}
    </div>
  );
}
