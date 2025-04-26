import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { data: users, error } = await supabaseAdmin
      .from('app_users')
      .select(`
        id,
        idsap,
        role,
        status,
        created_at,
        allowed_users(nombre)
      `);

    if (error) throw error;

    const formatted = (users || []).map(u => ({
      id: u.id,
      nombre: u.allowed_users?.nombre || null,
      idsap: u.idsap,
      role: u.role,
      status: u.status,
      created_at: u.created_at
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}