import { supabase } from '@/lib/supabase'

export async function getCitas() {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .order('created_at', { ascending: false }); // cambiar a false para el orden
    if (error) {
        console.error('Error al obtener citas:', error);
        return []; // 👈 Muy importante: retornar array vacío si hay error
      }
    
      return data || []; // 👈 Asegura que siempre retorna un array
    }

export async function agregarCita({ nombre, motivo, idSAP, emergency }) {
    // Asegurarse de que idSAP sea un número entero
    if (!idSAP || isNaN(idSAP)) {
        throw new Error('El campo idSAP es obligatorio y debe ser un número válido.')
      }
    const { data, error } = await supabase
    .from('citas')
    .insert([{ idSAP, nombre, motivo, estado: 'pendiente', emergency:emergency }])
    .single()
  if (error) throw error
  return data
}

export async function actualizarCita(id, cambios) {
  const { data, error } = await supabase
    .from('citas')
    .update(cambios)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

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

export async function finalizarCita(id) {
  // Primero verifica que exista check_in
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