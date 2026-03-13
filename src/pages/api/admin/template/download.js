// /pages/api/admin/template/download.js
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // ✅ Plantilla CSV con SOLO campos requeridos
  // idsap: SAP único del empleado (número)
  // nombre: Nombre completo (se muestra en login del usuario)
  const csvContent = `idsap,nombre
99991,Juan Pérez García
99992,María López Hernández
99993,Carlos Rodríguez López
99994,Ana Martínez Gómez
99995,Roberto Flores Sánchez
99996,Sandra Morales Castro
99997,Fernando González López`;

  // Headers para descargar como archivo
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="allowed_users_template.csv"');
  
  // BOM para Excel reconozca UTF-8 correctamente
  res.send("\uFEFF" + csvContent);
}
