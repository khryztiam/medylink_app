// pages/paciente.js
import { useState, useEffect } from "react";
import {
  agregarCita,
  getCitasPorPaciente,
  subscribeToCitas,
} from "../lib/citasData";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";
import CitaForm from "../components/CitaForm";
import ConsultaCita from "../components/ConsultaCita";
import EstadoConsulta from "@/components/EstadoConsulta";
import Modal from "react-modal";
import { FaUserInjured, FaUserAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

Modal.setAppElement("#__next");

export default function Home() {
  const { user, userName, idsap } = useAuth();
  const [citas, setCitas] = useState([]);
  const [miCita, setMiCita] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // exito / error
  const [showTelegramBanner, setShowTelegramBanner] = useState(false);

  useEffect(() => {
    const idActual = idsap || user?.idsap || user?.idSAP;

    if (!idActual) return;

    const fetchDatosIniciales = async () => {
      try {
        // 2. CORRECCIÓN CLAVE: Usar 'idsap' para que coincida con la DB
        const { data: userData, error: userError } = await supabase
          .from("app_users")
          .select("telegram_id")
          .eq("idsap", idActual) // <--- Cambiado de 'sap_id' a 'idsap'
          .maybeSingle();

        if (userError) {
          console.warn("Error en app_users:", userError.message);
        } else if (userData && !userData.telegram_id) {
          // Si la columna existe pero está vacía, mostramos el banner
          setShowTelegramBanner(true);
        }

        // 3. Carga de citas (se mantiene igual)
        const citasData = await getCitasPorPaciente(idActual, 15);
        setCitas(Array.isArray(citasData) ? citasData : []);
      } catch (err) {
        console.error("Error en vista paciente:", err);
      }
    };

    fetchDatosIniciales();

    // Suscripción a cambios en tiempo real (tu lógica actual)
    const unsubscribe = subscribeToCitas((payload) => {
      if (payload.eventType === "INSERT") {
        if (String(payload.new.idsap) === String(idsap)) {
          setCitas((prev) => [payload.new, ...prev]);
        }
      } else if (payload.eventType === "UPDATE") {
        setCitas((prev) =>
          prev.map((cita) => (cita.id === payload.new.id ? payload.new : cita)),
        );
      } else if (payload.eventType === "DELETE") {
        setCitas((prev) => prev.filter((cita) => cita.id !== payload.old.id));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [idsap, user]); // Usamos idsap como dependencia clave

  const handleNuevaCita = async (nombre, motivo, idSAPInt, urgente, isss) => {
    try {
      const nuevaCita = {
        id: uuidv4(),
        nombre,
        motivo,
        idsap: idSAPInt,
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
                <p
                  className="saludo-frase"
                  style={{
                    fontSize: "1.1em",
                    marginTop: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Esperamos que tengas un gran día 👨‍⚕️
                </p>
              </div>

              <div className="saludo-boton">
                <button onClick={openModal} className="pac-card-button">
                  Solicitar Cita
                </button>
              </div>
            </div>
            {/* 2. EL BANNER DE TELEGRAM (Justo debajo del saludo) */}
            {showTelegramBanner && (
              <div className="telegram-card-pro">
                <div className="telegram-accent-bar" />
                <div className="telegram-card-content">
                  <div className="telegram-icon-wrapper">
                    <svg viewBox="0 0 24 24" className="telegram-svg-icon">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </div>
                  <div className="telegram-text-group">
                    <h3>Notificaciones instantáneas</h3>
                    <p>
                      Recibe avisos de tus citas y turnos directamente en tu
                      celular.
                    </p>
                  </div>
                  <div className="telegram-button-group">
                    <button
                      className="btn-later"
                      onClick={() => setShowTelegramBanner(false)}
                    >
                      Más tarde
                    </button>
                    <a
                      href={`https://t.me/medylinkalert_bot?start=${idsap}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-link-telegram"
                      onClick={() => setShowTelegramBanner(false)}
                    >
                      Vincular Telegram
                    </a>
                  </div>
                </div>
              </div>
            )}
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
