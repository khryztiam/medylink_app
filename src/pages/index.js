// pages/index.js
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "@/styles/Login.module.css";

export default function AuthPage() {
  const { login } = useAuth();
  const router    = useRouter();

  const [mode,    setMode]    = useState("login");
  const [animDir, setAnimDir] = useState("right");
  const [animKey, setAnimKey] = useState(0);

  const switchMode = (next) => {
    if (next === mode) return;
    setAnimDir(next === "register" ? "right" : "left");
    setAnimKey((k) => k + 1);
    setMode(next);
    setError("");
    setSuccess("");
  };

  const [idsap,           setIdsap]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");

  const email = idsap.trim() ? `${idsap.trim().toLowerCase()}@yazaki.com` : "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      if (!idsap.trim())                throw new Error("Ingresa tu número SAP.");
      if (password.length < 6)          throw new Error("La contraseña debe tener al menos 6 caracteres.");
      if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden.");

      const { data: existing } = await supabase
        .from("app_users").select("idsap").eq("idsap", idsap.trim()).maybeSingle();
      if (existing) throw new Error("Ya existe una cuenta con ese SAP.");

      const { data: userData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      await supabase.from("app_users").insert([{
        id: userData.user.id, idsap: idsap.trim(), role: "paciente", status: false,
      }]);

      const { data: allowed } = await supabase
        .from("allowed_users").select("idsap").eq("idsap", idsap.trim()).single();
      if (allowed) {
        await supabase.from("app_users").update({ status: true }).eq("id", userData.user.id);
      }

      setSuccess("¡Cuenta creada! Redirigiendo al inicio de sesión...");
      setTimeout(() => switchMode("login"), 1800);
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const animClass = animDir === "right" ? styles.formSlideIn : styles.formSlideInLeft;

  return (
    <>
      <Head>
        <title>MedyLink — {mode === "login" ? "Ingreso" : "Registro"}</title>
      </Head>

      <div className={styles.bodyBg}>

        {/* ── Panel izquierdo: imagen (solo desktop) ────────────── */}
        <div className={styles.illustrationPanel}>
          <div className={styles.illustrationOverlay} />
          <Image
            src="/login-illustration.png"
            alt="Clínica MedyLink"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
          />
          <div className={styles.illustrationContent}>
            <div className={styles.illustrationBadge}>
              <span className={styles.illustrationBadgeDot} />
             Nueva version 2.0
            </div>
            <div className={styles.illustrationFeatures}>
              <div className={styles.featureChip}>🗓️ Citas en tiempo real</div>
              <div className={styles.featureChip}>🔔 Notificaciones</div>
              <div className={styles.featureChip}>🩺 Multi-rol</div>
            </div>
          </div>
        </div>

        {/* ── Panel derecho: formulario ─────────────────────────── */}
        <div className={styles.formPanel}>
          <div className={styles.formInner}>

            {/* Logo centrado con next/image */}
            <div className={styles.logoWrap}>
              <div className={styles.logoImgWrap}>
                <Image
                  src="/logo.png"
                  alt="MedyLink"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <h2 className={styles.cardTitle}>
                {mode === "login" ? "Bienvenido de nuevo" : "Crear cuenta"}
              </h2>
              <p className={styles.cardSubtitle}>
                {mode === "login"
                  ? "Ingresa tu SAP ID y contraseña"
                  : "Completa los datos para registrarte"}
              </p>
            </div>

            {/* Tabs */}
            <div className={styles.formTabs}>
              <button
                className={`${styles.formTab} ${mode === "login" ? styles.formTabActive : ""}`}
                onClick={() => switchMode("login")}
              >
                Iniciar sesión
              </button>
              <button
                className={`${styles.formTab} ${mode === "register" ? styles.formTabActive : ""}`}
                onClick={() => switchMode("register")}
              >
                Registrarse
              </button>
            </div>

            {/* Formulario animado */}
            <div key={animKey} className={animClass}>

              {/* ── LOGIN ─────────────────────────────────────────── */}
              {mode === "login" && (
                <form onSubmit={handleLogin} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>SAP ID</label>
                    <input
                      type="text"
                      placeholder="Ej. 10000000"
                      className={styles.formControl}
                      value={idsap}
                      onChange={(e) => setIdsap(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contraseña</label>
                    <div className={styles.inputWrap}>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        className={styles.formControl}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" className={styles.togglePassword}
                        onClick={() => setShowPass(v => !v)}>
                        {showPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className={styles.errorBox}>⚠️ {error}</div>
                  )}
                  <button type="submit" disabled={loading} className={styles.btnSubmit}>
                    {loading
                      ? <span className={styles.spinnerWrap}><span className={styles.spinner} /> Validando...</span>
                      : "Ingresar"}
                  </button>
                </form>
              )}

              {/* ── REGISTRO ──────────────────────────────────────── */}
              {mode === "register" && (
                <form onSubmit={handleRegister} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Número SAP</label>
                    <input
                      type="text"
                      placeholder="Ej. 10000000"
                      className={styles.formControl}
                      value={idsap}
                      onChange={(e) => setIdsap(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contraseña</label>
                    <div className={styles.inputWrap}>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        className={styles.formControl}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" className={styles.togglePassword}
                        onClick={() => setShowPass(v => !v)}>
                        {showPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirmar contraseña</label>
                    <div className={styles.inputWrap}>
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repite la contraseña"
                        className={styles.formControl}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button type="button" className={styles.togglePassword}
                        onClick={() => setShowConfirm(v => !v)}>
                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  {error   && <div className={styles.errorBox}>⚠️ {error}</div>}
                  {success && <div className={styles.successBox}>✅ {success}</div>}
                  <button type="submit" disabled={loading} className={styles.btnSubmit}>
                    {loading
                      ? <span className={styles.spinnerWrap}><span className={styles.spinner} /> Registrando...</span>
                      : "Crear cuenta"}
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>

      </div>
    </>
  );
}