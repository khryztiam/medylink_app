// Archivo: /pages/api/users/index.js

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, idsap, role } = req.body;

    // Crear en auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authUser.user.id;

    // Validar si está en allowed_users
    const { data: allowed, error: allowedError } = await supabase
      .from('allowed_users')
      .select('nombre')
      .eq('idsap', idsap)
      .single();

    const status = !!allowed;

    // Crear en app_users
    const { error: appUserError } = await supabase
      .from('app_users')
      .insert({ id: userId, idsap, role, status });

    if (appUserError) return res.status(400).json({ error: appUserError.message });

    return res.status(201).json({ id: userId, email, idsap, role, status, nombre: allowed?.nombre || null });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, idsap, role, status, allowed_users(nombre)');

    if (error) return res.status(500).json({ error: error.message });

    const result = data.map(user => ({
      ...user,
      nombre: user.allowed_users?.nombre || ''
    }));

    return res.status(200).json(result);
  }

  res.setHeader('Allow', ['POST', 'GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
