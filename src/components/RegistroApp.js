// components/RegistroApp.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "@/styles/Login.module.css";

export default function RegistroApp() {
  const router = useRouter();

  const [idsap,               setIdsap]               = useState("");
  const [email,               setEmail]               = useState("");
  const [password,            setPassword]            = useState("");
  const [confirmPassword,     setConfirmPassword]     = useState("");
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState("");

  // Generar email automáticamente desde idsap
  useEffect(() => {
    setEmail(idsap.trim() ? `${idsap.toLowerCase().trim()}@yazaki.com` : "");
  }, [idsap]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden.");

      // Verificar si el ID SAP ya está registrado
      const { data: existingUser } = await supabase
        .from("app_users").select("idsap").eq("idsap", idsap).maybeSingle();
      if (existingUser) throw new Error("Ya existe un usuario con ese ID SAP.");

      // Registro en Supabase Auth
      const { data: userData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        if (signUpError.message.includes("invalid email")) throw new Error("El correo no es válido.");
        throw signUpError;
      }

      // Insertar en app_users
      const { error: insertError } = await supabase.from("app_users").insert([{
        id: userData.user.id,
        idsap,
        role: "paciente",
        status: false,
      }]);
      if (insertError) throw insertError;

      // Activar si está en allowed_users
      const { data: allowed } = await supabase
        .from("allowed_users").select("idsap").eq("idsap", idsap).single();
      if (allowed) {
        await supabase.from("app_users").update({ status: true }).eq("id", userData.user.id);
      }

      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bodyBg}>
      <div className={styles.card}>

        {/* Cabecera */}
        <div className={styles.logoWrap}>
          <img src="/logo.png" alt="MedyLink" className={styles.logo} />
          <h2 className={styles.cardTitle}>Crear cuenta</h2>
          <p className={styles.cardSubtitle}>Ingresa tu ID SAP para registrarte</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleRegister} className={styles.form}>

          {/* SAP */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Número SAP</label>
            <input
              type="text"
              placeholder="Ej. 10000000"
              value={idsap}
              onChange={(e) => setIdsap(e.target.value)}
              className={styles.formControl}
              required
            />
          </div>

          {/* Contraseña */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Contraseña</label>
            <div className={styles.inputWrap}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formControl}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Confirmar contraseña</label>
            <div className={styles.inputWrap}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.formControl}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Error */}
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
            disabled={loading}
            className={styles.btnSubmit}
          >
            {loading ? (
              <span className={styles.spinnerWrap}>
                <span className={styles.spinner} />
                <span className={styles.spinnerText}>Registrando...</span>
              </span>
            ) : "Crear cuenta"}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.cardFooter}>
          <p>¿Ya tienes una cuenta?</p>
          <Link href="/" className={styles.footerLink}>
            Inicia sesión aquí →
          </Link>
        </div>

      </div>
    </div>
  );
}