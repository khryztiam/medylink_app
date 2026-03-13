// pages/enfermeria.js
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCitas,
  getCitasPorPaciente,
  actualizarCita,
  agregarCita,
} from "../lib/citasData";
import CitaForm from "../components/CitaForm";
import FechaHoraInput from "../components/FechaHoraInput";
import ConsultaCita from "../components/ConsultaCita";
import { supabase } from "@/lib/supabase";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Modal from "react-modal";
import MedicoActivo from "@/components/MedicoActivo";
import {
  FaCalendarAlt, FaCheckCircle, FaSearch,
  FaPlus, FaTimes, FaChevronDown,
  FaExclamationTriangle, FaClock,
} from "react-icons/fa";
import styles from "@/styles/Enfermeria.module.css";

// ─── Audio helper ──────────────────────────────────────────────────────────────
// Política de autoplay: los browsers bloquean audio hasta que el usuario
// interactúa con la página. Desbloquear en el primer click/tecla garantiza
// que el sonido de nueva cita funcione aunque llegue antes de cualquier acción.
let audioDesbloqueado = false;

function desbloquearAudio() {
  if (audioDesbloqueado) return;
  // Crear y reproducir silencio para "desbloquear" el contexto de audio
  const audio = new Audio("/nueva_cita.mp3");
  audio.volume = 0;
  audio.play()
    .then(() => { audio.pause(); audio.currentTime = 0; audioDesbloqueado = true; })
    .catch(() => {}); // Si falla, se intentará de nuevo en el próximo click
}

function reproducirSonidoNuevaCita() {
  try {
    const audio = new Audio("/nueva_cita.mp3");
    audio.volume = 1.0;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        console.warn("🔇 Audio bloqueado — el usuario aún no ha interactuado con la página.");
      });
    }
  } catch (err) {
    console.warn("Audio no disponible:", err);
  }
}

Modal.setAppElement("#__next");

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSaludo() {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return { texto: "Buenos días",   icono: "☀️" };
  if (h >= 12 && h < 19) return { texto: "Buenas tardes", icono: "🌤️" };
  return                         { texto: "Buenas noches", icono: "🌙" };
}

function formatHora(str) {
  if (!str) return "—";
  return new Date(str).toLocaleTimeString("es-MX", {
    hour12: true, hour: "2-digit", minute: "2-digit",
  });
}
function formatFecha(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es-SV", {
    day: "2-digit", month: "2-digit", year: "2-digit",
  });
}
function formatFechaHora(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("es-MX", {
    hour12: true, hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Enfermeria() {
  const { user, userName } = useAuth();

  const [pendientes,    setPendientes]    = useState([]);
  const [programadas,   setProgramadas]   = useState([]);
  const [enEspera,      setEnEspera]      = useState([]);
  const [todasLasCitas, setTodasLasCitas] = useState([]);

  const [isModalOpen,       setIsModalOpen]       = useState(false);
  const [isNuevaCitaModal,  setIsNuevaCitaModal]  = useState(false);
  const [selected,          setSelected]          = useState(null);
  const [fechasProgramadas, setFechasProgramadas] = useState({});
  const [nuevaFechaHora,    setNuevaFechaHora]    = useState("");

  const [mensaje,    setMensaje]    = useState(null); // { texto, tipo }
  const [tabIndex,   setTabIndex]   = useState(0);
  const [bannerOpen, setBannerOpen] = useState(true); // colapsable

  // Ref con IDs de citas ya conocidas — evita stale closure en el canal realtime.
  // Se actualiza cada vez que `load` trae datos frescos.
  const citasConocidasRef = useRef(new Set());

  const { texto: saludoTexto, icono: saludoIcono } = getSaludo();
  const nombre = userName || "Enfermería";

  // ── Carga de datos ───────────────────────────────────────────────
  const load = useCallback(async () => {
    const todas = await getAllCitas();
    if (!Array.isArray(todas)) return;

    // Registrar todos los IDs actuales como "conocidos"
    // para que el canal realtime sepa qué es realmente nuevo.
    citasConocidasRef.current = new Set(todas.map((c) => c.id));

    setPendientes(todas.filter((c) => c.estado === "pendiente"));
    setEnEspera(todas.filter((c) => c.estado === "en espera"));
    setProgramadas(
      todas
        .filter((c) => c.estado === "programado")
        .sort((a, b) => new Date(a.programmer_at) - new Date(b.programmer_at))
        .slice(0, 25)
    );
    setTodasLasCitas(todas.slice(0, 50));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Desbloquear audio en el primer gesto del usuario
  // Esto garantiza que el sonido de nueva cita funcione aunque llegue
  // antes de que la enfermera haya clickeado algo en la página.
  useEffect(() => {
    const unlock = () => { desbloquearAudio(); };
    window.addEventListener("click",   unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click",      unlock);
      window.removeEventListener("keydown",    unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // ── Suscripción realtime ─────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("realtime-citas-enfermeria")
      .on("postgres_changes", { event: "*", schema: "public", table: "citas" }, (payload) => {
        const cita = payload.new;
        if (!cita) return;

        const upsert = (setter, cita) =>
          setter((prev) => {
            const existe = prev.find((c) => c.id === cita.id);
            return existe ? prev.map((c) => c.id === cita.id ? cita : c) : [cita, ...prev];
          });
        const remove = (setter, id) =>
          setter((prev) => prev.filter((c) => c.id !== id));

        // ── Sonido: solo si la cita es nueva (no estaba en la carga inicial) ──
        // Usamos la ref — no depende del estado React, nunca es stale.
        const esNueva = !citasConocidasRef.current.has(cita.id);
        if (cita.estado === "pendiente" && esNueva) {
          reproducirSonidoNuevaCita();
        }
        // Marcar como conocida para no sonar de nuevo en updates posteriores
        citasConocidasRef.current.add(cita.id);

        if (cita.estado === "pendiente") {
          upsert(setPendientes, cita);
        } else {
          remove(setPendientes, cita.id);
        }

        if (cita.estado === "en espera") {
          upsert(setEnEspera, cita);
        } else {
          remove(setEnEspera, cita.id);
        }

        if (cita.estado === "programado") {
          upsert(setProgramadas, cita);
        } else {
          remove(setProgramadas, cita.id);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // Sin dependencias — la ref no necesita re-suscribir

  // ── Auto-limpiar mensaje ─────────────────────────────────────────
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 3500);
    return () => clearTimeout(t);
  }, [mensaje]);

  // ── Acciones ─────────────────────────────────────────────────────
  const programarCita = async (id) => {
    const fechaHora = fechasProgramadas[id];
    if (!fechaHora) return alert("Selecciona fecha y hora.");
    await actualizarCita(id, {
      programmer_at: new Date(fechaHora).toISOString(),
      estado: "programado",
    });
    load();
  };

  const openModal = (cita) => {
    setSelected(cita);
    setNuevaFechaHora(cita.programmer_at?.slice(0, 16) || "");
    setIsModalOpen(true);
  };

  const handleReprogram = async (e) => {
    e.preventDefault();
    if (!nuevaFechaHora) return alert("Selecciona fecha y hora.");
    await actualizarCita(selected.id, {
      programmer_at: new Date(nuevaFechaHora).toISOString(),
    });
    setIsModalOpen(false);
    load();
  };

  const handleCancel = async () => {
    await actualizarCita(selected.id, { estado: "cancelado" });
    setIsModalOpen(false);
    load();
  };

  const handleCheckIn = async () => {
    if (!selected) return;

    // Traer citas del paciente para calcular orden (fix: sin argumento indefinido)
    const todas = await getAllCitas();
    const hoy = new Date().toISOString().slice(0, 10);
    const hoyCitas = todas.filter((c) => {
      const fechaProg = c.programmer_at?.slice(0, 10);
      return fechaProg === hoy && c.orden_llegada != null;
    });

    let siguienteOrden;
    if (selected.emergency) {
      siguienteOrden = 0;
      await Promise.all(
        hoyCitas
          .filter((c) => c.orden_llegada >= 0)
          .map((c) => actualizarCita(c.id, { orden_llegada: c.orden_llegada + 1 }))
      );
    } else {
      const maxOrden = hoyCitas.reduce(
        (max, c) => (c.orden_llegada > max ? c.orden_llegada : max), 0
      );
      siguienteOrden = maxOrden + 1;
    }

    await actualizarCita(selected.id, {
      estado: "en espera",
      orden_llegada: siguienteOrden,
      check_in: new Date().toISOString(),
    });

    setIsModalOpen(false);
    load();
  };

  const handleNuevaCita = async ({ nombre, motivo, idSAP, urgente, isss }) => {
    try {
      await agregarCita({
        nombre, motivo, idSAP,
        estado: "pendiente",
        emergency: urgente,
        isss: isss,
      });
      setMensaje({ texto: "✅ Cita creada exitosamente.", tipo: "exito" });
      setIsNuevaCitaModal(false);
      load();
    } catch (err) {
      console.error(err);
      setMensaje({ texto: "❌ Error al crear la cita.", tipo: "error" });
    }
  };

  // ── Conteos para chips y badges ──────────────────────────────────
  const countEmergencias = pendientes.filter((c) => c.emergency).length;
  const countIsss        = pendientes.filter((c) => c.isss && !c.emergency).length;
  const countNormales    = pendientes.filter((c) => !c.emergency && !c.isss).length;

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── 1. Fila superior: saludo + botón ──────────────────────── */}
      <div className={styles.topRow}>
        <div className={styles.saludoTexto}>
          <h2>{saludoIcono} {saludoTexto}, {nombre}.</h2>
          <p className={styles.saludoFrase}>
            Cada cita que programas marca la diferencia 🫶
          </p>
        </div>
        <button
          className={styles.btnNuevaCita}
          onClick={() => setIsNuevaCitaModal(true)}
        >
          <FaPlus size={11} />
          Nueva Cita
        </button>
      </div>

      {/* ── 2. Banner colapsable: pendientes ──────────────────────── */}
      <div className={styles.pendientesBanner}>
        {/* Header del banner — clickeable para colapsar */}
        <div
          className={`${styles.pendientesBannerHeader} ${bannerOpen ? styles.pendientesBannerHeaderOpen : ""}`}
          onClick={() => setBannerOpen((v) => !v)}
        >
          <div className={styles.pendientesBannerLeft}>
            <h3 className={styles.pendientesBannerTitle}>
              🚩 Citas Pendientes
              <span className={`${styles.pendientesCount} ${pendientes.length === 0 ? styles.pendientesCountZero : ""}`}>
                {pendientes.length}
              </span>
            </h3>

            {/* Chips resumen — visibles aunque esté colapsado */}
            <div className={styles.pendientesChips}>
              {countEmergencias > 0 && (
                <span className={styles.chip + " " + styles.chipEmergencia}>
                  🚨 {countEmergencias} emergencia{countEmergencias > 1 ? "s" : ""}
                </span>
              )}
              {countIsss > 0 && (
                <span className={styles.chip + " " + styles.chipIsss}>
                  🏥 {countIsss} ISSS
                </span>
              )}
              {countNormales > 0 && (
                <span className={styles.chip + " " + styles.chipNormal}>
                  📋 {countNormales} normal{countNormales > 1 ? "es" : ""}
                </span>
              )}
            </div>
          </div>

          <FaChevronDown
            className={`${styles.chevron} ${bannerOpen ? styles.chevronOpen : ""}`}
            size={14}
          />
        </div>

        {/* Grid de cards — solo cuando está abierto */}
        {bannerOpen && (
          <div className={styles.pendientesGrid}>
            {pendientes.length === 0 ? (
              <div className={styles.pendientesEmpty}>
                <span className={styles.pendientesEmptyIcon}>✅</span>
                No hay citas pendientes por atender.
              </div>
            ) : (
              pendientes.map((cita) => (
                <div
                  key={cita.id}
                  className={`${styles.itemCita} ${cita.emergency ? styles.itemCitaEmergencia : ""} ${cita.isss && !cita.emergency ? styles.itemCitaIsss : ""}`}
                >
                  <div className={styles.itemCitaHeader}>
                    <span className={styles.itemCitaNombre}>{cita.nombre}</span>
                    {cita.emergency && (
                      <span className={styles.emergenciaTag}>
                        🚨 Emergencia
                      </span>
                    )}
                  </div>
                  <p className={styles.itemCitaMotivo}>{cita.motivo}</p>
                  <p className={styles.itemCitaHora}>
                    Solicitada: {formatFechaHora(cita.created_at)}
                  </p>
                  <div className={styles.itemCitaActions}>
                    <div className={styles.fechaHoraWrap}>
                      <FechaHoraInput
                        value={fechasProgramadas[cita.id] || ""}
                        onChange={(value) =>
                          setFechasProgramadas((prev) => ({ ...prev, [cita.id]: value }))
                        }
                      />
                    </div>
                    <button
                      className={styles.btnProgramar}
                      onClick={() => programarCita(cita.id)}
                    >
                      Programar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── 3. Área de trabajo con tabs ───────────────────────────── */}
      <div className={styles.workArea}>
        <Tabs selectedIndex={tabIndex} onSelect={setTabIndex}>

          <TabList className={styles.tabList}>
            <Tab className={styles.tabItem} selectedClassName={styles.tabItemSelected}>
              <FaCalendarAlt size={13} />
              Programadas
              <span className={styles.tabBadge}>{programadas.length}</span>
            </Tab>
            <Tab className={styles.tabItem} selectedClassName={styles.tabItemSelected}>
              <FaCheckCircle size={13} />
              Check-in
              <span className={styles.tabBadge}>{enEspera.length}</span>
            </Tab>
            <Tab className={styles.tabItem} selectedClassName={styles.tabItemSelected}>
              <FaSearch size={13} />
              Consulta
            </Tab>
          </TabList>

          {/* ── Tab 1: Programadas ─────────────────────────────── */}
          <TabPanel className={styles.tabPanel} selectedClassName={styles.tabPanelActive}>
            <h3 className={styles.panelTitle}>
              <FaCalendarAlt /> Últimas 25 Citas Programadas
            </h3>

            {/* Tabla desktop */}
            <div className="table-container">
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Motivo</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {programadas.map((cita) => (
                    <tr key={cita.id} onClick={() => openModal(cita)}>
                      <td>
                        <span className={styles.nombreCell}>
                          {cita.emergency && "🚨 "}{cita.nombre}
                        </span>
                      </td>
                      <td>{cita.motivo}</td>
                      <td>{formatFecha(cita.programmer_at)}</td>
                      <td>{formatHora(cita.programmer_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards móvil */}
            <div className={styles.mobileCards}>
              {programadas.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📅</span>
                  No hay citas programadas.
                </div>
              ) : (
                programadas.map((cita) => (
                  <div key={cita.id} className={styles.citaCard} onClick={() => openModal(cita)}>
                    <div className={styles.citaCardHeader}>
                      <span className={styles.citaCardNombre}>
                        {cita.emergency && "🚨 "}{cita.nombre}
                      </span>
                      <span className={styles.citaCardFecha}>
                        {formatFecha(cita.programmer_at)} {formatHora(cita.programmer_at)}
                      </span>
                    </div>
                    <p className={styles.citaCardMotivo}>{cita.motivo}</p>
                  </div>
                ))
              )}
            </div>
          </TabPanel>

          {/* ── Tab 2: Check-in ────────────────────────────────── */}
          <TabPanel className={styles.tabPanel} selectedClassName={styles.tabPanelActive}>
            <h3 className={styles.panelTitle}>
              <FaCheckCircle /> Pacientes en Espera
            </h3>

            {enEspera.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🪑</span>
                No hay pacientes en espera.
              </div>
            ) : (
              <div className={styles.listaCheckin}>
                {[...enEspera]
                  .sort((a, b) => a.orden_llegada - b.orden_llegada)
                  .map((cita) => (
                    <div
                      key={cita.id}
                      className={`${styles.itemCheckin} ${cita.emergency ? styles.itemCheckinEmergencia : ""}`}
                    >
                      <h4 className={styles.checkinNombre}>
                        {cita.emergency && <span className={styles.emergenciaTag} style={{ marginRight: 6 }}>🚨 Emergencia</span>}
                        {cita.nombre}
                      </h4>
                      <p className={styles.checkinMotivo}>{cita.motivo}</p>
                      <span className={`${styles.checkinTurno} ${cita.emergency ? styles.checkinEmergenciaTurno : ""}`}>
                        <FaClock size={11} />
                        Turno #{cita.orden_llegada}
                      </span>
                      {cita.check_in && (
                        <p className={styles.checkinTime}>
                          Check-in: {formatHora(cita.check_in)}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </TabPanel>

          {/* ── Tab 3: Consulta ────────────────────────────────── */}
          <TabPanel className={styles.tabPanel} selectedClassName={styles.tabPanelActive}>
            <div className={styles.panelConsulta}>
              {mensaje && (
                <div className={`${styles.mensajeAlerta} ${styles[mensaje.tipo]}`}>
                  {mensaje.texto}
                </div>
              )}
              <ConsultaCita citas={todasLasCitas} />
            </div>
          </TabPanel>

        </Tabs>
      </div>

      {/* ── Componente flotante médico activo ─────────────────────── */}
      <MedicoActivo />

      {/* ── Modal reprogramar / cancelar / check-in ───────────────── */}
      {/* prog-modal y prog-modal-overlay están en globals.css */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Gestionar cita"
        className="prog-modal"
        overlayClassName="prog-modal-overlay"
        closeTimeoutMS={250}
      >
        <div className="prog-modal-header">
          <div className="prog-modal-icon">🗓️</div>
          <h2>Gestionar Cita</h2>
        </div>
        {selected && (
          <form onSubmit={handleReprogram} className="prog-modal-content">
            <div className="prog-info-row">
              <div className="prog-info-item">
                Paciente: <strong>{selected.nombre}</strong>
              </div>
              <div className="prog-info-item">
                Motivo: <strong>{selected.motivo}</strong>
              </div>
            </div>
            <div className="prog-form-group">
              <FechaHoraInput value={nuevaFechaHora} onChange={setNuevaFechaHora} />
            </div>
            <div className="prog-modal-actions">
              <button type="button" onClick={handleCheckIn} className="prog-btn prog-btn-primary">
                Check-in
              </button>
              <button type="submit" className="prog-btn prog-btn-secondary">
                Reprogramar
              </button>
              <button type="button" onClick={handleCancel} className="prog-btn prog-btn-danger">
                Cancelar cita
              </button>
            </div>
          </form>
        )}
        <button className="close-icon" onClick={() => setIsModalOpen(false)} type="button">
          <FaTimes />
        </button>
      </Modal>

      {/* ── Modal nueva cita ──────────────────────────────────────── */}
      {/* Usa las clases globales pac-modal del CitaForm */}
      <Modal
        isOpen={isNuevaCitaModal}
        onRequestClose={() => setIsNuevaCitaModal(false)}
        contentLabel="Nueva cita"
        className="pac-modal"
        overlayClassName="pac-modal-overlay"
        closeTimeoutMS={250}
      >
        <CitaForm
          onSubmit={handleNuevaCita}
          user={user}
          onCancel={() => setIsNuevaCitaModal(false)}
        />
      </Modal>

    </div>
  );
}