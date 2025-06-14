import Link from "next/link";
import {
  FaUserShield,
  FaUserInjured,
  FaUserMd,
  FaUserNurse,
  FaCalendarAlt,
  FaUserCog,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Modal from "react-modal";

Modal.setAppElement("#__next"); // Es correcto.

export default function MenuPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { login, user, role, status, loading } = useAuth();
  const router = useRouter();
  const [sapidInput, setSapidInput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openLoginModal = (role) => {
    setSelectedRole(role);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await login(userInput, passwordInput);

    const redirectPath = role === "admin" ? "/admin/control" : `/${role}`;
    router.push(redirectPath);
  } catch (error) {
    alert("Error de login: " + error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  const menuItems = [
    {
      title: "Paciente",
      icon: <FaUserInjured size={48} className="text-teal-600" />,
      description: "Solicitud de consulta",
      role: "paciente",
    },
    {
      title: "Medico",
      icon: <FaUserMd size={48} className="text-blue-600" />,
      description: "Panel médico",
      role: "medico",
    },
    {
      title: "Enfermería",
      icon: <FaUserNurse size={48} className="text-green-600" />,
      description: "Control de solicitudes",
      role: "enfermeria",
    },
    {
      title: "Coordinador",
      icon: <FaUserShield size={48} className="text-purple-600" />,
      description: "Area de Produccion",
      role: "supervisor",
    },
    {
      title: "Turno",
      icon: <FaCalendarAlt size={48} className="text-purple-600" />,
      description: "Visor de turnos",
      role: "turno",
    },
    {
      title: "Administrador",
      icon: <FaUserCog size={48} className="text-purple-600" />,
      description: "Control de la app",
      role: "admin",
    },
  ];

  // NUEVA PARTE DEL RENDER (dentro de tu componente, reemplaza el layout anterior)
  return (
    <>
      <Head>
        <title>MedyLink - Ingreso</title>
      </Head>
      <div className="main content-login">
        <div className="login-page-wrapper">
          <div className="login-box">
            <img src="/logo.png" alt="Logo MedyLink" className="login-logo" />
            <h2 className="login-title">Bienvenido a MedyLink</h2>
            <form onSubmit={handleLogin} className="login-form">
              <div className="login-form-group">
                <label htmlFor="sapid">SAP ID</label>
                <input
                  type="text"
                  id="sapid"
                  placeholder="Ingrese su SAP ID"
                  onChange={(e) => {
                    const sapid = e.target.value.trim();
                    setUserInput(`${sapid}@yazaki.com`);
                  }}
                  required
                  className="login-form-control"
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Contraseña"
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="login-form-control"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`login-btn ${isSubmitting ? "loading" : ""}`}
              >
                {isSubmitting ? "Validando..." : "Ingresar"}
              </button>
            </form>

            <div className="login-footer">
              <p>¿No tienes cuenta?</p>
              <Link href="/register" className="login-register-link">
                Regístrate aquí →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
