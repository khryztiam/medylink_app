import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CitaForm from "@/components/CitaForm"; // 👈 Asegúrate de que el path esté correcto
import { v4 as uuidv4 } from "uuid";
import { agregarCita, getCitas } from "../lib/citasData";
import { FaUserShield, FaTachometerAlt } from "react-icons/fa";
import EstadoConsulta from "@/components/EstadoConsulta";

const Supervisor = () => {
  const [citasProgramadas, setCitasProgramadas] = useState([]);
  const [cuposTotales] = useState(50); // 👈 Número mockup de cupos diarios
  const [tiempoPromedio, setTiempoPromedio] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // exito / error
  const [cuposProgramados, setCuposProgramados] = useState(0);
  const [cuposEnEspera, setCuposEnEspera] = useState(0);

  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);

  const hoyFin = new Date();
  hoyFin.setHours(23, 59, 59, 999);

  // Nueva función para obtener los cupos ocupados (excluyendo 'pendiente')
  const fetchCuposOcupados = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .in("estado", ["programado", "en espera"]) // Excluye estado 'pendiente'
      .gte("programmer_at", hoyInicio.toISOString())
      .lte("programmer_at", hoyFin.toISOString())
      .order("programmer_at", { ascending: true });

    if (error) {
      console.error("Error al obtener los estados:", error);
      return { programado: [], enEspera: [] }; // Retorna objetos vacíos en caso de error
    }

    // Contar los estados
    const programado = data.filter((cita) => cita.estado === "programado");
    const enEspera = data.filter((cita) => cita.estado === "en espera");

    setCuposProgramados(cuposProgramados);
    setCuposEnEspera(cuposEnEspera);
  };

  // Fetch inicial de citas programadas
  const fetchCitasProgramadas = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .eq("estado", "programado")
      .order("programmer_at", { ascending: true });

    if (error) {
      console.error("Error al obtener citas:", error);
      return;
    }

    setCitasProgramadas(data);
  };

  // Calcular tiempo promedio de atención
  const fetchTiempoPromedio = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("check_in, check_out")
      .eq("estado", "atendido")
      // Filtramos para obtener solo citas atendidas hoy
      .gte("check_in", hoyInicio.toISOString())
      .lte("check_in", hoyFin.toISOString());

    if (error) {
      console.error("Error al calcular tiempo promedio:", error);
      return;
    }

    if (data.length === 0) {
      setTiempoPromedio(null);
      return;
    }

    const tiempos = data
      .filter((cita) => {
        // Aseguramos que ambas fechas existan y sean del mismo día
        if (!cita.check_in || !cita.check_out) return false;

        const inicio = new Date(cita.check_in);
        const fin = new Date(cita.check_out);
        // Verificamos que sean del mismo día
        return inicio.toDateString() === fin.toDateString();
      })
      .map((cita) => {
        const inicio = new Date(cita.check_in);
        const fin = new Date(cita.check_out);
        return (fin - inicio) / 60000; // minutos
      });
    // Si no hay tiempos válidos después del filtrado
    if (tiempos.length === 0) {
      setTiempoPromedio(null);
      return;
    }

    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    setTiempoPromedio(promedio.toFixed(1));
  };

  useEffect(() => {
    fetchCitasProgramadas();
    fetchTiempoPromedio();
    fetchCuposOcupados(); // Trae los cupos ocupados

    const canal = supabase
      .channel("supervisor_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "citas" },
        (payload) => {
          fetchCitasProgramadas();
          fetchTiempoPromedio();
          fetchCuposOcupados(); // Actualiza los cupos ocupados en tiempo real
        }
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const handleNuevaCita = async (nombre, motivo, idSAPInt, urgente) => {
    try {
      const nuevaCita = {
        id: uuidv4(),
        nombre,
        motivo,
        idSAP: idSAPInt,
        estado: "pendiente",
        orden_llegada: null,
        emergency: urgente,
      };

      await agregarCita(nuevaCita);

      // Mensaje de éxito
      setTipoMensaje("exito");
      setMensaje("✅ Cita creada exitosamente.");
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

  return (
    <div className="main-content">
      <div className="title-bar">
        <h1 className="supervisor-title">
          <FaUserShield className="title-icon" />
          Coordinador
          <span className="title-extra">
            <FaTachometerAlt className="extra-icon" />
            Panel de Gestión de Linea
          </span>
        </h1>
      </div>
      <div className="content-wrapper">
        <div className="main">
          <div className="supervisor-container">
            <div className="panels-container">
              {/* Panel principal */}
              <div className="panel-main">
                <h2 className="panel-title">Resumen de Citas</h2>

                {/* Lista de citas programadas */}
                <div className="panel-content">
                  {citasProgramadas.length > 0 ? (
                    <ul className="citas-list">
                      {citasProgramadas.map((cita) => (
                        <li key={cita.id}>
                          <strong>{cita.nombre}</strong> -{" "}
                          {new Date(cita.programmer_at).toLocaleString(
                            "es-MX",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay citas programadas actualmente.</p>
                  )}
                </div>
              </div>

              {/* Panel secundario */}
            </div>
          </div>
        </div>
        <div className="sidebar">
          <div className="summary-cards">
            {/* Programados */}
            <div className="summary-card">
              <span className="summary-icon">📅</span>
              <div className="divider" />
              <h3>Programaciones</h3>
              <p>{cuposProgramados}</p>
            </div>
            {/* En espera */}
            <div className="summary-card">
              <span className="summary-icon">⏳</span>
              <div className="divider" />
              <h3>En espera</h3>
              <p>{cuposEnEspera}</p>
            </div>

            {/* Tiempo Promedio */}
            <div className="summary-card">
              <span className="summary-icon">⏱️</span>
              <div className="divider" />
              <h3>Tiempo Promedio</h3>
              <p>{tiempoPromedio ? `${tiempoPromedio} min` : "N/A"}</p>
            </div>
          </div>
          <div className="panel-side">
            <div className="panel-content">
              <CitaForm onSubmit={handleNuevaCita} />
              {mensaje && (
                <div className={`mensaje-alerta ${tipoMensaje}`}>{mensaje}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supervisor;
