// pages/api/admin/crear-usuario.js

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password, role, idsap } = req.body;
  if (!email || !password || !role || !idsap) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // 1. Crear en auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) throw new Error('Error creando en auth: ' + authError.message);

    const id = authUser.user.id;

    // 2. Verificar si el idsap está en allowed_users
    const { data: allowed, error: allowedError } = await supabaseAdmin
      .from('allowed_users')
      .select('idsap')
      .eq('idsap', idsap)
      .single();
    if (allowedError && allowedError.code !== 'PGRST116') {
      throw new Error('Error consultando allowed_users: ' + allowedError.message);
    }

    const status = !!allowed; // true si existe en allowed_users

    // 3. Insertar en app_users con la estructura correcta
    const { error: insertError } = await supabaseAdmin.from('app_users').insert({
      id,
      role,        // column 'role' en lugar de 'rol_name'
      idsap,
      status       // column 'status' en lugar de 'estado'
    });
    if (insertError) throw new Error('Error insertando en app_users: ' + insertError.message);

    // Éxito
    return res.status(200).json({ success: true, userId: id });
  } catch (err) {
    console.error('Error en crear-usuario API:', err);
    return res.status(500).json({ error: err.message });
  }
}
