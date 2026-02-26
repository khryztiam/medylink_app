import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import CitaForm from "@/components/CitaForm"; // 👈 Asegúrate de que el path esté correcto
import { v4 as uuidv4 } from "uuid";
import { agregarCita, getCitasHoy } from "../lib/citasData";
import {
  FaUserShield,
  FaTachometerAlt,
  FaCalendarAlt,
  FaStethoscope,
  FaCheckCircle,
  FaRegClock,
  FaCalendarCheck,
} from "react-icons/fa";
import EstadoConsulta from "@/components/EstadoConsulta";
import Modal from "react-modal";

Modal.setAppElement("#__next");

const Supervisor = () => {
  const { user, userName } = useAuth();
  const [citasProgramadas, setCitasProgramadas] = useState([]);
  const [tiempoPromedio, setTiempoPromedio] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // exito / error
  const [cuposProgramados, setCuposProgramados] = useState(0);
  const [cuposEnEspera, setCuposEnEspera] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citasEnConsulta, setCitasEnConsulta] = useState([]);
  const [citasAtendidas, setCitasAtendidas] = useState([]);

  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);

  const hoyFin = new Date();
  hoyFin.setHours(23, 59, 59, 999);

  // Nueva función para obtener los cupos ocupados (excluyendo 'pendiente')
  const fetchCuposOcupados = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .in("estado", ["programado", "en espera"]) // Excluye estado 'pendiente'
      .gte("programmer_at", hoyInicio.toISOString())
      .lte("programmer_at", hoyFin.toISOString())
      .order("programmer_at", { ascending: true });

    if (error) {
      console.error("Error al obtener los estados:", error);
      return { programado: [], enEspera: [] }; // Retorna objetos vacíos en caso de error
    }

    // Contar los estados
    const programado = data.filter((cita) => cita.estado === "programado");
    const enEspera = data.filter((cita) => cita.estado === "en espera");

    setCuposProgramados(cuposProgramados);
    setCuposEnEspera(cuposEnEspera);
  };

  // Fetch inicial de citas programadas
  const fetchCitasProgramadas = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .eq("estado", "programado")
      .order("programmer_at", { ascending: true });

    if (error) {
      console.error("Error al obtener citas:", error);
      return;
    }

    setCitasProgramadas(data);
  };

  const fetchCitasEnConsulta = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .eq("estado", "en consulta")
      .gte("programmer_at", hoyInicio.toISOString())
      .lte("programmer_at", hoyFin.toISOString())
      .order("programmer_at", { ascending: true });

    if (error) {
      console.error("Error al obtener citas en consulta:", error);
      return;
    }

    setCitasEnConsulta(data);
  };

  const fetchCitasAtendidas = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .eq("estado", "atendido")
      .gte("check_in", hoyInicio.toISOString())
      .lte("check_in", hoyFin.toISOString())
      .order("check_in", { ascending: true });

    if (error) {
      console.error("Error al obtener citas atendidas:", error);
      return;
    }

    setCitasAtendidas(data);
  };

  // Calcular tiempo promedio de atención
  const fetchTiempoPromedio = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("check_in, check_out")
      .eq("estado", "atendido")
      // Filtramos para obtener solo citas atendidas hoy
      .gte("check_in", hoyInicio.toISOString())
      .lte("check_in", hoyFin.toISOString());

    if (error) {
      console.error("Error al calcular tiempo promedio:", error);
      return;
    }

    if (data.length === 0) {
      setTiempoPromedio(null);
      return;
    }

    const tiempos = data
      .filter((cita) => {
        // Aseguramos que ambas fechas existan y sean del mismo día
        if (!cita.check_in || !cita.check_out) return false;

        const inicio = new Date(cita.check_in);
        const fin = new Date(cita.check_out);
        // Verificamos que sean del mismo día
        return inicio.toDateString() === fin.toDateString();
      })
      .map((cita) => {
        const inicio = new Date(cita.check_in);
        const fin = new Date(cita.check_out);
        return (fin - inicio) / 60000; // minutos
      });
    // Si no hay tiempos válidos después del filtrado
    if (tiempos.length === 0) {
      setTiempoPromedio(null);
      return;
    }

    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    setTiempoPromedio(promedio.toFixed(1));
  };

  useEffect(() => {
    fetchCitasProgramadas();
    fetchCitasEnConsulta();
    fetchCitasAtendidas();
    fetchTiempoPromedio();
    fetchCuposOcupados();

    const canal = supabase
      .channel("supervisor_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "citas" },
        (payload) => {
          fetchCitasProgramadas();
          fetchCitasEnConsulta();
          fetchCitasAtendidas();
          fetchTiempoPromedio();
          fetchCuposOcupados();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const handleNuevaCita = async (nombre, motivo, idSAPInt, urgente) => {
    try {
      const nuevaCita = {
        id: uuidv4(),
        nombre,
        motivo,
        idSAP: idSAPInt,
        estado: "pendiente",
        orden_llegada: null,
        emergency: urgente,
      };

      await agregarCita(nuevaCita);

      // Mensaje de éxito
      setTipoMensaje("exito");
      setMensaje("✅ Cita creada exitosamente.");
      closeModal();
    } catch (error) {
      console.error("Error al crear la cita:", error);
      setTipoMensaje("error");
      setMensaje("❌ Ocurrió un error al crear la cita.");
    }

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setMensaje("");
      setTipoMensaje("");
    }, 3000);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  /* Cancelacion de citas */
  const cancelarCita = async (idCita) => {
    const { error } = await supabase
      .from("citas")
      .update({ estado: "cancelado" })
      .eq("id", idCita);

    if (error) {
      console.error("Error al cancelar la cita:", error);
      setMensaje("❌ No se pudo cancelar la cita.");
      setTipoMensaje("error");
    } else {
      setMensaje("✅ Cita cancelada correctamente.");
      setTipoMensaje("exito");
    }

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setMensaje("");
      setTipoMensaje("");
    }, 3000);
  };

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
        <h1 className="supervisor-title">
          <FaUserShield className="title-icon" />
          Coordinador
          <span className="title-extra">
            <FaTachometerAlt className="extra-icon" />
            Panel de Gestión de Linea
          </span>
        </h1>
      </div>
      <div className="content-wrapper">
        <div className="main">
          <div className="supervisor-container">
            <div className="panels-container">
              {/* Panel principal */}
              <div className="panel-main">
                <div className="saludo-card">
                  <div className="saludo-texto">
                    <h2>
                      {iconoSaludo} {saludo}, {nombre}.
                    </h2>
                    <p
                      className="saludo-frase"
                      style={{
                        fontSize: "1.3em",
                        marginTop: "20px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Gracias por asegurar la producción sin perder de vista lo
                      más valioso: la salud y bienestar de tu equipo 🩺👷‍♂️⚙️
                    </p>
                  </div>
                </div>
                <h2 className="panel-title">
                  Programación y Monitoreo de Citas
                </h2>
                <div className="panel-content">
                  {/* Programadas */}
                  <div className="section-header estado-programado2">
                    <FaCalendarAlt className="estado-icon" />
                    <span>Programadas</span>
                  </div>
                  {citasProgramadas.length > 0 ? (
                    <ul className="citas-list">
                      {citasProgramadas.map((cita) => (
                        <li key={cita.id} className="cita-item">
                          <div className="cita-detalle">
                            <strong className="cita-nombre">
                              {cita.nombre}
                            </strong>
                            <span className="cita-fecha">
                              {new Date(cita.programmer_at).toLocaleString(
                                "es-MX",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          </div>
                          <button
                            className="btn-cancelc"
                            onClick={() =>
                              window.confirm(
                                "¿Estás seguro de cancelar esta cita?"
                              )
                                ? cancelarCita(cita.id)
                                : null
                            }
                          >
                            Cancelar
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay citas programadas actualmente.</p>
                  )}

                  {/* En Consulta */}
                  <div className="section-header2 estado-consulta2">
                    <span>
                      <FaStethoscope className="estado-icon estado-consulta2" />{" "}
                      En Consulta
                    </span>
                  </div>
                  {citasEnConsulta.length > 0 ? (
                    <ul className="citas-list">
                      {citasEnConsulta.map((cita) => (
                        <li key={cita.id} className="estado-consulta2">
                          <strong>{cita.nombre}</strong> —{" "}
                          {cita.consultation_at
                            ? new Date(cita.consultation_at).toLocaleString(
                                "es-MX",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : "sin hora"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay citas en consulta.</p>
                  )}

                  {/* Atendidas */}
                  <div className="section-header3 estado-atendido">
                    <span>
                      <FaCheckCircle className="estado-icon estado-atendido" />{" "}
                      Atendidas
                    </span>
                  </div>
                  {citasAtendidas.length > 0 ? (
                    <ul className="citas-list">
                      {citasAtendidas.map((cita) => (
                        <li key={cita.id} className="estado-atendido">
                          <strong>{cita.nombre}</strong> —{" "}
                          {cita.check_out
                            ? new Date(cita.check_out).toLocaleString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "sin salida"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay citas atendidas aún.</p>
                  )}
                </div>
              </div>
              <div className="floating-status-paciente">
                <EstadoConsulta />
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar">
          <h3>Datos del Dia</h3>
          <div className="summary-cards">
            {/* Programados */}
            <div className="summary-card">
              <span className="summary-icon">📅</span>
              <div className="divider" />
              <h3>Programaciones</h3>
              <p>{cuposProgramados}</p>
            </div>
            {/* En espera */}
            <div className="summary-card">
              <span className="summary-icon">⏳</span>
              <div className="divider" />
              <h3>En espera</h3>
              <p>{cuposEnEspera}</p>
            </div>

            {/* Tiempo Promedio */}
            <div className="summary-card">
              <span className="summary-icon">⏱️</span>
              <div className="divider" />
              <h3>Tiempo Promedio</h3>
              <p>{tiempoPromedio ? `${tiempoPromedio} min` : "N/A"}</p>
            </div>
          </div>
          <div className="panel-side">
            <div className="saludo-boton">
              <button onClick={openModal} className="pac-card-button">
                Solicitar Cita
              </button>
            </div>

            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Formulario de cita"
              className="pac-modal"
              overlayClassName="pac-modal-overlay"
            >
              <CitaForm onSubmit={handleNuevaCita} user={user} />
            </Modal>
            {mensaje && (
              <div className={`mensaje-alerta ${tipoMensaje}`}>{mensaje}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supervisor;
