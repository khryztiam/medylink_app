// components/admin/ResumenUsuarios.jsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  FaUserCog, FaUserMd, FaUserNurse,
  FaUserInjured, FaUsers, FaUserShield, FaCalendarAlt,
} from "react-icons/fa";
import styles from "@/styles/Admin.module.css";

const ROLE_CONFIG = {
  admin:      { icon: <FaUserCog />,     color: "#fdecea", iconColor: "#4f46e5" },
  medico:     { icon: <FaUserMd />,      color: "rgba(22,163,74,0.08)",   iconColor: "#16a34a" },
  enfermeria: { icon: <FaUserNurse />,   color: "rgba(147,51,234,0.08)",  iconColor: "#9333ea" },
  paciente:   { icon: <FaUserInjured />, color: "rgba(49,130,206,0.08)", iconColor: "#3182ce" },
  supervisor: { icon: <FaUserShield />,  color: "rgba(234,88,12,0.08)",  iconColor: "#ea580c" },
  turno:      { icon: <FaCalendarAlt />, color: "rgba(220,38,38,0.08)",  iconColor: "#dc2626" },
  default:    { icon: <FaUsers />,       color: "#f0f0f0",               iconColor: "#64748b" },
};

const ROLE_LABELS = {
  admin: "Admin", medico: "Médico", enfermeria: "Enfermería",
  paciente: "Paciente", supervisor: "Supervisor", turno: "Turno",
};

export default function ResumenUsuariosCard() {
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    const fetchResumen = async () => {
      const { data, error } = await supabase.from("app_users").select("role");
      if (error) { console.error(error.message); return; }

      const conteo = data.reduce((acc, { role }) => {
        const key = role || "Sin rol";
        acc[key]   = (acc[key]   || 0) + 1;
        acc.total  = (acc.total  || 0) + 1;
        return acc;
      }, {});
      setResumen(conteo);
    };
    fetchResumen();
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <FaUsers className={styles.cardTitleIcon} />
          Resumen de Usuarios
        </h3>
      </div>

      {!resumen ? (
        <div className={styles.loading}>Cargando...</div>
      ) : (
        <div className={styles.resumenGrid}>
          {Object.entries(resumen)
            .filter(([rol]) => rol !== "total")
            .map(([rol, count]) => {
              const cfg = ROLE_CONFIG[rol] || ROLE_CONFIG.default;
              return (
                <div
                  key={rol}
                  className={styles.resumenCard}
                  style={{ backgroundColor: cfg.color }}
                >
                  <div className={styles.resumenCardIcon} style={{ color: cfg.iconColor }}>
                    {cfg.icon}
                  </div>
                  <p className={styles.resumenCardLabel}>{ROLE_LABELS[rol] || rol}</p>
                  <p className={styles.resumenCardCount}>{count}</p>
                </div>
              );
            })}

          {/* Total */}
          <div className={`${styles.resumenCard} ${styles.resumenTotal}`}>
            <div className={styles.resumenCardIcon} style={{ color: "#4f46e5" }}>
              <FaUsers />
            </div>
            <p className={styles.resumenCardLabel}>Total</p>
            <p className={styles.resumenCardCount}>{resumen.total}</p>
          </div>
        </div>
      )}
    </div>
  );
}