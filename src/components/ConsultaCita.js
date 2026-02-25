// components/ConsultaCita.js
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FaUser, FaClock, FaCheckCircle, FaSearch } from "react-icons/fa";

export default function ConsultaCita({ citas }) {
  const { role, idsap } = useAuth();
  const [searchSAP, setSearchSAP] = useState("");
  const [filteredCitas, setFilteredCitas] = useState([]);

  const esPaciente = role === "paciente";

  useEffect(() => {
    if (!Array.isArray(citas)) return;

    if (esPaciente && idsap) {
      // El paciente siempre ve sus propias citas automáticamente
      const susCitas = citas.filter((c) => String(c.idSAP) === String(idsap));
      setFilteredCitas(susCitas);
    } else {
      // Admin/Enfermera: Iniciamos vacío para no saturar la pantalla
      setFilteredCitas([]);
    }
  }, [citas, idsap, esPaciente]);

  const buscar = () => {
    if (!searchSAP.trim()) {
      // Opcional: Si borran el buscador, podemos vaciar la tabla o mostrar alerta
      setFilteredCitas([]);
      return;
    }

    const encontradas = citas.filter(
      (c) => String(c.idSAP) === searchSAP.trim(),
    );

    setFilteredCitas(encontradas);

    if (encontradas.length === 0) {
      alert("No se encontraron registros para este ID SAP");
    }
  };

  // Helper para formatear fechas de forma más corta y limpia
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="consulta-cita-container">
      <div className="table-header-flex">
        <h3 className="historial-title">Historial de Solicitudes</h3>
        {!esPaciente && (
          <div className="search-box-modern">
            <input
              placeholder="Buscar SAP..."
              value={searchSAP}
              onChange={(e) => setSearchSAP(e.target.value)}
            />
            <button
              onClick={() =>
                setFilteredCitas(
                  citas.filter((c) => String(c.idSAP) === searchSAP.trim()),
                )
              }
            >
              <FaSearch />
            </button>
          </div>
        )}
      </div>

      <div className="table-responsive-wrapper">
        <table className="table-citas-modern">
          <thead>
            <tr>
              {!esPaciente && <th>Paciente</th>}
              <th>MOTIVO</th>
              <th>SOLICITUD</th>
              <th>CITA PROGRAMADA</th>
              <th>SALIDA</th>
              <th className="text-center">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filteredCitas.length > 0 ? (
              filteredCitas.map((cita) => (
                <tr key={cita.id} className="row-hover-effect">
                  {!esPaciente && <td className="font-bold">{cita.nombre}</td>}
                  <td className="td-motivo-v2">{cita.motivo}</td>
                  <td className="td-date-v2">{formatDate(cita.created_at)}</td>
                  <td className="td-date-v2">
                    {formatDate(cita.programmer_at)}
                  </td>
                  <td className="td-date-v2">{formatDate(cita.check_out)}</td>
                  <td className="text-center">
                    <span
                      className={`badge-status-v2 status-${cita.estado?.toLowerCase()}`}
                    >
                      {cita.estado}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={esPaciente ? "5" : "7"}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#718096",
                  }}
                >
                  {esPaciente
                    ? "No tienes historial de citas aún."
                    : "🔍 Ingresa un ID SAP arriba para consultar el historial del paciente."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
