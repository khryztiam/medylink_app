// pages/turno.js
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCitasHoy } from "../lib/citasData";
import TurnoDisplay from "../components/TurnoDisplay";
import { FaCheckCircle } from "react-icons/fa";
import styles from "@/styles/Turno.module.css";

export default function TurnoEnPantalla() {
  const [citasSidebar, setCitasSidebar] = useState([]);

  // ── Carga ──────────────────────────────────────────────────────
  const load = async () => {
    const todas = await getCitasHoy();
    const relevantes = todas
      .filter((c) => c.estado === "en espera" || c.estado === "en consulta")
      .sort((a, b) => (a.orden_llegada ?? 99) - (b.orden_llegada ?? 99));
    setCitasSidebar(relevantes);
  };

  useEffect(() => { load(); }, []);

  // ── Realtime ───────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("turno-sidebar-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "citas" }, (payload) => {
        const cita = payload.new;
        if (!cita) return;

        if (["en espera", "en consulta"].includes(cita.estado)) {
          setCitasSidebar((prev) => {
            const existe = prev.find((c) => c.id === cita.id);
            return existe
              ? prev.map((c) => (c.id === cita.id ? cita : c))
              : [...prev, cita].sort((a, b) => (a.orden_llegada ?? 99) - (b.orden_llegada ?? 99));
          });
        } else {
          setCitasSidebar((prev) => prev.filter((c) => c.id !== cita.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── JSX ────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Sidebar izquierdo: pacientes en espera ────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>
            <FaCheckCircle className={styles.sidebarTitleIcon} />
            Pacientes en Espera
          </h3>
        </div>

        <div className={styles.sidebarList}>
          {citasSidebar.length === 0 ? (
            <div className={styles.sidebarEmpty}>
              No hay pacientes en espera o en consulta.
            </div>
          ) : (
            citasSidebar.map((cita) => {
              const esConsulta   = cita.estado === "en consulta";
              const esEmergencia = cita.emergency;

              return (
                <div
                  key={cita.id}
                  className={[
                    styles.sidebarCard,
                    esEmergencia ? styles.sidebarCardEmergencia :
                    esConsulta   ? styles.sidebarCardConsulta   :
                                   styles.sidebarCardEspera,
                  ].join(" ")}
                >
                  <p className={styles.sidebarCardNombre}>
                    {esEmergencia && "🚨 "}
                    {cita.nombre}
                  </p>
                  <p className={styles.sidebarCardTurno}>
                    Turno: <span>#{cita.orden_llegada}</span>
                  </p>

                  {/* Badge de estado */}
                  {esConsulta && (
                    <span className={`${styles.sidebarCardBadge} ${styles.badgeConsulta}`}>
                      🩺 En consulta
                    </span>
                  )}
                  {!esConsulta && !esEmergencia && (
                    <span className={`${styles.sidebarCardBadge} ${styles.badgeEspera}`}>
                      En espera
                    </span>
                  )}
                  {esEmergencia && (
                    <span className={`${styles.sidebarCardBadge} ${styles.badgeEmergencia}`}>
                      🚨 Emergencia
                    </span>
                  )}

                  {cita.check_in && (
                    <p className={styles.sidebarCardCheckin}>
                      Check-in:{" "}
                      {new Date(cita.check_in).toLocaleTimeString("es-MX", {
                        hour: "2-digit", minute: "2-digit", hour12: true,
                      })}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Display principal ─────────────────────────────────── */}
      <main className={styles.display}>
        <TurnoDisplay />
      </main>

    </div>
  );
}