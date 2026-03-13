// pages/doctor.js
import { useEffect, useState, useCallback, useRef } from "react";
import { getAllCitas, actualizarCita } from "../lib/citasData";
import { supabase } from "@/lib/supabase";
import DoctorPanel from "../components/DoctorPanel";
import { FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/Doctor.module.css";

// ─── Audio (misma lógica que enfermeria) ──────────────────────────────────────
let audioDesbloqueado = false;

function desbloquearAudio() {
  if (audioDesbloqueado) return;
  const audio = new Audio("/doorbell.mp3");
  audio.volume = 0;
  audio.play()
    .then(() => { audio.pause(); audio.currentTime = 0; audioDesbloqueado = true; })
    .catch(() => {});
}

function reproducirDoorbell() {
  try {
    const audio = new Audio("/doorbell.mp3");
    audio.volume = 1.0;
    const p = audio.play();
    if (p !== undefined) p.catch(() => {});
  } catch (err) {
    console.warn("Audio no disponible:", err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSaludo() {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return { texto: "Buenos días",   icono: "☀️" };
  if (h >= 12 && h < 19) return { texto: "Buenas tardes", icono: "🌤️" };
  return                         { texto: "Buenas noches", icono: "🌙" };
}

function formatFechaHora(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("es-MX", {
    hour12: true, hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit",
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Doctor() {
  const { userName } = useAuth();
  const [citasActivas,       setCitasActivas]       = useState([]);
  const [ultimasProgramadas, setUltimasProgramadas] = useState([]);

  // Ref para detectar citas genuinamente nuevas sin stale closure
  const citasConocidasRef = useRef(new Set());

  const { texto: saludoTexto, icono: saludoIcono } = getSaludo();
  const nombre = userName || "Médico";

  // ── Carga ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const todas = await getAllCitas();
    if (!Array.isArray(todas)) return;

    // Registrar IDs actuales como conocidos
    citasConocidasRef.current = new Set(todas.map((c) => c.id));

    setCitasActivas(
      todas
        .filter((c) => c.estado === "en espera" || c.estado === "en consulta")
        .sort((a, b) => (a.orden_llegada ?? 99) - (b.orden_llegada ?? 99))
    );

    setUltimasProgramadas(
      todas
        .filter((c) => c.estado === "programado")
        .sort((a, b) => new Date(b.programmer_at) - new Date(a.programmer_at))
        .slice(0, 25)
    );
  }, []);

  useEffect(() => { load(); }, [load]);

  // Desbloquear audio en primer gesto
  useEffect(() => {
    const unlock = () => desbloquearAudio();
    window.addEventListener("click",      unlock, { once: true });
    window.addEventListener("keydown",    unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click",      unlock);
      window.removeEventListener("keydown",    unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // ── Realtime ─────────────────────────────────────────────────────
  useEffect(() => {
    const canal = supabase
      .channel("realtime-citas-doctor")
      .on("postgres_changes", { event: "*", schema: "public", table: "citas" }, (payload) => {
        const cita         = payload.new;
        const estadoAnterior = payload.old?.estado;
        if (!cita) return;

        // Doorbell: solo cuando una cita pasa a "en espera" por primera vez
        const esNuevoEnEspera =
          cita.estado === "en espera" &&
          estadoAnterior !== "en espera";

        if (esNuevoEnEspera) {
          reproducirDoorbell();
        }

        // Actualizar listas
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [load]);

  // ── CRUD ─────────────────────────────────────────────────────────
  const atender = async (id, doctor) => {
    if (!doctor) return;
    await actualizarCita(id, { estado: "en consulta", doctor_name: doctor });
    load();
  };

  const finalizar = async (id) => {
    try {
      const { data: cita } = await supabase
        .from("citas")
        .select("check_in, estado")
        .eq("id", id)
        .single();

      if (!cita) throw new Error("Cita no encontrada");
      if (cita.estado !== "en consulta")
        throw new Error('Solo se pueden finalizar citas en estado "en consulta"');

      await actualizarCita(id, {
        estado: "atendido",
        check_out: new Date().toISOString(),
      });
      load();
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Columna principal ──────────────────────────────────── */}
      <div className={styles.main}>

        {/* Saludo compacto */}
        <div className={styles.saludoCard}>
          <div className={styles.saludoTexto}>
            <h2>{saludoIcono} {saludoTexto} {nombre}.</h2>
            <p className={styles.saludoFrase}>
              Tu labor marca la diferencia en cada consulta 🩺
            </p>
          </div>
        </div>

        {/* Panel de citas activas */}
        <DoctorPanel
          citas={citasActivas}
          onAtender={atender}
          onFinalizar={finalizar}
        />

      </div>

      {/* ── Sidebar: últimas programadas ───────────────────────── */}
      <aside className={styles.aside}>
        <div className={styles.asideHeader}>
          <h3 className={styles.asideTitle}>
            <FaCalendarAlt className={styles.asideTitleIcon} />
            Últimas Programadas
          </h3>
        </div>

        <div className={styles.asideList}>
          {ultimasProgramadas.length === 0 ? (
            <div className={styles.asideEmpty}>Sin citas programadas</div>
          ) : (
            ultimasProgramadas.map((cita) => (
              <div key={cita.id} className={styles.asideCard}>
                <p className={styles.asideCardNombre}>
                  {cita.emergency && "🚨 "}
                  {cita.nombre}
                </p>
                <p className={styles.asideCardMotivo}>{cita.motivo}</p>
                <p className={styles.asideCardFecha}>
                  {formatFechaHora(cita.programmer_at)}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>

    </div>
  );
}