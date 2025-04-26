// pages/api/admin/importarAllowed.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const supabase = supabaseAdmin();
  const { entries } = req.body;

  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'Formato incorrecto' });
  }

  try {
    const formatted = entries.map(({ idsap, nombre, grupo }) => ({
      idsap: idsap?.trim(),
      nombre: nombre?.trim(),
      grupo: grupo?.trim()
    }));

    const { error } = await supabase
      .from('allowed_users')
      .upsert(formatted, { onConflict: ['idsap'] }); // evita duplicados

    if (error) throw error;

    res.status(200).json({ message: 'Importación completada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
