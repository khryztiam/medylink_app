// components/MedicoActivo.jsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "@/styles/MedicoActivo.module.css";

export default function MedicoActivo() {
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const fetchEstado = async () => {
      const { data } = await supabase
        .from("estado_consultorio")
        .select("medico_activo")
        .single();
      setActivo(data?.medico_activo || false);
    };

    fetchEstado();

    const channel = supabase
      .channel("estado-medico-flotante")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "estado_consultorio",
      }, (payload) => {
        setActivo(payload.new.medico_activo);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const toggleEstado = async () => {
    const { error } = await supabase
      .from("estado_consultorio")
      .update({ medico_activo: !activo })
      .eq("id", 1);
    if (error) console.error("Error al actualizar estado:", error);
  };

  return (
    <div className={styles.floating}>
      <button
        onClick={toggleEstado}
        className={`${styles.btn} ${activo ? styles.btnActivo : styles.btnInactivo}`}
        aria-label={activo ? "Desactivar consultas" : "Activar consultas"}
      >
        {activo && <span className={styles.pulse} />}
        <span className={styles.icon}>{activo ? "🩺" : "🚫"}</span>
        <span>{activo ? "Consulta ACTIVA" : "Consulta INACTIVA"}</span>
      </button>
    </div>
  );
}