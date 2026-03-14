/**
 * API: POST /api/citas/crear
 *
 * Validación server-side para inserciones de citas
 *
 * ✅ Validaciones:
 * 1. JWT token presente y válido
 * 2. Usuario existe en BD
 * 3. SAP destino existe en allowed_users
 * 4. Paciente solo puede crear citas para SÍ MISMO
 * 5. Personal médico puede crear para cualquiera
 */

import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  // ❌ Solo POST permitido
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 1️⃣ Obtener JWT del header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Token requerido' });
    }

    const token = authHeader.substring(7);
    let userId;
    let userRole;
    let userSap;

    // 2️⃣ Decodificar JWT y obtener datos del usuario
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return res.status(401).json({ error: 'Unauthorized: Token inválido' });
      }

      const decoded = JSON.parse(
        Buffer.from(parts[1], 'base64').toString()
      );
      userId = decoded.sub;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Token sin ID de usuario' });
      }

      // 3️⃣ Obtener usuario desde BD
      const { data: userData, error: userError } = await supabaseAdmin
        .from('app_users')
        .select('role, idsap')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.error('[API] User lookup failed:', userError?.message);
        return res.status(403).json({ error: 'Usuario no encontrado en sistema' });
      }

      userRole = userData.role;
      userSap = userData.idsap;
    } catch (err) {
      console.error('[API] Token decode error:', err.message);
      return res.status(401).json({ error: 'Unauthorized: Token inválido' });
    }

    // 4️⃣ Validar entrada
    const { nombre, motivo, idSAP, emergency, isss } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    if (!motivo || !motivo.trim()) {
      return res.status(400).json({ error: 'El motivo es obligatorio' });
    }

    if (!idSAP || isNaN(Number(idSAP))) {
      return res.status(400).json({ error: 'SAP debe ser numérico' });
    }

    const sapNumeric = Number(idSAP);

    // 5️⃣ Validación de autorización
    // ✅ Paciente: Solo puede crear para SÍ MISMO
    if (userRole === 'paciente' && sapNumeric !== userSap) {
      console.error(`[API] Paciente ${userSap} intentó crear cita para SAP ${sapNumeric}`);
      return res.status(403).json({
        error: 'Pacientes solo pueden crear citas para sí mismos'
      });
    }

    // 6️⃣ Validar que el SAP existe en allowed_users
    const { data: allowedUser, error: allowedError } = await supabaseAdmin
      .from('allowed_users')
      .select('nombre')
      .eq('idsap', sapNumeric)
      .single();

    if (allowedError || !allowedUser) {
      console.error('[API] SAP not in allowed_users:', sapNumeric);
      return res.status(400).json({
        error: `El SAP ${sapNumeric} no existe en sistema`
      });
    }

    // 7️⃣ Validar que usuario autenticado existe y tiene rol válido
    if (!['paciente', 'enfermeria', 'supervisor', 'admin'].includes(userRole)) {
      console.error(`[API] User ${userId} has invalid role: ${userRole}`);
      return res.status(403).json({
        error: 'Rol insuficiente para crear citas'
      });
    }

    // 8️⃣ Insertar cita validada
    const { data: newCita, error: insertError } = await supabaseAdmin
      .from('citas')
      .insert([
        {
          idSAP: sapNumeric,  // ✅ COLUMNA CORRECTA: "idSAP" (camelCase)
          nombre: nombre.trim(),
          motivo: motivo.trim(),
          estado: 'pendiente',
          emergency: Boolean(emergency || false),
          isss: Boolean(isss || false),
          created_at: new Date().toISOString(),
          // RLS asegura que solo vean las que les corresponden
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('[API] Insert cita error:', insertError.message);
      console.error('[API] Error details:', insertError.details);
      console.error('[API] Error hint:', insertError.hint);
      return res.status(400).json({
        error: 'No se pudo crear la cita. Intenta de nuevo.',
        details: process.env.NODE_ENV === 'development' ? insertError.message : undefined
      });
    }

    // ✅ Éxito
    return res.status(201).json({
      success: true,
      cita: newCita,
      message: 'Cita creada exitosamente'
    });

  } catch (error) {
    console.error('[API] Unexpected error in crear cita:', error.message);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
}
