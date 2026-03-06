// pages/paciente.js
import { useState, useEffect, useCallback } from "react";
import {
  agregarCita,
  getCitasPorPaciente,
  subscribeToCitas,
} from "../lib/citasData";
import { useAuth } from "@/context/AuthContext";
import CitaForm from "../components/CitaForm";
import ConsultaCita from "../components/ConsultaCita";
import EstadoConsulta from "@/components/EstadoConsulta";
import Modal from "react-modal";
import { FaClipboardList, FaClock, FaCalendarAlt, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import styles from "@/styles/Paciente.module.css";

Modal.setAppElement("#__next");

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSaludo() {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return { texto: "Buenos días",   icono: "☀️" };
  if (h >= 12 && h < 19) return { texto: "Buenas tardes", icono: "🌤️" };
  return                         { texto: "Buenas noches", icono: "🌙" };
}

function formatFecha(fechaStr) {
  if (!fechaStr) return "—";
  return new Date(fechaStr).toLocaleString("es-SV", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// Badge de estado — usa clases del module
function BadgeEstado({ estado }) {
  const map = {
    atendido:   styles.badgeAtendido,
    pendiente:  styles.badgePendiente,
    programado: styles.badgeProgramado,
    cancelado:  styles.badgeCancelado,
  };
  const cls = map[estado?.toLowerCase()] || styles.badgePendiente;
  const label = estado
    ? estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()
    : "Pendiente";

  return (
    <span className={`${styles.badge} ${cls}`}>
      <span className={styles.badgeDot} />
      {label}
    </span>
  );
}

// Íconos para las fechas en cards móvil
const FECHA_ICON = {
  solicitud: "🕐",
  programada: "📅",
  salida: "🚪",
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PacientePage() {
  const { user, userName, idsap } = useAuth();
  const [citas, setCitas]               = useState([]);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [mensaje, setMensaje]           = useState(null); // { texto, tipo }
  const [showTelegram, setShowTelegram] = useState(false);

  const { texto: saludoTexto, icono: saludoIcono } = getSaludo();
  const nombre = userName || "Paciente";

  // Primera cita activa (pendiente o programada)
  const citaActiva = citas.find(
    (c) => c.estado === "pendiente" || c.estado === "programado"
  );

  // ── Carga del historial ──────────────────────────────────────────
  const cargarHistorial = useCallback(async () => {
    const id = idsap || user?.idsap || user?.idSAP;
    if (!id) return;
    const data = await getCitasPorPaciente(id, 15);
    setCitas(Array.isArray(data) ? data : []);
  }, [idsap, user]);

  // ── Efecto inicial ───────────────────────────────────────────────
  useEffect(() => {
    const id = idsap || user?.idsap || user?.idSAP;
    if (!id) return;

    const init = async () => {
      try {
        const { data: userData } = await supabase
          .from("app_users")
          .select("telegram_id")
          .eq("idsap", id)
          .maybeSingle();

        if (userData && !userData.telegram_id) setShowTelegram(true);
        await cargarHistorial();
      } catch (err) {
        console.error("Error en vista paciente:", err);
      }
    };

    init();

    const unsubscribe = subscribeToCitas((payload) => {
      if (payload.eventType === "INSERT") {
        if (String(payload.new.idsap) === String(id))
          setCitas((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setCitas((prev) =>
          prev.map((c) => (c.id === payload.new.id ? payload.new : c))
        );
      } else if (payload.eventType === "DELETE") {
        setCitas((prev) => prev.filter((c) => c.id !== payload.old.id));
      }
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, [idsap, user, cargarHistorial]);

  // ── Auto-limpiar mensaje tras 4s ────────────────────────────────
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 4000);
    return () => clearTimeout(t);
  }, [mensaje]);

  // ── Handler nueva cita ───────────────────────────────────────────
  const handleNuevaCita = async ({ nombre, motivo, idSAP, emergency, isss }) => {
    try {
      await agregarCita({ nombre, motivo, idSAP, emergency, isss, estado: "pendiente" });
      setMensaje({ texto: "✅ Cita creada exitosamente.", tipo: "exito" });
      setIsModalOpen(false);
      await cargarHistorial();
    } catch (error) {
      setMensaje({ texto: "❌ Error: " + error.message, tipo: "error" });
    }
  };

  // ── Render de fila de tabla (desktop) ───────────────────────────
  const renderTablaRow = (cita) => (
    <tr key={cita.id}>
      <td><span className={styles.motivoText}>{cita.motivo}</span></td>
      <td>{formatFecha(cita.created_at)}</td>
      <td>{formatFecha(cita.cita_programada)}</td>
      <td>{formatFecha(cita.salida)}</td>
      <td><BadgeEstado estado={cita.estado} /></td>
    </tr>
  );

  // ── Render de card (móvil) ───────────────────────────────────────
  const renderCard = (cita) => {
    const estadoKey = cita.estado?.toLowerCase() || "pendiente";
    return (
      <div
        key={cita.id}
        className={`${styles.citaCard} ${styles[estadoKey] || ""}`}
      >
        {/* Motivo + badge */}
        <div className={styles.citaCardTop}>
          <span className={styles.citaCardMotivo}>{cita.motivo}</span>
          <BadgeEstado estado={cita.estado} />
        </div>

        {/* Fechas */}
        <div className={styles.citaCardFechas}>
          <div className={styles.citaCardFechaItem}>
            <span className={styles.citaCardFechaLabel}>Solicitud</span>
            <span className={styles.citaCardFechaIcono}>{FECHA_ICON.solicitud}</span>
            <span className={styles.citaCardFechaValor}>{formatFecha(cita.created_at)}</span>
          </div>
          <div className={styles.citaCardFechaItem}>
            <span className={styles.citaCardFechaLabel}>Programada</span>
            <span className={styles.citaCardFechaIcono}>{FECHA_ICON.programada}</span>
            <span className={styles.citaCardFechaValor}>{formatFecha(cita.cita_programada)}</span>
          </div>
          <div className={styles.citaCardFechaItem}>
            <span className={styles.citaCardFechaLabel}>Salida</span>
            <span className={styles.citaCardFechaIcono}>{FECHA_ICON.salida}</span>
            <span className={styles.citaCardFechaValor}>{formatFecha(cita.salida)}</span>
          </div>
        </div>
      </div>
    );
  };

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>

      {/* 1. Saludo + botón ────────────────────────────────────────── */}
      <div className={styles.saludoCard}>
        <div className={styles.saludoTexto}>
          <h2>{saludoIcono} {saludoTexto}, {nombre}.</h2>
          <p className={styles.saludoFrase}>Esperamos que tengas un gran día 👨‍⚕️</p>
        </div>
        <button
          className={styles.btnSolicitar}
          onClick={() => setIsModalOpen(true)}
          disabled={!!citaActiva}
          title={citaActiva ? "Ya tienes una cita activa" : "Solicitar nueva cita"}
        >
          {citaActiva ? "Cita en curso" : "Solicitar Cita"}
        </button>
      </div>

      {/* 2. Banner cita activa ────────────────────────────────────── */}
      {citaActiva && (
        <div className={styles.citaActivaBanner}>
          <div className={styles.citaActivaIcon}><FaClock /></div>
          <div className={styles.citaActivaInfo}>
            <strong>{citaActiva.motivo}</strong>
            <span>Solicitada el {formatFecha(citaActiva.created_at)}</span>
          </div>
          <span className={styles.citaActivaBadge}>
            {citaActiva.estado?.toUpperCase()}
          </span>
        </div>
      )}

      {/* 3. Banner Telegram ───────────────────────────────────────── */}
      {showTelegram && (
        <div className={styles.telegramCard}>
          <div className={styles.telegramAccent} />
          <div className={styles.telegramBody}>
            <div className={styles.telegramIconWrap}>
              <svg viewBox="0 0 24 24" className={styles.telegramSvg}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <div className={styles.telegramTexts}>
              <h3>Notificaciones instantáneas</h3>
              <p>Recibe avisos de tus citas y turnos directamente en tu celular.</p>
            </div>
            <div className={styles.telegramActions}>
              <button
                className={styles.btnTelegramLater}
                onClick={() => setShowTelegram(false)}
              >
                Más tarde
              </button>
              <a
                href={`https://telegram.me/medylinkalert_bot?start=${idsap}`}
                target="_blank"
                rel="noreferrer"
                className={styles.btnTelegramLink}
                onClick={() => setShowTelegram(false)}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                Vincular Telegram
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Estado consultorio (componente flotante existente) ─────── */}
      <EstadoConsulta />

      {/* 5. Mensaje feedback ─────────────────────────────────────── */}
      {mensaje && (
        <div className={`${styles.mensajeAlerta} ${styles[mensaje.tipo]}`}>
          {mensaje.texto}
        </div>
      )}

      {/* 6. Historial de solicitudes ─────────────────────────────── */}
      <div className={styles.historialCard}>
        <div className={styles.historialHeader}>
          <h3 className={styles.historialTitle}>
            <FaClipboardList className={styles.historialTitleIcon} />
            Historial de Solicitudes
          </h3>
        </div>

        {citas.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>📋</span>
            No tienes solicitudes registradas aún.
          </div>
        ) : (
          <>
            {/* Tabla — visible en desktop */}
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Motivo</th>
                    <th>Solicitud</th>
                    <th>Cita programada</th>
                    <th>Salida</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(renderTablaRow)}
                </tbody>
              </table>
            </div>

            {/* Cards — visibles en móvil */}
            <div className={styles.cardsWrapper}>
              {citas.map(renderCard)}
            </div>
          </>
        )}
      </div>

      {/* Modal nueva cita ────────────────────────────────────────── */}
      {/* pac-modal y pac-modal-overlay son clases globales (en globals.css) */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Formulario de cita"
        className="pac-modal"
        overlayClassName="pac-modal-overlay"
      >
        <CitaForm onSubmit={handleNuevaCita} user={user} />
      </Modal>

    </div>
  );
}