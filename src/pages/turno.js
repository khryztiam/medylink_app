import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCitasHoy, subscribeToCitasChanges } from "../lib/citasData"; // supongo que agregas subscribeToCitasChanges
import TurnoVisual from "../components/TurnoDisplay";

export default function TurnoEnPantalla() {
  const [enEspera, setEnEspera] = useState([]);
  const [programadas, setProgramadas] = useState([]);
  const [citasSidebar, setCitasSidebar] = useState([]);

  const load = async () => {
    const todas = await getCitasHoy();

    const relevantes = todas
      .filter((c) => c.estado === "en espera" || c.estado === "en consulta")
      .sort((a, b) => a.orden_llegada - b.orden_llegada);

    setCitasSidebar(relevantes);

    const prog = todas
      .filter((c) => c.estado === "programado")
      .sort((a, b) => new Date(a.programmer_at) - new Date(b.programmer_at))
      .slice(0, 25);

    setProgramadas(prog);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("realtime-citas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "citas" },
        (payload) => {
          const cita = payload.new;

          if (!cita) return; // Por seguridad si payload.new no existe

          if (["en espera", "en consulta"].includes(cita.estado)) {
            setCitasSidebar((prev) => {
              const existe = prev.find((c) => c.id === cita.id);
              if (existe) {
                return prev.map((c) => (c.id === cita.id ? cita : c));
              } else {
                return [...prev, cita];
              }
            });
          } else {
            setCitasSidebar((prev) => prev.filter((c) => c.id !== cita.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="main-content">
      <div className="content-wrapper">
        <div className="sidebar side2">
          <div className="panel-checkin pchec">
            <h2>✅ Pacientes en Espera</h2>
            {citasSidebar.length === 0 ? (
              <p>No hay pacientes en espera o en consulta.</p>
            ) : (
              <div className="lista-checkin list2">
                {citasSidebar
                  .sort((a, b) => a.orden_llegada - b.orden_llegada)
                  .map((cita) => (
                    <div
                      key={cita.id}
                      className={`lista2 item-checkin
            ${cita.estado === "en consulta" ? "consulta-card" : ""}
            ${cita.emergency ? "emergency-card" : ""}
          `}
                      style={
                        cita.emergency
                          ? { borderLeft: "5px solid #ff3d3d", order: -1 }
                          : {}
                      }
                    >
                      <h3 className="card-nombre">
                        {cita.emergency && (
                          <span className="emergency-tag">🚨 EMERGENCIA</span>
                        )}
                        {cita.nombre}
                      </h3>
                      <div className="card-turno">
                        Turno: <span>#{cita.orden_llegada}</span>
                      </div>
                      {cita.estado === "en consulta" && (
                        <div className="estado-consulta">🩺 En consulta</div>
                      )}
                      {cita.check_in && (
                        <div className="checkin-time">
                          <span>Check-in: </span>
                          {new Date(cita.check_in).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

          </div>
        </div>
        <div className="main">
          <div className="turno-visual-container">
            <TurnoVisual />
          </div>
        </div>
      </div>
    </div>
  );
}
