// /pages/api/admin/template/download.js
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Plantilla CSV con ejemplo
  const csvContent = `idsap,nombre,grupo,puesto
99991,Juan Pérez García,1,Médico General
99992,María López Hernández,1,Médica Internista
99993,Carlos Rodríguez López,2,Enfermero
99994,Ana Martínez Gómez,2,Enfermera
99995,Roberto Flores Sánchez,3,Coordinador
99996,Sandra Morales Castro,1,Médica Pediatra
99997,Fernando González López,,`;

  // Headers para descargar como archivo
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="allowed_users_template.csv"');
  
  // BOM para Excel reconozca UTF-8 correctamente
  res.send("\uFEFF" + csvContent);
}
