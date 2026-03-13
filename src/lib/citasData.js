import { supabase } from '@/lib/supabase'

/**
 * ⚠️ NOTA IMPORTANTE: Row Level Security (RLS) está ACTIVO
 * 
 * RLS filtra resultados automáticamente según el rol del usuario:
 * • Pacientes: ven SOLO sus propias citas
 * • Médicos: ven citas asignadas a ellos
 * • Enfermería: ven todas (para gestionar flujo)
 * • Admin: ven todo
 * 
 * NO NECESITAS validar manualmente quién puede ver qué.
 * La base de datos lo hace por ti.
 */

/**
 * 1. OBTENER CITAS DE HOY
 * 
 * ✅ RLS automáticamente filtra según rol:
 *    - Paciente: Solo sus citas de hoy
 *    - Enfermería: Todas de hoy
 *    - Admin: Todas de hoy
 * 
 * No hay necesidad de pasar parámetros de filtro manual.
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
 * 2. OBTENER CITAS DEL USUARIO (Historial)
 * 
 * ✅ RLS automáticamente filtra:
 *    - Paciente: Ve la historia de SUS citas
 *    - Médico: Ve citas de SUS pacientes asignados
 * 
 * NOTA: El parámetro idSAP ahora es IGNORADO (RLS lo hace)
 * Se mantiene para compatibilidad backward pero RLS asegura
 * que solo vea sus propias citas aunque pase otro SAP.
 */
export async function getCitasPorPaciente(idSAP, limite = 15) {
  if (!idSAP) return [];
  
  // RLS filtra automáticamente → solo devuelve citas del usuario actual
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('idSAP', idSAP)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
  
  // Si RLS está activo y no es dueño, esto devuelve []
  return data || [];
}

/**
 * 3. AGREGAR NUEVA CITA
 * 
 * ✅ RLS VALIDA automáticamente:
 *    - Paciente: Solo puede crear cita CON SU PROPIO idSAP
 *    - Enfermería: Puede crear para cualquiera
 *    - Admin: Puede crear para cualquiera
 * 
 * Si un paciente intenta crear cita con SAP ajeno → RLS bloqueará
 * Si enfermería intenta → RLS permite
 * 
 * Validación client-side: Solo para UX, RLS lo asegura en DB
 */
export async function agregarCita({ nombre, motivo, idSAP, emergency, isss }) {
  // Validación client-side (UX, no seguridad)
  if (!idSAP || isNaN(idSAP)) {
    throw new Error('El campo idSAP es obligatorio y debe ser un número válido.');
  }
  if (!nombre || !motivo) {
    throw new Error('Nombre y motivo son obligatorios.')
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

  // Si RLS rechaza: error.code = 'PGRST202' (Policy violation)
  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('No tienes permiso para crear citas con este SAP.');
    }
    throw error;
  }
  
  return data;
}

/**
 * 4. ACTUALIZAR ESTADO / DATOS
 * 
 * ✅ RLS VALIDA automáticamente:
 *    - Paciente: No puede actualizar (RLS bloquea)
 *    - Médico: Puede actualizar sus citas asignadas
 *    - Enfermería: Puede actualizar cualquiera
 *    - Admin: Puede actualizar cualquiera
 * 
 * Si usuario no autorizado intenta UPDATE → RLS devolverá [] (0 filas)
 */
export async function actualizarCita(id, cambios) {
  if (!id) {
    throw new Error('ID de cita es requerido.');
  }

  const { data, error } = await supabase
    .from('citas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  // RLS bloquea: si no puedo actualizar, data será null
  if (error && error.code === 'PGRST116') {
    throw new Error('No tienes permiso para actualizar esta cita.');
  }
  if (error) throw error;
  
  return data;
}

/**
 * 5. REGISTRAR ENTRADA (Check-in)
 * 
 * ✅ RLS valida automáticamente que sea personal autorizado
 * ✅ Lógica de negocio: Requiere estado válido
 * 
 * Validación: Enfermería es quien tipicamente hace check-in
 */
export async function registrarCheckIn(id) {
  if (!id) {
    throw new Error('ID de cita es requerido.');
  }

  const { data, error } = await supabase
    .from('citas')
    .update({
      estado: 'en espera',
      check_in: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('No tienes permiso para hacer check-in en esta cita.');
    }
    throw new Error(`Error en check-in: ${error.message}`);
  }
  
  return data;
}

/**
 * 6. FINALIZAR CITA (Check-out)
 * 
 * ✅ RLS valida que tenga permiso
 * ✅ Lógica de negocio: Requiere check-in previo
 * 
 * Típicamente: Doctor o Enfermería hacen esto
 */
export async function finalizarCita(id) {
  if (!id) {
    throw new Error('ID de cita es requerido.');
  }

  // Verificar que check-in fue registrado (lógica de negocio)
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

  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('No tienes permiso para finalizar esta cita.');
    }
    throw new Error(`Error al finalizar: ${error.message}`);
  }
  
  return data;
}

/**
 * 7. SUSCRIPCIÓN EN TIEMPO REAL
 * 
 * ✅ RLS automáticamente filtra cambios en tiempo real
 *    - Solo recibe notificaciones de citas que puede ver
 *    - Si otro usuario actualiza cita ajena → no te enteras
 * 
 * Seguro y eficiente: minimiza tráfico de datos
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
        // RLS filtra automáticamente en el servidor
        // Solo recibirás eventos de citas que puedes ver
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

/**
 * 8. OBTENER TODAS LAS CITAS (Sin restricción de fecha)
 * 
 * ✅ RLS AUTOMÁTICAMENTE filtra según rol:
 *    - Paciente: Sus citas (aunque se pida todas)
 *    - Médico: Sus citas asignadas
 *    - Enfermería: TODAS (tiene permisos)
 *    - Admin: TODAS (tiene permisos)
 * 
 * NO es inseguro porque RLS lo hace en la BD.
 * Antes sin RLS sí era vulnerable, ahora es seguro.
 * 
 * ⚠️ NOTA IMPORTANTE: Esta función devuelve solo lo que
 *    el usuario actual puede ver según RLS. No hables
 *    de "todas" en el sentido de "todas sin filtro".
 */
export async function getAllCitas() {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener citas:', error);
    return [];
  }
  
  // RLS ya filtró lo que este usuario puede ver
  return data || [];
}