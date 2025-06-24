// components/admin/ResumenUsuariosCard.jsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaUserCog, FaUserMd, FaUserNurse, FaUserInjured, FaUsers, FaUserShield } from "react-icons/fa";

const roleConfig = {
  admin: {
    icon: <FaUserCog style={{ color: "#d9534f" }} />,
    color: "#fdecea",
  },
  medico: {
    icon: <FaUserMd style={{ color: "#38a169" }} />,
    color: "rgba(56, 161, 105, 0.1)",
  },
  enfermeria: {
    icon: <FaUserNurse style={{ color: "#9f7aea" }} />,
    color: "rgba(159, 122, 234, 0.1)",
  },
  paciente: {
    icon: <FaUserInjured style={{ color: "#3182ce" }} />,
    color: "rgba(49, 130, 206, 0.1)",
  },
  supervisor: {
    icon: <FaUserShield style={{ color: "#dd6b20" }} />,
    color: "rgba(221, 107, 32, 0.1)",
  },
  default: {
    icon: <FaUsers style={{ color: "#6c757d" }} />,
    color: "#f0f0f0",
  },
};

export default function ResumenUsuariosCard() {
    const [resumen, setResumen] = useState(null);

    useEffect(() => {
        const fetchResumen = async () => {
            const { data, error } = await supabase
                .from("app_users")
                .select("role");

            if (error) {
                console.error("Error cargando usuarios:", error.message);
                return;
            }

            const conteo = data.reduce((acc, { role }) => {
                const key = role || "Sin rol";
                acc[key] = (acc[key] || 0) + 1;
                acc.total = (acc.total || 0) + 1;
                return acc;
            }, {});

            setResumen(conteo);
        };

        fetchResumen();
    }, []);

    if (!resumen) return <div className="card">Cargando resumen...</div>;

  return (
    <div className="resumen-usuarios-grid">
      {Object.entries(resumen)
        .filter(([rol]) => rol !== "total")
        .map(([rol, count]) => {
          const config = roleConfig[rol] || roleConfig.default;
          return (
            <div
              className="resumen-usuarios-card"
              key={rol}
              style={{ backgroundColor: config.color }}
            >
              <div className="resumen-usuarios-icon">{config.icon}</div>
              <h4 className="resumen-usuarios-title">
                {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </h4>
              <p className="resumen-usuarios-count">{count} usuarios</p>
            </div>
          );
        })}
      <div className="resumen-usuarios-card resumen-total" style={{ backgroundColor: "#d1e7dd" }}>
        <div className="resumen-usuarios-icon">
          <FaUsers style={{ color: "#0f5132" }} />
        </div>
        <h4 className="resumen-usuarios-title">Total</h4>
        <p className="resumen-usuarios-count">{resumen.total} usuarios</p>
      </div>
    </div>
  );
}
