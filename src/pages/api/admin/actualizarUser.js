import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;
  const { role, status } = req.body;  // Datos a actualizar

  if (!id || !role || status === undefined) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const supabase = supabaseAdmin();

  try {
    // 1. Actualizar el rol y el status del usuario en la tabla 'app_users'
    const { error: updateError } = await supabase
      .from('app_users')
      .update({ role, status })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando usuario: ' + err.message });
  }
}
