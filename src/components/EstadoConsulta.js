// components/EstadoConsulta.jsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "@/styles/EstadoConsulta.module.css";

export default function EstadoConsulta() {
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    // Carga inicial
    const fetchEstado = async () => {
      const { data } = await supabase
        .from("estado_consultorio")
        .select("medico_activo")
        .single();
      if (data) setActivo(data.medico_activo);
    };

    fetchEstado();

    // Realtime — solo escucha el registro id=1
    const channel = supabase
      .channel("estado-consultorio-global")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "estado_consultorio",
        filter: "id=eq.1",
      }, (payload) => {
        setActivo(payload.new.medico_activo);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className={`${styles.estadoBox} ${activo ? styles.activo : styles.inactivo}`}>
      <span className={`${styles.dot} ${activo ? styles.dotActivo : styles.dotInactivo}`} />
      <span className={styles.texto}>
        {activo ? "En consultorio" : "No disponible"}
      </span>
    </div>
  );
}