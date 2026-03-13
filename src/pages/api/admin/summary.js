// /pages/api/admin/summary.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // ✅ Usa supabaseAdmin para bypassear RLS
    const { data, error } = await supabaseAdmin
      .from("app_users")
      .select("role");

    if (error) {
      // ✅ Sanitizar error (no exponer detalles técnicos)
      console.error("[API] Error fetching user summary:", error);
      return res.status(500).json({ 
        error: "No se pudo obtener el resumen" 
      });
    }

    // Contar usuarios por rol
    const resumen = data.reduce((acc, { role }) => {
      const key = role || "Sin rol";
      acc[key] = (acc[key] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json(resumen);
  } catch (error) {
    console.error("[API] Unexpected error in summary:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor" 
    });
  }
}
