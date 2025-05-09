// components/MedicoActivo.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function MedicoActivo() {
  const [activo, setActivo] = useState(false);

  // Cargar estado inicial y suscribirse a cambios
  useEffect(() => {
    const fetchEstado = async () => {
      const { data } = await supabase
        .from('estado_consultorio')
        .select('medico_activo')
        .single();
      setActivo(data?.medico_activo || false);
    };

    fetchEstado();

    const channel = supabase
      .channel('estado_medico_flotante')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'estado_consultorio'
      }, (payload) => {
        setActivo(payload.new.medico_activo);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const toggleEstado = async () => {
    const nuevoEstado = !activo;
    const { error } = await supabase
      .from('estado_consultorio')
      .update({ medico_activo: nuevoEstado })
      .eq('id', 1);

    if (error) console.error("Error al actualizar estado:", error);
  };

  return (
    <div className={`floating-medico-status ${activo ? 'activo' : 'inactivo'}`}>
      <button 
        onClick={toggleEstado}
        className="status-toggle"
        aria-label={activo ? 'Desactivar consultas' : 'Activar consultas'}
      >
        <div className="status-icon">
          {activo ? '🩺' : '🚫'}
        </div>
        <span className="status-text">
          {activo ? 'Consulta ACTIVA' : 'Consulta INACTIVA'}
        </span>
      </button>
    </div>
  );
}