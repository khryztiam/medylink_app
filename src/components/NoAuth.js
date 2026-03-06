// components/NoAuth.jsx
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import styles from "@/styles/NoAuth.module.css";

export default function UnauthorizedAlert() {
  const router = useRouter();
  const { role } = useAuth();

  // Redirige al home del rol actual
  const handleBack = () => {
    const homeByRole = {
      paciente:   "/paciente",
      enfermeria: "/enfermeria",
      medico:     "/medico",
      turno:      "/turno",
      supervisor: "/supervisor",
      admin:      "/admin/control",
    };
    const dest = homeByRole[role] || "/";
    router.replace(dest);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <FaLock style={{ color: "#dc2626" }} />
        </div>
        <h2 className={styles.title}>Acceso denegado</h2>
        <p className={styles.message}>
          No tienes permiso para acceder a esta página.<br />
          Si crees que esto es un error, contacta al administrador.
        </p>
        <button className={styles.btnBack} onClick={handleBack}>
          <FaArrowLeft size={12} />
          Volver a mi inicio
        </button>
      </div>
    </div>
  );
}