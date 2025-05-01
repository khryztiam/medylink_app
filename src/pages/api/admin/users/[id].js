// Archivo: /pages/api/users/[id].js
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (req.method === 'PUT') {
    const { role, status } = req.body;

    const { error } = await supabase
      .from('app_users')
      .update({ role, status })
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: 'Usuario actualizado correctamente' });
  }

  if (req.method === 'DELETE') {
    // Primero eliminar de app_users
    const { error: appUserError } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id);

    if (appUserError) return res.status(400).json({ error: appUserError.message });

    // Luego eliminar de auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) return res.status(400).json({ error: authError.message });

    return res.status(200).json({ message: 'Usuario eliminado correctamente' });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
