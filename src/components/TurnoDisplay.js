import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  FaSignOutAlt,
  FaUserClock,
  FaClock,
  FaInfoCircle,
  FaUserMd,
} from "react-icons/fa";

export default function TurnoVisual() {
  const [citaActual, setCitaActual] = useState(null);
  const [showWaiting, setShowWaiting] = useState(false); // 👈 Nuevo estado
  const { logout } = useAuth();
  const [userInteracted, setUserInteracted] = useState(false);
  //const audioRef = useRef(null); // 👈 usamos un ref para el sonido

  // Función para manejar la interacción del usuario (necesaria para la voz)
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true); // Eliminar los listeners una vez que se interactúa
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    }
  };

  /*useEffect(() => {
    audioRef.current = new Audio('/turno_paciente.mp3');
  }, []);*/

  const fetchCitasEnConsulta = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .eq("estado", "en consulta")
      .order("consultation_at", { ascending: false });

    if (error) {
      console.error(error);
      setCitaActual(null);
      return;
    }

    if (data && data.length > 0) {
      setCitaActual(data[0]); // Mostrar solo el primer turno en "en consulta"
      setShowWaiting(false);
    } else {
      setCitaActual(null);
      setShowWaiting(true); // 👈 Mostrar transición
    }
  };

  useEffect(() => {
    // 1. Configurar detectores de interacción del usuario
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction); // 2. Precarga de voces (opcional, ayuda en algunos navegadores)
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    fetchCitasEnConsulta();

    const canal = supabase
      .channel("supabase_realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "citas" },
        async (payload) => {
          const newCita = payload.new; // 👈 Obtenemos la nueva data
          const newEstado = newCita?.estado;
          const oldEstado = payload.old?.estado;

          // Si el estado cambia a "en consulta", actualiza y REPRODUCE LA VOZ
          if (newEstado === "en consulta" && oldEstado !== "en consulta") {
            // Ahora pasamos el objeto cita al método de voz
            reproducirVozConsulta(newCita);
          }

          if (
            newEstado === "en consulta" ||
            oldEstado === "en consulta" ||
            newEstado === "atendido"
          ) {
            // Siempre que cambia el estado importante, refresca
            await fetchCitasEnConsulta();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal); // Limpieza de listeners y speech
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [userInteracted]); // 👈 userInteracted es ahora una dependencia

  /*const reproducirSonidoConsulta = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }; */

  const reproducirVozConsulta = (cita) => {
    // Solo se reproduce si el usuario ya interactuó con la página
    if (!userInteracted) return; // Verifica si la API de voz está disponible

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Detiene cualquier discurso anterior // CONSTRUYE EL MENSAJE DINÁMICO

      const nombrePaciente = cita.nombre || "el paciente";
      const doctor = cita.doctor_name
        ? ` con el doctor ${cita.doctor_name}`
        : "";
      const message = `Turno del paciente ${nombrePaciente}, favor de pasar ${doctor}.`;
      const speech = new SpeechSynthesisUtterance(message); // Configuración de voz (puedes ajustarla)

      speech.lang = "es-ES";
      speech.rate = 0.9;
      speech.pitch = 1.1;
      speech.volume = 1.0; // Buscar específicamente Microsoft Dalia

      const voices = window.speechSynthesis.getVoices();
      const daliaVoice = voices.find(
        (voice) =>
          voice.name === "Microsoft Dalia Online (Natural) - Spanish (Mexico)"
      ); // Buscar cualquier voz en español
      const spanishVoice = voices.find((voice) => voice.lang.includes("es"));

      if (spanishVoice) {
        speech.voice = spanishVoice;
        speech.lang = spanishVoice.lang;
      }

      window.speechSynthesis.speak(speech);
    }
  };

  const formatoHora = citaActual?.programmer_at
    ? new Date(citaActual.programmer_at).toLocaleString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "--:--";

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="turno-visual-container">
      <button onClick={handleLogout} className="turno-salir">
        <FaSignOutAlt />
      </button>
           {" "}
      {!userInteracted && (
        <div
          className="interaction-prompt"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "#ffc107",
            color: "#000",
            padding: "10px",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
                    👆 Haz clic en cualquier lugar para activar las
          notificaciones de voz        
        </div>
      )}
      {/* Mostrar el turno activo */}
      {citaActual && !showWaiting && (
        <div className="turno-content animate-fade-in">
          <div className="turno-header">
            <h1>Turno Actual</h1>
          </div>

          <div className="turno-patient">
            <div className="avatar-circle">
              <FaUserClock className="avatar-icon" />
            </div>
            <h2 className="patient-name">{citaActual.nombre}</h2>
          </div>

          <div className="turno-details">
            {/*  <div className="detail-item">
              <FaClock className="detail-icon" />
              <span className="detail-label">Hora:</span>
              <span className="detail-value">{formatoHora}</span>
            </div>
          */}
            <div className="detail-item">
              <FaInfoCircle className="detail-icon" />
              <span className="detail-label">Estado:</span>
              <span
                className={`status-badge ${citaActual.estado
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {citaActual.estado.toUpperCase()}
              </span>
            </div>

            <div className="detail-item">
              <FaUserMd className="detail-icon" />
              <span className="detail-label">Medico:</span>
              <span className="detail-value doctor">
                {citaActual.doctor_name || "Por asignar"}
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Mostrar mensaje de espera */}
      {!citaActual && showWaiting && (
        <div className="waiting-message animate-fade-in">
          <FaUserClock className="waiting-icon" />
          <p>Esperando que un medico inicie una consulta...</p>
        </div>
      )}
    </div>
  );
}
