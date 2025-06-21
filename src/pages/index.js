import Link from "next/link";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Modal from "react-modal";

Modal.setAppElement("#__next");

export default function MenuPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { login, role } = useAuth();
  const router = useRouter();
  const [sapidInput, setSapidInput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);


  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(userInput, passwordInput);

      const redirectPath = role === "admin" ? "/admin/control" : `/${role}`;
      router.push(redirectPath);
    } catch (error) {
      setError(error.message || "Credenciales incorrectas");
    } finally {
      setIsSubmitting(false);
    }
  };

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

              {error && (
                <div className="login-error">
                  <svg className="error-icon" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`login-btn ${isSubmitting ? "loading" : ""}`}
              >
                {isSubmitting ? (
                  <span className="spinner-container">
                    <span className="spinner"></span>
                    <span className="spinner-text">Validando...</span>
                  </span>
                ) : (
                  "Ingresar"
                )}
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
