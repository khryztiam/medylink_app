import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { data: csvUsers } = req.body

    // Validación estricta de estructura
    const validatedUsers = csvUsers.map((row, index) => {
      // 1. Validar idsap (debe existir y ser número)
      if (!row.idsap || isNaN(Number(row.idsap))) {
        throw new Error(`Fila ${index + 1}: idsap inválido o faltante`)
      }

      // 2. Validar nombre (debe existir y no estar vacío)
      if (!row.nombre || typeof row.nombre !== 'string' || row.nombre.trim() === '') {
        throw new Error(`Fila ${index + 1}: nombre inválido o vacío`)
      }

      // 3. Validar grupo (opcional pero debe ser número si existe)
      if (row.grupo && isNaN(Number(row.grupo))) {
        throw new Error(`Fila ${index + 1}: grupo debe ser numérico`)
      }

      // 4. Preparar objeto limpio
      return {
        idsap: Number(row.idsap),
        nombre: row.nombre.trim(),
        grupo: row.grupo ? Number(row.grupo) : null,
        puesto: row.puesto ? row.puesto.trim() : null
      }
    })

    // Obtener usuarios existentes (solo ids)
    const { data: existingUsers, error: fetchError } = await supabaseAdmin
      .from('allowed_users')
      .select('idsap')

    if (fetchError) throw fetchError

    const existingIds = existingUsers.map(u => Number(u.idsap))
    const csvIds = validatedUsers.map(u => Number(u.idsap))

    // Identificar operaciones
    const usersToAdd = validatedUsers.filter(u => !existingIds.includes(Number(u.idsap)))
    const usersToUpdate = validatedUsers.filter(u => existingIds.includes(Number(u.idsap)))
    const usersToRemove = existingUsers.filter(u => !csvIds.includes(Number(u.idsap)))

    // Ejecutar en transacción
    const { error: syncError } = await supabaseAdmin.rpc('sync_users_complete', {
      add_users: usersToAdd,
      update_users: usersToUpdate,
      remove_ids: usersToRemove.map(u => Number(u.idsap))
    })

    if (syncError) throw syncError

    return res.status(200).json({
      success: true,
      added: usersToAdd.length,
      updated: usersToUpdate.length,
      removed: usersToRemove.length,
      total: validatedUsers.length
    })

  } catch (error) {
    console.error('Error en sincronización:', error)
    return res.status(500).json({
      error: 'Error en sincronización',
      details: error.message,
      type: 'data_validation_error'
    })
  }
}