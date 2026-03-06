// pages/supervisor.js
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import CitaForm from "@/components/CitaForm";
import { agregarCita } from "../lib/citasData";
import {
  FaCalendarAlt, FaStethoscope, FaCheckCircle,
  FaHourglassHalf, FaClock, FaPlus,
} from "react-icons/fa";
import EstadoConsulta from "@/components/EstadoConsulta";
import Modal from "react-modal";
import styles from "@/styles/Supervisor.module.css";

Modal.setAppElement("#__next");

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
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}
function formatHora(str) {
  if (!str) return "—";
  return new Date(str).toLocaleTimeString("es-MX", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function hoyRango() {
  const ini = new Date(); ini.setHours(0, 0, 0, 0);
  const fin = new Date(); fin.setHours(23, 59, 59, 999);
  return { ini: ini.toISOString(), fin: fin.toISOString() };
}

// ─── Componente ───────────────────────────────────────────────────────────────
const Supervisor = () => {
  const { user, userName } = useAuth();

  const [citasProgramadas, setCitasProgramadas] = useState([]);
  const [citasEnConsulta,  setCitasEnConsulta]  = useState([]);
  const [citasAtendidas,   setCitasAtendidas]   = useState([]);
  const [tiempoPromedio,   setTiempoPromedio]   = useState(null);
  const [cuposProgramados, setCuposProgramados] = useState(0);
  const [cuposEnEspera,    setCuposEnEspera]    = useState(0);
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [mensaje,          setMensaje]          = useState(null);

  const { texto: saludoTexto, icono: saludoIcono } = getSaludo();
  const nombre = userName || "Coordinador";

  // ── Auto-limpiar mensaje ──────────────────────────────────────────
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 3500);
    return () => clearTimeout(t);
  }, [mensaje]);

  // ── Fetchers ──────────────────────────────────────────────────────
  const fetchProgramadas = useCallback(async () => {
    const { data, error } = await supabase
      .from("citas").select("*").eq("estado", "programado")
      .order("programmer_at", { ascending: true });
    if (!error) setCitasProgramadas(data);
  }, []);

  const fetchEnConsulta = useCallback(async () => {
    const { ini, fin } = hoyRango();
    const { data, error } = await supabase
      .from("citas").select("*").eq("estado", "en consulta")
      .gte("programmer_at", ini).lte("programmer_at", fin)
      .order("programmer_at", { ascending: true });
    if (!error) setCitasEnConsulta(data);
  }, []);

  const fetchAtendidas = useCallback(async () => {
    const { ini, fin } = hoyRango();
    const { data, error } = await supabase
      .from("citas").select("*").eq("estado", "atendido")
      .gte("check_in", ini).lte("check_in", fin)
      .order("check_in", { ascending: true });
    if (!error) setCitasAtendidas(data);
  }, []);

  // BUG FIX: antes se llamaba setCuposProgramados(cuposProgramados) con el valor
  // anterior — nunca actualizaba. Ahora usa los datos recién traídos.
  const fetchCupos = useCallback(async () => {
    const { ini, fin } = hoyRango();
    const { data, error } = await supabase
      .from("citas").select("estado")
      .in("estado", ["programado", "en espera"])
      .gte("programmer_at", ini).lte("programmer_at", fin);
    if (error) return;
    setCuposProgramados(data.filter((c) => c.estado === "programado").length);
    setCuposEnEspera(data.filter((c) => c.estado === "en espera").length);
  }, []);

  const fetchTiempoPromedio = useCallback(async () => {
    const { ini, fin } = hoyRango();
    const { data, error } = await supabase
      .from("citas").select("check_in, check_out").eq("estado", "atendido")
      .gte("check_in", ini).lte("check_in", fin);
    if (error || !data?.length) { setTiempoPromedio(null); return; }

    const tiempos = data
      .filter((c) => c.check_in && c.check_out)
      .map((c) => (new Date(c.check_out) - new Date(c.check_in)) / 60000)
      .filter((t) => t > 0);

    if (!tiempos.length) { setTiempoPromedio(null); return; }
    setTiempoPromedio((tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(1));
  }, []);

  const loadAll = useCallback(() => {
    fetchProgramadas();
    fetchEnConsulta();
    fetchAtendidas();
    fetchCupos();
    fetchTiempoPromedio();
  }, [fetchProgramadas, fetchEnConsulta, fetchAtendidas, fetchCupos, fetchTiempoPromedio]);

  useEffect(() => {
    loadAll();
    const canal = supabase
      .channel("supervisor-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "citas" }, loadAll)
      .subscribe();
    return () => supabase.removeChannel(canal);
  }, [loadAll]);

  // ── Acciones ──────────────────────────────────────────────────────
  const cancelarCita = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar esta cita?")) return;
    const { error } = await supabase.from("citas").update({ estado: "cancelado" }).eq("id", id);
    setMensaje(error
      ? { texto: "❌ No se pudo cancelar la cita.", tipo: "error" }
      : { texto: "✅ Cita cancelada correctamente.", tipo: "exito" }
    );
  };

  const handleNuevaCita = async ({ nombre, motivo, idSAP, urgente, isss }) => {
    try {
      await agregarCita({
        nombre, motivo,
        idSAP: String(idSAP).trim(),
        estado: "pendiente",
        emergency: urgente,
        isss: isss,
      });
      setMensaje({ texto: "✅ Cita creada exitosamente.", tipo: "exito" });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setMensaje({ texto: "❌ Error al crear la cita.", tipo: "error" });
    }
  };

  // ── JSX ───────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Columna principal ──────────────────────────────────── */}
      <div className={styles.main}>

        {/* Saludo compacto */}
        <div className={styles.saludoCard}>
          <div className={styles.saludoTexto}>
            <h2>{saludoIcono} {saludoTexto}, {nombre}.</h2>
            <p className={styles.saludoFrase}>
              Gracias por asegurar la producción sin perder de vista lo
                      más valioso: la salud y bienestar de tu equipo 🩺👷‍♂️⚙️
            </p>
          </div>
        </div>

        {/* Estado consulta — componente existente */}
        <EstadoConsulta />

        {/* Panel de monitoreo */}
        <div className={styles.monitorPanel}>
          <div className={styles.monitorHeader}>
            <h2 className={styles.monitorTitle}>
              <FaCalendarAlt /> Programación y Monitoreo de Citas
            </h2>
          </div>

          <div className={styles.monitorBody}>

            {/* ── Programadas ──────────────────────────────── */}
            <div className={styles.seccion}>
              <div className={`${styles.seccionHeader} ${styles.seccionProgramadas}`}>
                <FaCalendarAlt className={styles.seccionIcon} />
                Programadas
              </div>
              {citasProgramadas.length === 0 ? (
                <p className={styles.emptySeccion}>No hay citas programadas actualmente.</p>
              ) : (
                <ul className={styles.citasList}>
                  {citasProgramadas.map((cita) => (
                    <li key={cita.id} className={styles.citaItem}>
                      <div className={styles.citaDetalle}>
                        <span className={styles.citaNombre}>{cita.nombre}</span>
                        <span className={styles.citaFecha}>{formatFechaHora(cita.programmer_at)}</span>
                      </div>
                      <button
                        className={styles.btnCancelar}
                        onClick={() => cancelarCita(cita.id)}
                      >
                        Cancelar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ── En Consulta ──────────────────────────────── */}
            <div className={styles.seccion}>
              <div className={`${styles.seccionHeader} ${styles.seccionConsulta}`}>
                <FaStethoscope className={styles.seccionIcon} />
                En Consulta
              </div>
              {citasEnConsulta.length === 0 ? (
                <p className={styles.emptySeccion}>No hay citas en consulta.</p>
              ) : (
                <ul className={styles.citasList}>
                  {citasEnConsulta.map((cita) => (
                    <li key={cita.id} className={styles.citaItemSimple}>
                      <span className={styles.citaNombreSimple}>{cita.nombre}</span>
                      <span className={styles.citaHora}>{formatHora(cita.consultation_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ── Atendidas ────────────────────────────────── */}
            <div className={styles.seccion}>
              <div className={`${styles.seccionHeader} ${styles.seccionAtendidas}`}>
                <FaCheckCircle className={styles.seccionIcon} />
                Atendidas
              </div>
              {citasAtendidas.length === 0 ? (
                <p className={styles.emptySeccion}>No hay citas atendidas aún.</p>
              ) : (
                <ul className={styles.citasList}>
                  {citasAtendidas.map((cita) => (
                    <li key={cita.id} className={styles.citaItemSimple}>
                      <span className={styles.citaNombreSimple}>{cita.nombre}</span>
                      <span className={styles.citaHora}>{formatHora(cita.check_out)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Aside derecho ──────────────────────────────────────── */}
      <aside className={styles.aside}>

        {/* KPI cards */}
        <p className={styles.asideTitle}>Datos del Día</p>
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconBlue}`}>📅</div>
            <div className={styles.kpiInfo}>
              <p className={styles.kpiLabel}>Programaciones</p>
              <p className={styles.kpiValue}>{cuposProgramados}</p>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconAmber}`}>⏳</div>
            <div className={styles.kpiInfo}>
              <p className={styles.kpiLabel}>En Espera</p>
              <p className={styles.kpiValue}>{cuposEnEspera}</p>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconGreen}`}>⏱️</div>
            <div className={styles.kpiInfo}>
              <p className={styles.kpiLabel}>Tiempo Promedio</p>
              <p className={`${styles.kpiValue} ${tiempoPromedio ? styles.kpiValueSmall : ""}`}>
                {tiempoPromedio ? `${tiempoPromedio} min` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.accionesCard}>
          <p className={styles.accionesTitle}>Acciones</p>
          <button className={styles.btnAgregar} onClick={() => setIsModalOpen(true)}>
            <FaPlus size={11} />
            Solicitar Cita
          </button>

          {mensaje && (
            <div className={`${styles.mensajeAlerta} ${styles[mensaje.tipo]}`}>
              {mensaje.texto}
            </div>
          )}
        </div>

      </aside>

      {/* ── Modal nueva cita ───────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Formulario de cita"
        className="pac-modal"
        overlayClassName="pac-modal-overlay"
        closeTimeoutMS={250}
      >
        <CitaForm
          onSubmit={handleNuevaCita}
          user={user}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

    </div>
  );
};

export default Supervisor;