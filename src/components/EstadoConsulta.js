// components/EstadoConsultorioSupervisor.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function EstadoConsulta() {
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    // 1. Cargar estado inicial
    const fetchEstadoInicial = async () => {
      const { data } = await supabase
        .from('estado_consultorio')
        .select('medico_activo')
        .single();
      
      if (data) setActivo(data.medico_activo);
    };

    fetchEstadoInicial();

    // 2. Configurar suscripción a cambios
    const channel = supabase
      .channel('estado_medico_global')  // Nombre único para evitar colisiones
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'estado_consultorio',
        filter: 'id=eq.1'  // Solo escuchar cambios en el registro con id=1
      }, (payload) => {
        setActivo(payload.new.medico_activo);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div 
        className="estado-consultorio"
        data-status={activo ? 'activo' : 'inactivo'}
    >
      <p>
        {activo ? '🟢 En consultorio' : '🔴 No disponible'}
      </p>
    </div>
  );
}