import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import CitaForm from '@/components/CitaForm'; // 👈 Asegúrate de que el path esté correcto
import { v4 as uuidv4 } from 'uuid';
import { agregarCita, getCitas } from '../lib/citasData'

const Supervisor = () => {
  const [citasProgramadas, setCitasProgramadas] = useState([]);
  const [cuposTotales] = useState(50); // 👈 Número mockup de cupos diarios
  const [tiempoPromedio, setTiempoPromedio] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // exito / error
  const [cuposOcupados, setCuposOcupados] = useState(0);

  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  
  const hoyFin = new Date();
  hoyFin.setHours(23, 59, 59, 999);

  // Nueva función para obtener los cupos ocupados (excluyendo 'pendiente')
  const fetchCuposOcupados = async () => {
    const { data, error } = await supabase
      .from('citas')
      .select('*')
      .not('estado', 'eq', 'pendiente')  // Excluye estado 'pendiente'
      .gte('programmer_at', hoyInicio.toISOString())
      .lte('programmer_at', hoyFin.toISOString())
      .order('programmer_at', { ascending: true });

    if (error) {
      console.error('Error al obtener cupos ocupados:', error);
      return;
    }

    // Contamos las citas ocupadas
    const cuposOcupados = data.length;

    setCuposOcupados(cuposOcupados);
  };

  // Fetch inicial de citas programadas
  const fetchCitasProgramadas = async () => {
    const { data, error } = await supabase
      .from('citas')
      .select('*')
      .eq('estado', 'programado')
      .order('programmer_at', { ascending: true });

    if (error) {
      console.error('Error al obtener citas:', error);
      return;
    }

    setCitasProgramadas(data);
  };

  // Calcular tiempo promedio de atención
  const fetchTiempoPromedio = async () => {
    const { data, error } = await supabase
      .from('citas')
      .select('check_in, check_out')
      .eq('estado', 'atendido');

    if (error) {
      console.error('Error al calcular tiempo promedio:', error);
      return;
    }

    if (data.length === 0) {
      setTiempoPromedio(null);
      return;
    }

    const tiempos = data
      .filter(cita => cita.check_in && cita.check_out)
      .map(cita => {
        const inicio = new Date(cita.check_in);
        const fin = new Date(cita.check_out);
        return (fin - inicio) / 60000; // minutos
      });

    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    setTiempoPromedio(promedio.toFixed(1));
  };

  useEffect(() => {
    fetchCitasProgramadas();
    fetchTiempoPromedio();
    fetchCuposOcupados();     // Trae los cupos ocupados

    const canal = supabase
      .channel('supervisor_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, (payload) => {
        fetchCitasProgramadas();
        fetchTiempoPromedio();
        fetchCuposOcupados();  // Actualiza los cupos ocupados en tiempo real
      })
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const handleNuevaCita = async (nombre, motivo, idSAPInt, urgente) => {
    try {
      const nuevaCita = {
        id: uuidv4(),
        nombre,
        motivo,
        idSAP: idSAPInt,
        estado: 'pendiente',
        orden_llegada: null,
        emergency: urgente,
      };
  
      await agregarCita(nuevaCita);
  
      // Mensaje de éxito
      setTipoMensaje('exito');
      setMensaje('✅ Cita creada exitosamente.');
  
    } catch (error) {
      console.error('Error al crear la cita:', error);
      setTipoMensaje('error');
      setMensaje('❌ Ocurrió un error al crear la cita.');
    }
  
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setMensaje('');
      setTipoMensaje('');
    }, 3000);
  };

  return (
    <div className="supervisor-container">
      <h1 className="title">Control de Supervisor</h1>
      <div className="enf-card">
          {/* eslint-disable @next/next/no-img-element */}
          <img src="/produccion.png" alt="banner" className='enf-card-banner' loading='eager' decoding='sync'/>
      </div>
      <div className="panels-container">
        
        {/* Panel principal */}
        <div className="panel-main">
          <h2 className="panel-title">Resumen de Citas</h2>

          <div className="summary-cards">
            {/* Cupos Disponibles */}
            <div className="summary-card">
              <h3>Cupos Disponibles</h3>
              <p>{cuposTotales - cuposOcupados} / {cuposTotales}</p>
            </div>

            {/* Tiempo Promedio */}
            <div className="summary-card">
              <h3>Tiempo Promedio</h3>
              <p>{tiempoPromedio ? `${tiempoPromedio} min` : 'No disponible'}</p>
            </div>
          </div>

          {/* Lista de citas programadas */}
          <div className="panel-content">
            {citasProgramadas.length > 0 ? (
              <ul className="citas-list">
                {citasProgramadas.map(cita => (
                  <li key={cita.id}>
                    <strong>{cita.nombre}</strong> - {new Date(cita.programmer_at).toLocaleString('es-MX', { day:'2-digit', month:'2-digit', year:'numeric',hour: '2-digit', minute: '2-digit', hour12: true })}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay citas programadas actualmente.</p>
            )}
          </div>
        </div>

        {/* Panel secundario */}
        <div className="panel-side">
          
          <div className="panel-content">
            <CitaForm onSubmit={handleNuevaCita}/>
            {mensaje && (
            <div className={`mensaje-alerta ${tipoMensaje}`}>
              {mensaje}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supervisor;
