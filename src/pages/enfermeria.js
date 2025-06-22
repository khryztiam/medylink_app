import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCitas, actualizarCita, agregarCita } from "../lib/citasData";
import CitaForm from "../components/CitaForm";
import FechaHoraInput from "../components/FechaHoraInput";
import ConsultaCita from "../components/ConsultaCita";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { FaUserNurse, FaCalendarAlt } from "react-icons/fa";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Modal from "react-modal";
import MedicoActivo from "@/components/MedicoActivo";

Modal.setAppElement("#__next");

export default function Enfermeria() {
  const { user } = useAuth();
  const [pendientes, setPendientes] = useState([]);
  const [programadas, setProgramadas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNuevaCitaModalOpen, setIsNuevaCitaModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [fechasProgramadas, setFechasProgramadas] = useState({});
  const [nuevaFechaHora, setNuevaFechaHora] = useState("");
  const [enEspera, setEnEspera] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [todasLasCitas, setTodasLasCitas] = useState([]);
  const [miCita, setMiCita] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  useEffect(() => {
    const fetchTodasCitas = async () => {
      const { data } = await supabase
        .from("citas")
        .select("*")
        .order("created_at", { ascending: false });
      setTodasLasCitas(data);
    };
    fetchTodasCitas();
  }, []);

  // Detectar cambio de tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carga inicial y al actualizar
  const load = async () => {
    const todas = await getCitas();
    setPendientes(todas.filter((c) => c.estado === "pendiente"));
    setEnEspera(todas.filter((c) => c.estado === "en espera"));
    const prog = todas
      .filter((c) => c.estado === "programado")
      .sort((a, b) => new Date(a.programmer_at) - new Date(b.programmer_at))
      .slice(0, 25);
    setProgramadas(prog);
  };

  function reproducirSonidoNuevaCita() {
    const audio = new Audio("/nueva_cita.mp3"); // Ruta de tu sonido
    audio.play();
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-citas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "citas" },
        (payload) => {
          const cita = payload.new;

          // Actualizar según el nuevo estado
          if (cita.estado === "pendiente") {
            setPendientes((prev) => {
              const yaExiste = prev.find((c) => c.id === cita.id);
              if (yaExiste) {
                return prev.map((c) => (c.id === cita.id ? cita : c));
              } else {
                reproducirSonidoNuevaCita();
                return [cita, ...prev];
              }
            });
          } else {
            // Si la cita ya no es pendiente, quitarla de pendientes
            setPendientes((prev) => prev.filter((c) => c.id !== cita.id));
          }

          if (cita.estado === "en espera") {
            setEnEspera((prev) => {
              const yaExiste = prev.find((c) => c.id === cita.id);
              if (yaExiste) {
                return prev.map((c) => (c.id === cita.id ? cita : c));
              } else {
                return [...prev, cita];
              }
            });
          } else {
            // Si ya no está en espera, quitarla de enEspera
            setEnEspera((prev) => prev.filter((c) => c.id !== cita.id));
          }

          if (cita.estado === "programado") {
            setProgramadas((prev) => {
              const yaExiste = prev.find((c) => c.id === cita.id);
              if (yaExiste) {
                return prev.map((c) => (c.id === cita.id ? cita : c));
              } else {
                return [...prev, cita];
              }
            });
          } else {
            // Si ya no está programado, quitarlo de programadas
            setProgramadas((prev) => prev.filter((c) => c.id !== cita.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Asignar fecha y hora (combinadas) con el nuevo componente
  const handleDatetimeChange = (id, value) => {
    setFechasProgramadas((prev) => ({ ...prev, [id]: value }));
  };

  const programarCita = async (id) => {
    const fechaHora = fechasProgramadas[id];
    if (!fechaHora) return alert("Selecciona fecha y hora.");
    await actualizarCita(id, {
      programmer_at: new Date(fechaHora).toISOString(),
      estado: "programado",
    });
    load();
  };

  // Abrir modal de reprogramación/cancelación
  const openModal = (cita) => {
    setSelected(cita);
    setNuevaFechaHora(cita.programmer_at?.slice(0, 16) || "");
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Reprogramar cita
  const handleReprogram = async (e) => {
    e.preventDefault();
    if (!nuevaFechaHora) return alert("Selecciona fecha y hora.");

    await actualizarCita(selected.id, {
      programmer_at: new Date(nuevaFechaHora).toISOString(),
    });

    closeModal();
    load();
  };

  // Cancelar cita
  const handleCancel = async () => {
    await actualizarCita(selected.id, { estado: "cancelado" });
    closeModal();
    load();
  };

  //CheckIn
  const handleCheckIn = async () => {
    if (!selected) return;

    // 1. Traer todas las citas
    const todas = await getCitas();

    // 2. Fecha de hoy en 'YYYY-MM-DD'
    const hoy = new Date().toISOString().slice(0, 10);

    // 3. Filtrar citas de hoy que ya tengan orden_llegada
    const hoyCitas = todas.filter((c) => {
      const fechaProg = c.programmer_at?.slice(0, 10);
      const tieneOrden = c.orden_llegada != null;
      return fechaProg === hoy && tieneOrden;
    });

    // 4. Calcular siguiente orden
    let siguienteOrden;

    // Si es emergencia, asignar orden 0 (prioridad máxima)
    if (selected.emergency) {
      siguienteOrden = 0;

      // Reordenar las demás citas (sumar 1 a sus órdenes)
      const updatePromises = hoyCitas
        .filter((c) => c.orden_llegada >= 0)
        .map((c) =>
          actualizarCita(c.id, {
            orden_llegada: c.orden_llegada + 1,
          })
        );

      await Promise.all(updatePromises);
    } else {
      // Para citas normales, calcular el siguiente orden disponible
      const maxOrden = hoyCitas.reduce(
        (max, c) => (c.orden_llegada > max ? c.orden_llegada : max),
        0
      );
      siguienteOrden = maxOrden + 1;
    }

    // 5. Actualizar la cita seleccionada
    await actualizarCita(selected.id, {
      estado: "en espera",
      orden_llegada: siguienteOrden,
      check_in: new Date().toISOString(),
    });

    alert(`Check-in exitoso. Turno asignado: #${siguienteOrden}`);
    closeModal();
    load();
  };

  const handleNuevaCita = async (nombre, motivo, idSAPInt, urgente, isss) => {
    try {
      const nuevaCita = {
        id: uuidv4(),
        nombre,
        motivo,
        idSAP: idSAPInt,
        estado: "pendiente",
        orden_llegada: null,
        emergency: urgente,
        isss: isss,
        created_at: new Date().toISOString(), // Añade fecha de creación
        programmer_at: null, // Añade esto si es necesario
      };

      await agregarCita(nuevaCita);
      await load(); // Usa tu función existente para refrescar los datos

      // Mensaje de éxito
      setTipoMensaje("exito");
      setMensaje("✅ Cita creada exitosamente.");

      setIsNuevaCitaModalOpen(false);
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

  const openNuevaCitaModal = () => {
    setIsNuevaCitaModalOpen(true);
  };
  //Html renderizado
  return (
    <div className="main-content">
      <div className="title-bar">
        <h1 className="enfermeria-title">
          <FaUserNurse className="title-icon" />
          Enfermería
          <span className="title-extra">
            <FaCalendarAlt className="extra-icon" />
            Panel de Gestión de Citas
          </span>
        </h1>
      </div>
      <div className="content-wrapper">
      <div className="sidebar">
        <div className="panel-pendientes">
          <h2>🚩 Citas Pendientes</h2>
          {pendientes.length === 0 ? (
            <p>No hay citas pendientes.</p>
          ) : (
            pendientes.map((cita) => (
              <div
                key={cita.id}
                className={`item-cita 
                  ${cita.emergency ? "emergency-card" : ""} 
                  ${cita.isss ? "isss-card" : ""}`}
              >
                <div className="cita-header">
                  <p className="cita-nombre">
                    <strong>{cita.nombre}</strong>
                  </p>
                  {cita.emergency && (
                    <span className="emergency-tag">🚨 EMERGENCIA</span>
                  )}
                </div>
                <p>
                  {cita.motivo} -{" "}
                  {new Date(cita.created_at).toLocaleString("es-MX", {
                    hour12: true,
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <FechaHoraInput
                  value={fechasProgramadas[cita.id] || ""}
                  onChange={(value) =>
                    setFechasProgramadas((prev) => ({
                      ...prev,
                      [cita.id]: value,
                    }))
                  }
                />
                <button onClick={() => programarCita(cita.id)}>
                  Programar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="main">
        <div className="enfermeria-container">
          {/* Tabs con React */}
          <Tabs className={`custom-tabs ${isMobile ? "mobile-view" : ""}`}>
            <TabList className="tab-list">
              {/*  <Tab className="tab-item" selectedClassName="tab-item--selected">
                🚩 Pendientes
              </Tab> */}
              <Tab className="tab-item" selectedClassName="tab-item--selected">
                🗓️ Programadas
              </Tab>
              <Tab className="tab-item" selectedClassName="tab-item--selected">
                ✅ Check-in
              </Tab>
              <Tab className="tab-item" selectedClassName="tab-item--selected">
                🔍 Consulta
              </Tab>
            </TabList>

            {/* Contenido dinámico según el tab */}
            {/*  <TabPanel className="tab-panel">
              <div className="panel-pendientes">
                <h2>🚩 Citas Pendientes</h2>
                {pendientes.length === 0 ? (
                  <p>No hay citas pendientes.</p>
                ) : (
                  pendientes.map((cita) => (
                    <div
                      key={cita.id}
                      className={`item-cita 
                  ${cita.emergency ? "emergency-card" : ""} 
                  ${cita.isss ? "isss-card" : ""}`}
                    >
                      <div className="cita-header">
                        <p className="cita-nombre">
                          <strong>{cita.nombre}</strong>
                        </p>
                        {cita.emergency && (
                          <span className="emergency-tag">🚨 EMERGENCIA</span>
                        )}
                      </div>
                      <p>
                        {cita.motivo} -{" "}
                        {new Date(cita.created_at).toLocaleString("es-MX", {
                          hour12: true,
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                      <FechaHoraInput
                        value={fechasProgramadas[cita.id] || ""}
                        onChange={(value) =>
                          setFechasProgramadas((prev) => ({
                            ...prev,
                            [cita.id]: value,
                          }))
                        }
                      />
                      <button onClick={() => programarCita(cita.id)}>
                        Programar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </TabPanel> */}

            <TabPanel className="tab-panel">
              <div className="panel-programadas">
                <h2>🗓️ Últimas 25 Citas Programadas</h2>
                <div className="table-container">
                  <table className="table-material">
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
                        <tr
                          key={cita.id}
                          onClick={() => openModal(cita)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            {" "}
                            {cita.emergency && (
                              <span
                                style={{
                                  color: "white",
                                  fontSize: "15px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "1px",
                                }}
                              >
                                🚨
                              </span>
                            )}
                            {cita.nombre}
                          </td>
                          <td>{cita.motivo}</td>
                          <td>
                            {new Date(cita.programmer_at).toLocaleDateString()}
                          </td>
                          <td>
                            {new Date(cita.programmer_at).toLocaleTimeString(
                              "es-MX",
                              {
                                hour12: true,
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabPanel>

            <TabPanel className="tab-panel">
              <div className="panel-checkin">
                <h2>✅ Pacientes en espera</h2>
                {enEspera.filter((c) => c.estado === "en espera").length ===
                0 ? (
                  <p>No hay pacientes en espera.</p>
                ) : (
                  <div className="lista-checkin">
                    {enEspera
                      .sort((a, b) => a.orden_llegada - b.orden_llegada)
                      .map((cita) => (
                        <div
                          key={cita.id}
                          className={`item-checkin ${
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
                              <span className="emergency-tag">
                                🚨 EMERGENCIA
                              </span>
                            )}
                            {cita.nombre}
                          </h3>

                          <p className="card-motivo">{cita.motivo}</p>
                          <div className="card-turno">
                            Turno: <span>#{cita.orden_llegada}</span>
                          </div>

                          {/* Mostrar hora de check-in si existe */}
                          {cita.check_in && (
                            <div className="checkin-time">
                              <span>Check-in: </span>
                              {new Date(cita.check_in).toLocaleTimeString(
                                "es-MX",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel className="tab-panel">
              <div className="panel-consulta">
                <div className="material-group">
                  <button onClick={openNuevaCitaModal} className="ok">
                    Solicitar Cita
                  </button>
                </div>
                <ConsultaCita citas={todasLasCitas} />
                {mensaje && (
                  <div className={`mensaje-alerta ${tipoMensaje}`}>
                    {mensaje}
                  </div>
                )}
              </div>
            </TabPanel>
          </Tabs>

          {/* Modal de reprogramación */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="Reprogramar o cancelar cita"
            className="prog-modal"
            overlayClassName="prog-modal-overlay"
            closeTimeoutMS={300}
          >
            <div className="prog-modal-header">
              <h2>Reprogramar / Cancelar</h2>
            </div>
            {selected && (
              <form onSubmit={handleReprogram} className="prog-modal-content">
                <div className="prog-from-group">
                  <label htmlFor="nombre">
                    Nombre: <strong>{selected.nombre}</strong>
                  </label>
                </div>
                <div>
                  <label>
                    Motivo: <strong>{selected.motivo}</strong>
                  </label>
                </div>
                <div className="prog-form-group">
                  <FechaHoraInput
                    value={nuevaFechaHora}
                    onChange={setNuevaFechaHora}
                  />
                </div>
                <div className="prog-modal-actions">
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    className="prog-btn prog-btn-primary"
                  >
                    Check-in (asignar turno)
                  </button>
                  <button type="submit" className="prog-btn prog-btn-secondary">
                    Reprogramar cita
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="prog-btn prog-btn-danger"
                  >
                    Cancelar cita
                  </button>
                </div>
              </form>
            )}
            <button onClick={closeModal}>Cerrar</button>
          </Modal>
          <Modal
            isOpen={isNuevaCitaModalOpen}
            onRequestClose={() => setIsNuevaCitaModalOpen(false)}
            contentLabel="Formulario de cita"
          >
            <CitaForm
              onSubmit={handleNuevaCita}
              user={user}
              onCancel={() => setIsNuevaCitaModalOpen(false)}
            />
          </Modal>
          <MedicoActivo />
        </div>
      </div>
      </div>
    </div>
  );
}
