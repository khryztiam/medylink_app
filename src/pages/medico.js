// doctor.js
import { useEffect, useState } from 'react'
import { getCitas, actualizarCita } from '../lib/citasData'
import { supabase } from '@/lib/supabase';
import DoctorPanel from '../components/DoctorPanel'

export default function Doctor() {
  const [citasProgramadas, setCitasProgramadas] = useState([])

  const obtenerCitasProgramadas = async () => {
    const todas = await getCitas()
    const programadas = todas
      .filter(c => c.estado === 'en espera' || c.estado === 'en consulta')
      .sort((a, b) => new Date(a.programmer_at) - new Date(b.programmer_at))
    setCitasProgramadas(programadas)
  }

useEffect(() => {
  obtenerCitasProgramadas()

  const canal = supabase
    .channel('supabase_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'citas' },
      async (payload) => {
        console.log('Cambio detectado:', payload)

        // Detectar si el cambio fue a "en espera"
        const nuevoEstado = payload.new?.estado
        const estadoAnterior = payload.old?.estado

        const cambioAEspera =
          (payload.eventType === 'UPDATE' &&
            estadoAnterior !== 'en espera' &&
            nuevoEstado === 'en espera') ||
          (payload.eventType === 'INSERT' &&
            nuevoEstado === 'en espera')

        if (cambioAEspera) {
          const sonido = new Audio('/doorbell.mp3')
          sonido.play().catch(err => {
            console.warn('Error al reproducir sonido:', err)
          })
        }

        // Actualizamos la lista de citas luego del sonido
        await obtenerCitasProgramadas()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(canal)
  }
}, [])


  const atender = async (id, doctor) => {
    if (!doctor) return; // Validación adicional
    await actualizarCita(id, { estado: 'en consulta', doctor_name: doctor })
  }

  const finalizar = async (id) => {
    try {
      // Verificamos que la cita esté en estado "en consulta"
      const { data: cita } = await supabase
        .from('citas')
        .select('check_in, estado')
        .eq('id', id)
        .single();
      
      if (!cita) throw new Error('Cita no encontrada');
      if (cita.estado !== 'en consulta') {
        throw new Error('Solo se pueden finalizar citas en estado "en consulta"');
      }
      
      // Actualizamos con check_out
      await actualizarCita(id, { 
        estado: 'atendido',
        check_out: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error al finalizar cita:', error.message);
      // Puedes mostrar una notificación al usuario aquí
      alert(error.message);
    }
  }

  return (
    <div className="doctor-container">
      <h1 className='title'>Panel de Control de Citas</h1>
      <DoctorPanel
        citas={citasProgramadas}
        onAtender={atender}
        onFinalizar={finalizar}
      />
    </div>
  )
}
