import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id, role, status } = req.body;  // Datos a actualizar

  if (!id || !role || status === undefined) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const supabase = supabaseAdmin();

  try {
    // Verificar si el usuario existe
    const { data: user, error: userError } = await supabase
      .from('app_users')
      .select('id')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Solo actualizamos si hay cambios
    const updatedFields = {};
    if (role !== user.role) updatedFields.role = role;
    if (status !== user.status) updatedFields.status = status;

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ error: 'No hay cambios para actualizar' });
    }

    // 1. Actualizar el rol y el status del usuario en la tabla 'app_users'
    const { error: updateError } = await supabase
      .from('app_users')
      .update(updatedFields)
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando usuario: ' + err.message });
  }
}
