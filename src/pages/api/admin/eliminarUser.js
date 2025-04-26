import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID del usuario es necesario' });
  }

  const supabase = supabaseAdmin();

  try {
    // 1. Eliminar el usuario de la tabla 'app_users'
    const { error: deleteAppUserError } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id);

    if (deleteAppUserError) throw deleteAppUserError;

    // 2. Eliminar el usuario de la tabla 'auth.users' (si también quieres eliminarlo de allí)
    const { error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(id);

    if (deleteAuthUserError) throw deleteAuthUserError;

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando usuario: ' + err.message });
  }
}
