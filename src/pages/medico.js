// doctor.js
import { useEffect, useState } from "react";
import { getTodasLasCitas, actualizarCita } from "../lib/citasData";
import { supabase } from "@/lib/supabase";
import DoctorPanel from "../components/DoctorPanel";
import { FaUserMd, FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function Doctor() {
  const { userName } = useAuth();
  const [citasProgramadas, setCitasProgramadas] = useState([]);
  const [ultimasProgramadas, setUltimasProgramadas] = useState([]);

  const obtenerUltimasProgramadas = async () => {
    const todas = await getTodasLasCitas();
    const programadas = todas
      .filter((c) => c.estado === "programado")
      .sort((a, b) => new Date(b.programmer_at) - new Date(a.programmer_at))
      .slice(0, 25);
    setUltimasProgramadas(programadas);
  };

  const obtenerCitasProgramadas = async () => {
    const todas = await getTodasLasCitas();
    const programadas = todas
      .filter((c) => c.estado === "en espera" || c.estado === "en consulta")
      .sort((a, b) => new Date(a.programmer_at) - new Date(b.programmer_at));
    setCitasProgramadas(programadas);
  };

  useEffect(() => {
    obtenerCitasProgramadas();
    obtenerUltimasProgramadas();

    const canal = supabase
      .channel("supabase_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "citas" },
        async (payload) => {
          console.log("Cambio detectado:", payload);

          const nuevoEstado = payload.new?.estado;
          const estadoAnterior = payload.old?.estado;

          const cambioAEspera =
            (payload.eventType === "UPDATE" &&
              estadoAnterior !== "en espera" &&
              nuevoEstado === "en espera") ||
            (payload.eventType === "INSERT" && nuevoEstado === "en espera");

          if (cambioAEspera) {
            const sonido = new Audio("/doorbell.mp3");
            sonido.play().catch((err) => {
              console.warn("Error al reproducir sonido:", err);
            });
          }

          await obtenerCitasProgramadas();
          await obtenerUltimasProgramadas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const atender = async (id, doctor) => {
    if (!doctor) return; // Validación adicional
    await actualizarCita(id, { estado: "en consulta", doctor_name: doctor });
  };

  const finalizar = async (id) => {
    try {
      // Verificamos que la cita esté en estado "en consulta"
      const { data: cita } = await supabase
        .from("citas")
        .select("check_in, estado")
        .eq("id", id)
        .single();

      if (!cita) throw new Error("Cita no encontrada");
      if (cita.estado !== "en consulta") {
        throw new Error(
          'Solo se pueden finalizar citas en estado "en consulta"'
        );
      }

      // Actualizamos con check_out
      await actualizarCita(id, {
        estado: "atendido",
        check_out: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error al finalizar cita:", error.message);
      // Puedes mostrar una notificación al usuario aquí
      alert(error.message);
    }
  };

  const sidebarContent = (
    <>
      <h2 className="sidebar-title">📋 Últimas Citas Programadas</h2>
      <div className="card-list">
        {ultimasProgramadas.map((cita) => (
          <div key={cita.id} className="cita-card">
            <p className="nombre">
              {cita.emergency && <span className="emergency">🚨</span>}
              {cita.nombre}
            </p>
            <p className="motivo">{cita.motivo}</p>
            <p className="fecha">
              {new Date(cita.programmer_at).toLocaleDateString()} —{" "}
              {new Date(cita.programmer_at).toLocaleTimeString("es-MX", {
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  const hora = new Date().getHours();
  let saludo = "Hola";
  let iconoSaludo = "👋";

  if (hora >= 6 && hora < 12) {
    saludo = "Buenos días";
    iconoSaludo = "☀️";
  } else if (hora >= 12 && hora < 19) {
    saludo = "Buenas tardes";
    iconoSaludo = "🌤️";
  } else {
    saludo = "Buenas noches";
    iconoSaludo = "🌙";
  }

  const nombre = userName || "Paciente";

  return (
    <div className="main-content">
      <div className="title-bar">
        <h1 className="doctor-title">
          <FaUserMd className="title-icon" />
          Medico
          <span className="title-extra">
            <FaCalendarAlt className="extra-icon" />
            Panel de Gestión de Consultas
          </span>
        </h1>
      </div>
      <div className="content-wrapper">
        <div className="main">
          <div className="doctor-container">
            <div className="saludo-card">
              <div className="saludo-texto">
                <h2>
                  {iconoSaludo} {saludo}, {nombre}.
                </h2>
                <p
                  className="saludo-frase"
                  style={{
                    fontSize: "1.1em",
                    marginTop: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Gracias por brindar atención con entrega y criterio. Tu labor marca la diferencia en cada consulta 🩺📌
                </p>
              </div>
            </div>
            <div className="doctor-layout">
              <DoctorPanel
                citas={citasProgramadas}
                onAtender={atender}
                onFinalizar={finalizar}
              />
            </div>
          </div>
        </div>
        <div className="sidebar sidebar-programadas">
          <h2 className="sidebar-title">📋 Últimas Citas Programadas</h2>
          <div className="card-list">
            {ultimasProgramadas.map((cita) => (
              <div key={cita.id} className="cita-card">
                <p className="nombre">
                  {cita.emergency && <span className="emergency">🚨</span>}
                  {cita.nombre}
                </p>
                <p className="motivo">{cita.motivo}</p>
                <p className="fecha">
                  {new Date(cita.programmer_at).toLocaleDateString()} —{" "}
                  {new Date(cita.programmer_at).toLocaleTimeString("es-MX", {
                    hour12: true,
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
