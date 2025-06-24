// pages/paciente.js
import { useState, useEffect } from "react";
import { agregarCita, getCitas, subscribeToCitas } from "../lib/citasData";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";
import CitaForm from "../components/CitaForm";
import ConsultaCita from "../components/ConsultaCita";
import EstadoConsulta from "@/components/EstadoConsulta";
import Modal from "react-modal";
import { FaUserInjured, FaUserAlt } from "react-icons/fa";

Modal.setAppElement("#__next");

export default function Home() {
  const { user, userName } = useAuth();
  const [citas, setCitas] = useState([]);
  const [miCita, setMiCita] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // exito / error

  useEffect(() => {
    const fetchCitas = async () => {
      const citasData = await getCitas();
      setCitas(Array.isArray(citasData) ? citasData : []);
    };

    fetchCitas();
    // Suscripción a cambios en tiempo real
    const unsubscribe = subscribeToCitas((payload) => {
      if (payload.eventType === "INSERT") {
        setCitas((prev) => [...prev, payload.new]);
      } else if (payload.eventType === "UPDATE") {
        setCitas((prev) =>
          prev.map((cita) => (cita.id === payload.new.id ? payload.new : cita))
        );
      } else if (payload.eventType === "DELETE") {
        setCitas((prev) => prev.filter((cita) => cita.id !== payload.old.id));
      }
    });

    return () => unsubscribe(); // Limpieza al desmontar
  }, []);

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
      };

      await agregarCita(nuevaCita);
      setMiCita(nuevaCita);

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

  const hora = new Date().getHours();
  let saludo = 'Hola';
  let iconoSaludo = '👋';

  if (hora >= 6 && hora < 12) {
    saludo = 'Buenos días';
    iconoSaludo = '☀️';
  } else if (hora >= 12 && hora < 19) {
    saludo = 'Buenas tardes';
    iconoSaludo = '🌤️';
  } else {
    saludo = 'Buenas noches';
    iconoSaludo = '🌙';
  }

  const nombre = userName || 'Paciente';

  return (
    <div className="main-content">
      <div className="title-bar">
        <h1 className="paciente-title">
          <FaUserInjured className="title-icon" />
          Paciente
          <span className="title-extra">
            <FaUserAlt className="extra-icon" />
            Panel de Usuario
          </span>
        </h1>
      </div>
      <div className="content-wrapper">
        <div className="main">
          <div className="paciente-container">
            <div className="saludo-card">
              <div className="saludo-texto">
                <h2>
                  {iconoSaludo} {saludo}, {nombre}.
                </h2>
                <p className="saludo-frase"
                style={{
                  fontSize: "1.1em",
                  marginTop: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}>Esperamos que tengas un gran día 👨‍⚕️</p>
              </div>

              <div className="saludo-boton">
                <button onClick={openModal} className="pac-card-button">
                  Solicitar Cita
                </button>
              </div>
            </div>
            <div className="floating-status-paciente">
              <EstadoConsulta />
            </div>
            {/* Aviso visual */}
            {mensaje && (
              <div className={`mensaje-alerta ${tipoMensaje}`}>{mensaje}</div>
            )}

            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Formulario de cita"
              className="pac-modal"
              overlayClassName="pac-modal-overlay"
            >
              <CitaForm onSubmit={handleNuevaCita} user={user} />
            </Modal>

            <ConsultaCita
              citas={citas}
              miCita={miCita}
              setMiCita={setMiCita}
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
