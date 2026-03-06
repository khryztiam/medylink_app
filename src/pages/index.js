// pages/index.js
import Link from "next/link";
import { useState } from "react";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import styles from "@/styles/Login.module.css";

export default function LoginPage() {
  const { login, role } = useAuth();
  const router = useRouter();

  const [userInput,     setUserInput]     = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [error,         setError]         = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(userInput, passwordInput);
      const redirect = role === "admin" ? "/admin/control" : `/${role}`;
      router.push(redirect);
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head><title>MedyLink — Ingreso</title></Head>

      <div className={styles.bodyBg}>
        <div className={styles.card}>

          {/* Logo */}
          <div className={styles.logoWrap}>
            <img src="/logo.png" alt="MedyLink" className={styles.logo} />
            <h2 className={styles.cardTitle}>Bienvenido a MedyLink</h2>
            <p className={styles.cardSubtitle}>Ingresa tu SAP ID y contraseña</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className={styles.form}>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="sapid">SAP ID</label>
              <input
                id="sapid"
                type="text"
                placeholder="Ingrese su SAP ID"
                className={styles.formControl}
                onChange={(e) => setUserInput(`${e.target.value.trim()}@yazaki.com`)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Contraseña"
                className={styles.formControl}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className={styles.errorBox}>
                <svg className={styles.errorIcon} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.btnSubmit}
            >
              {isSubmitting ? (
                <span className={styles.spinnerWrap}>
                  <span className={styles.spinner} />
                  <span className={styles.spinnerText}>Validando...</span>
                </span>
              ) : "Ingresar"}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.cardFooter}>
            <p>¿No tienes cuenta?</p>
            <Link href="/register" className={styles.footerLink}>
              Regístrate aquí →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}