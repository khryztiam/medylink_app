import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' })
  }

  try {
    const { data: csvUsers } = req.body

    // Convertir idsap del CSV a números
    const processedUsers = csvUsers.map(user => {
      const idsap = Number(user.idsap)
      if (isNaN(idsap)) {
        throw new Error(`Valor idsap inválido: ${user.idsap}`)
      }
      return {
        ...user,
        idsap: idsap // Asegurar que es número
      }
    })


    // Paso 1: Obtener todos los IDs actuales de Supabase
    const { data: existingUsers, error: fetchError } = await supabaseAdmin
      .from('allowed_users')
      .select('idsap')

    if (fetchError) throw fetchError

    const existingIds = existingUsers.map(user => String(user.idsap))
    const csvIds = processedUsers.map(user => String(user.idsap))

    // Paso 2: Identificar usuarios a agregar y eliminar
    const usersToAdd = processedUsers.filter(user => !existingIds.includes(String(user.idsap)))
    const usersToRemove = existingUsers.filter(user => !csvIds.includes(String(user.idsap)))

    // Paso 3: Ejecutar operaciones en transacción
    const { error: transactionError } = await supabaseAdmin.rpc('sync_users', {
      add_users: usersToAdd,
      remove_ids: usersToRemove.map(user => user.idsap)
    })

    if (transactionError) throw transactionError

    // Respuesta exitosa
    return res.status(200).json({
      added: usersToAdd.length,
      removed: usersToRemove.length,
      total: csvUsers.length,
      message: 'Sincronización completada'
    })

  } catch (error) {
    console.error('Error en sincronización:', error)
    return res.status(500).json({ 
      error: 'Error en sincronización',
      details: error.message 
    })
  }
}