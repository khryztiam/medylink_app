import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  // Configuración básica de CORS y métodos permitidos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Content-Type', 'application/json');

  // Manejo de preflight para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido',
      allowedMethods: ['POST'] 
    });
  }

  try {
    // Parseo seguro del body
    const { entries } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'El cuerpo debe contener un array "entries"' });
    }

    // Procesamiento de datos
    const formatted = entries.map(item => ({
      idsap: String(item.idsap || '').trim(),
      nombre: String(item.nombre || '').trim(),
      grupo: String(item.grupo || '').trim(),
      descripcion: String(item.descripcion || '').trim(),
      puesto: String(item.puesto || '').trim()
    })).filter(item => item.idsap);

    // Operación en Supabase
    const { data, error } = await supabaseAdmin()
      .from('allowed_users')
      .upsert(formatted, { onConflict: ['idsap'] })
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      inserted: data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en API:', error);
    return res.status(500).json({ 
      error: error.message || 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}