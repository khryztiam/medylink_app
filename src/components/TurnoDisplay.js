// components/TurnoDisplay.jsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { FaSignOutAlt, FaUserClock, FaInfoCircle, FaUserMd } from "react-icons/fa";
import styles from "@/styles/Turno.module.css";

// ─── TTS helper ───────────────────────────────────────────────────────────────
// Se llama solo cuando el usuario ya interactuó (userInteracted=true)
function reproducirVozConsulta(cita) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const nombre  = cita.nombre      || "el paciente";
  const medico  = cita.doctor_name ? ` con el/la médico ${cita.doctor_name}` : "";
  const mensaje = `Turno para ${nombre}, favor de pasar a consulta${medico}.`;

  const utterance  = new SpeechSynthesisUtterance(mensaje);
  utterance.lang   = "es-ES";
  utterance.rate   = 0.9;
  utterance.pitch  = 1.1;
  utterance.volume = 1.0;

  // Preferir voz Dalia (Mexico) → cualquier español → default
  const voices      = window.speechSynthesis.getVoices();
  const dalia       = voices.find((v) => v.name.includes("Dalia"));
  const esVoz       = voices.find((v) => v.lang.startsWith("es"));
  const vozElegida  = dalia || esVoz;

  if (vozElegida) {
    utterance.voice = vozElegida;
    utterance.lang  = vozElegida.lang;
  }

  window.speechSynthesis.speak(utterance);
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function TurnoDisplay() {
  const { logout }        = useAuth();
  const [citaActual,      setCitaActual]      = useState(null);
  const [showWaiting,     setShowWaiting]     = useState(false);
  const [userInteracted,  setUserInteracted]  = useState(false);

  // ── Precarga de voces ────────────────────────────────────────────
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // ── Desbloqueo de interacción ────────────────────────────────────
  useEffect(() => {
    const unlock = () => setUserInteracted(true);
    document.addEventListener("click",      unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });
    return () => {
      document.removeEventListener("click",      unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);

  // ── Carga cita en consulta ───────────────────────────────────────
  const fetchCitaActual = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .eq("estado", "en consulta")
      .order("consultation_at", { ascending: false });

    if (error) { console.error(error); setCitaActual(null); return; }

    if (data && data.length > 0) {
      setCitaActual(data[0]);
      setShowWaiting(false);
    } else {
      setCitaActual(null);
      setShowWaiting(true);
    }
  };

  useEffect(() => {
    fetchCitaActual();
  }, []);

  // ── Realtime ─────────────────────────────────────────────────────
  useEffect(() => {
    const canal = supabase
      .channel("turno-display-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "citas" },
        (payload) => {
          const nueva    = payload.new;
          const anterior = payload.old?.estado;

          if (nueva?.estado === "en consulta" && anterior !== "en consulta") {
            if (userInteracted) reproducirVozConsulta(nueva);
          }

          if (
            nueva?.estado === "en consulta" ||
            anterior       === "en consulta" ||
            nueva?.estado  === "atendido"
          ) {
            fetchCitaActual();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [userInteracted]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Banner TTS — solo si aún no hubo interacción */}
      {!userInteracted && (
        <div className={styles.interactionBanner}>
          👆 Haz clic en cualquier lugar para activar las notificaciones de voz
        </div>
      )}

      {/* Botón salir */}
      <button className={styles.btnSalir} onClick={handleLogout} title="Salir">
        <FaSignOutAlt />
      </button>

      {/* ── Turno activo ────────────────────────────────────────── */}
      {citaActual && !showWaiting && (
        <div className={`${styles.turnoCard} ${styles.animFadeIn}`}>
          <div className={styles.turnoCardHeader}>
            <h1 className={styles.turnoCardHeaderTitle}>Turno Actual</h1>
          </div>

          <div className={styles.turnoPatient}>
            <div className={styles.turnoAvatar}>
              <FaUserClock />
            </div>
            <h2 className={styles.turnoNombre}>{citaActual.nombre}</h2>
          </div>

          <div className={styles.turnoDetails}>
            <div className={styles.detailItem}>
              <FaInfoCircle className={styles.detailIcon} />
              <span className={styles.detailLabel}>Estado</span>
              <span className={`${styles.statusBadge} ${styles.statusEnConsulta}`}>
                {citaActual.estado.toUpperCase()}
              </span>
            </div>

            <div className={styles.detailItem}>
              <FaUserMd className={styles.detailIcon} />
              <span className={styles.detailLabel}>Médico</span>
              <span className={styles.detailValue}>
                {citaActual.doctor_name || "Por asignar"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Pantalla de espera ──────────────────────────────────── */}
      {!citaActual && showWaiting && (
        <div className={`${styles.waitingCard} ${styles.animFadeIn}`}>
          <div className={styles.waitingIconWrap}>
            <FaUserClock />
          </div>
          <p className={styles.waitingText}>
            Esperando que un médico inicie una consulta...
          </p>
        </div>
      )}
    </>
  );
}