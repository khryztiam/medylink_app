// Archivo: /pages/api/admin/users/index.js
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password, idsap, role } = req.body;

    // Crear en auth.users
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authUser.user.id;

    // Validar si está en allowed_users
    const { data: allowed, error: allowedError } = await supabase
      .from("allowed_users")
      .select("nombre")
      .eq("idsap", idsap)
      .single();

    const status = !!allowed;

    // Crear en app_users
    const { error: appUserError } = await supabase
      .from("app_users")
      .insert({ id: userId, idsap, role, status });

    if (appUserError)
      return res.status(400).json({ error: appUserError.message });

    return res.status(201).json({
      id: userId,
      email,
      idsap,
      role,
      status,
      nombre: allowed?.nombre || null,
    });
  }

  if (req.method === "GET") {
    try {
      // Obtener parámetros de consulta con valores por defecto
      const { page = 1, limit = 25, search = "", field = "idsap" } = req.query;
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);

      // Validar parámetros
      if (isNaN(pageInt) || pageInt < 1) {
        return res
          .status(400)
          .json({ error: "Parámetro page debe ser un número mayor a 0" });
      }
      if (isNaN(limitInt) || limitInt < 1 || limitInt > 25) {
        return res
          .status(400)
          .json({ error: "Parámetro limit debe ser un número entre 1 y 25" });
      }

      const offset = (pageInt - 1) * limitInt;

      // Construir consulta base con conteo exacto
      let query = supabase
        .from("app_users")
        .select("id, idsap, role, status, allowed_users(nombre)", {
          count: "exact",
        });

      // Filtros
      if (search && search.trim() !== "") {
        if (field === "idsap") {
          query = query.ilike("idsap", `%${search.trim()}%`);
        } else if (field === "nombre") {
          query = query.ilike("allowed_users.nombre", `%${search.trim()}%`);
        }
      }

      // Paginación
      const { data, error, count } = await query.range(
        offset,
        offset + limitInt - 1
      );

      if (error) {
        console.error("Detalles del error de Supabase:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return res.status(400).json({
          error: "Error en la consulta a la base de datos",
          supabase_error: error.message,
          code: error.code,
        });
      }

      // Verificar si hay datos
      if (!data) {
        return res.status(200).json({
          users: [],
          currentPage: pageInt,
          totalPages: 0,
          totalUsers: 0,
        });
      }

      // Procesar resultados
      const users = data
        .map((user) => ({
          id: user.id,
          idsap: user.idsap,
          role: user.role,
          status: user.status,
          nombre: user.allowed_users?.nombre || "",
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      return res.status(200).json({
        users,
        currentPage: pageInt,
        totalPages: Math.max(1, Math.ceil(count / limitInt)),
        totalUsers: count || 0,
      });
    } catch (error) {
      console.error("Error en GET /api/admin/users:", error);
      return res.status(500).json({
        error: "Error interno del servidor",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
