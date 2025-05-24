import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' })
  }

  try {
    const { data: csvData } = req.body

    if (!csvData || !Array.isArray(csvData)) {
      return res.status(400).json({ error: 'Datos CSV no válidos' })
    }

    // Procesamiento de datos
    // Insertar datos en Supabase
    const { data, error } = await supabaseAdmin
      .from('allowed_users') // Reemplaza con tu tabla
      .insert(csvData)

    if (error) {
      console.error('Error al insertar datos:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ 
      message: 'Datos insertados correctamente',
      insertedRows: data.length 
    })
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}