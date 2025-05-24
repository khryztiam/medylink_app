// pages/api/admin/importarAllowed.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  // Configurar headers para JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const supabase = supabaseAdmin();
  let entries;

  try {
    // Parsear el body
    entries = JSON.parse(req.body);
  } catch (e) {
    return res.status(400).json({ error: 'Cuerpo de solicitud no válido' });
  }

  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'Formato incorrecto: se esperaba un array' });
  }

  try {
    // 1. Obtener IDs existentes
    const { data: existingUsers, error: fetchError } = await supabase
      .from('allowed_users')
      .select('idsap');

    if (fetchError) throw fetchError;

    const existingIds = existingUsers.map(user => user.idsap);

    // 2. Procesar datos
    const formatted = entries
      .filter(entry => entry.idsap)
      .map(entry => ({
        idsap: String(entry.idsap).trim(),
        nombre: entry.nombre?.trim() || '',
        grupo: entry.grupo?.trim() || '',
        descripcion: entry.descripcion?.trim() || '',
        puesto: entry.puesto?.trim() || ''
      }));

    // 3. Ejecutar upsert
    const { data: upsertedData, error: upsertError } = await supabase
      .from('allowed_users')
      .upsert(formatted, { onConflict: ['idsap'] })
      .select('*');

    if (upsertError) throw upsertError;

    // 4. Calcular métricas
    const inserted = upsertedData.filter(user => !existingIds.includes(user.idsap)).length;
    const updated = upsertedData.length - inserted;

    return res.status(200).json({
      success: true,
      inserted,
      updated,
      total: upsertedData.length
    });

  } catch (err) {
    console.error('Error en importarAllowed:', err);
    return res.status(500).json({ 
      error: err.message || 'Error interno del servidor' 
    });
  }
}