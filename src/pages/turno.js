import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCitas, subscribeToCitasChanges } from "../lib/citasData"; // supongo que agregas subscribeToCitasChanges
import TurnoVisual from "../components/TurnoDisplay";

export default function TurnoEnPantalla() {
  const [enEspera, setEnEspera] = useState([]);
  const [programadas, setProgramadas] = useState([]);

  const load = async () => {
    const todas = await getCitas();
    setEnEspera(
      todas
        .filter((c) => c.estado === "en espera")
        .sort((a, b) => a.orden_llegada - b.orden_llegada)
    );
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

          if (cita.estado === "en espera") {
            setEnEspera((prev) => {
              const existe = prev.find((c) => c.id === cita.id);
              if (existe) {
                // Actualizar el item existente
                return prev.map((c) => (c.id === cita.id ? cita : c));
              } else {
                // Insertar nuevo item
                return [...prev, cita];
              }
            });
          } else {
            // Si ya no está en "en espera", eliminarlo del estado
            setEnEspera((prev) => prev.filter((c) => c.id !== cita.id));
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
      <div className="sidebar side2">
        <div className="panel-checkin pchec">
          <h2>✅ Pacientes en Espera</h2>
          {enEspera.filter((c) => c.estado === "en espera").length === 0 ? (
            <p>No hay pacientes en espera.</p>
          ) : (
            <div className="lista-checkin list2">
              {enEspera
                .sort((a, b) => a.orden_llegada - b.orden_llegada)
                .map((cita) => (
                  <div
                    key={cita.id}
                    className={`lista2 item-checkin ${
                      cita.emergency ? "emergency-card" : ""
                    }`}
                    style={
                      cita.emergency
                        ? {
                            borderLeft: "5px solid #ff3d3d",
                            order: -1,
                          }
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

                    {/* Mostrar hora de check-in si existe */}
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
  );
}
