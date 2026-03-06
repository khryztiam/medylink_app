// components/DoctorPanel.jsx
import { FaUserMd, FaCheckCircle } from "react-icons/fa";
import styles from "@/styles/Doctor.module.css";

const DOCTORS = [
  "FATIMA SOFIA MELARA PORTILLO",
  "CHRISTIAN LADISLAO CUELLAR MORÁN",
];

function formatFechaHora(str) {
  if (!str) return "Por asignar";
  return new Date(str).toLocaleString("es-MX", {
    hour12: true, hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function DoctorPanel({ citas, onAtender, onFinalizar }) {
  return (
    <div className={styles.panelCard}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          <FaUserMd className={styles.panelTitleIcon} />
          Citas Activas
        </h2>
      </div>

      {citas.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🩺</span>
          No hay citas programadas en este momento.
        </div>
      ) : (
        <div className={styles.citasGrid}>
          {citas.map((cita) => {
            const esEmergencia = cita.emergency;
            const esConsulta   = cita.estado === "en consulta";
            const esEspera     = cita.estado === "en espera";

            return (
              <div
                key={cita.id}
                className={[
                  styles.citaCard,
                  esEmergencia    ? styles.citaCardEmergencia :
                  esConsulta      ? styles.citaCardConsulta   :
                  esEspera        ? styles.citaCardEspera     : "",
                ].join(" ")}
              >
                {/* Header: nombre + turno */}
                <div className={styles.citaCardHeader}>
                  <span className={styles.citaCardNombre}>
                    {esEmergencia && "🚨 "}
                    {cita.nombre}
                  </span>
                  <span className={`${styles.citaCardTurno} ${esEmergencia ? styles.citaCardTurnoEmergencia : ""}`}>
                    #{cita.orden_llegada}
                  </span>
                </div>

                {/* Badge de estado */}
                <div>
                  <span className={`${styles.estadoBadge} ${esEspera ? styles.estadoEspera : esConsulta ? styles.estadoConsulta : ""}`}>
                    <span className={styles.badgeDot} />
                    {cita.estado}
                  </span>
                </div>

                {/* Info */}
                <p className={styles.citaInfo}><strong>SAP:</strong> {cita.idSAP}</p>
                <p className={styles.citaInfo}><strong>Motivo:</strong> {cita.motivo}</p>
                <p className={styles.citaInfo}><strong>Fecha/Hora:</strong> {formatFechaHora(cita.programmer_at)}</p>

                {/* Check-in */}
                {cita.check_in && (
                  <p className={styles.timeInfo}>
                    <strong>Check-in:</strong> {new Date(cita.check_in).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </p>
                )}

                {/* Acción: en espera → seleccionar médico */}
                {esEspera && (
                  <div className={styles.doctorSelection}>
                    <label>Asignar médico</label>
                    <select
                      className={styles.doctorSelect}
                      defaultValue=""
                      onChange={(e) => e.target.value && onAtender(cita.id, e.target.value)}
                    >
                      <option value="">Seleccione médico...</option>
                      {DOCTORS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Acción: en consulta → finalizar */}
                {esConsulta && (
                  <div>
                    {cita.doctor_name && (
                      <p className={styles.doctorAsignado}>
                        <strong>Médico:</strong> {cita.doctor_name}
                      </p>
                    )}
                    <button
                      className={styles.btnFinalizar}
                      onClick={() => onFinalizar(cita.id)}
                    >
                      <FaCheckCircle size={13} />
                      Finalizar Consulta
                    </button>
                  </div>
                )}

                {/* Check-out si ya fue atendido */}
                {cita.estado === "atendido" && cita.check_out && (
                  <p className={styles.timeInfo}>
                    <strong>Check-out:</strong> {new Date(cita.check_out).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}