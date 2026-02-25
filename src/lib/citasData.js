import { supabase } from '@/lib/supabase'

/**
 * 1. OBTENER CITAS DE HOY (Para Admin/Enfermería)
 * Ideal para el "vanguardia" del día sin cargar historial viejo.
 */
export async function getCitasHoy() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .gte('created_at', hoy.toISOString())
    .lt('created_at', manana.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener citas de hoy:', error);
    return [];
  }
  return data || [];
}

/**
 * 2. BUSCAR POR SAP CON LÍMITE (Para Historial/Admin)
 * Trae solo los últimos 15 registros para mantener la agilidad.
 */
export async function getCitasPorPaciente(idSAP, limite = 15) {
  if (!idSAP) return [];
  
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('idSAP', idSAP)
    .order('created_at', { ascending: false })
    .limit(limite); // 👈 Limitamos la carga de datos

  if (error) {
    console.error('Error al buscar historial por SAP:', error);
    return [];
  }
  return data || [];
}

/**
 * 3. AGREGAR NUEVA CITA
 */
export async function agregarCita({ nombre, motivo, idSAP, emergency, isss }) {
  if (!idSAP || isNaN(idSAP)) {
    throw new Error('El campo idSAP es obligatorio y debe ser un número válido.');
  }

  const { data, error } = await supabase
    .from('citas')
    .insert([{ 
      idSAP, 
      nombre, 
      motivo, 
      estado: 'pendiente', 
      emergency: !!emergency, 
      isss: !!isss 
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 4. ACTUALIZAR ESTADO / DATOS
 */
export async function actualizarCita(id, cambios) {
  const { data, error } = await supabase
    .from('citas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 5. REGISTRAR ENTRADA (Check-in)
 */
export async function registrarCheckIn(id) {
  const { data, error } = await supabase
    .from('citas')
    .update({
      estado: 'en espera',
      check_in: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error en check-in: ${error.message}`);
  return data;
}

/**
 * 6. FINALIZAR CITA (Check-out)
 */
export async function finalizarCita(id) {
  const { data: citaExistente } = await supabase
    .from('citas')
    .select('check_in')
    .eq('id', id)
    .single();

  if (!citaExistente?.check_in) {
    throw new Error('No se puede finalizar cita sin check-in registrado');
  }

  const { data, error } = await supabase
    .from('citas')
    .update({
      estado: 'atendido',
      check_out: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error al finalizar: ${error.message}`);
  return data;
}

/**
 * 7. SUSCRIPCIÓN EN TIEMPO REAL
 */
export const subscribeToCitas = (callback) => {
  const subscription = supabase
    .channel('citas_changes')
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'citas',
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export async function getTodasLasCitas() {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error al traer citas globales:", error);
    return [];
  }
  return data || [];
}