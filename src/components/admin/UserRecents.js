// components/admin/UserRecents.jsx
import { useEffect, useState } from "react";
import { FaUserClock } from "react-icons/fa";
import styles from "@/styles/Admin.module.css";

export default function UsuariosRecientes({ onUserSelect }) {
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setLoading(true);
        const res  = await fetch("/api/admin/users/recent");
        const data = await res.json();
        setRecentUsers(data.users || []);
      } catch (err) {
        console.error("Error cargando usuarios recientes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentUsers();
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <FaUserClock className={styles.cardTitleIcon} />
          Usuarios Recientes ({recentUsers.length})
        </h3>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : recentUsers.length === 0 ? (
        <div className={styles.emptyRecent}>Sin actividad reciente</div>
      ) : (
        <div className={styles.recentList}>
          {recentUsers.map((u) => (
            <div
              key={u.id}
              className={styles.recentItem}
              onClick={() => onUserSelect?.(u)}
            >
              <div className={styles.recentAvatar}>
                {(u.nombre || u.idsap?.toString() || "?")[0].toUpperCase()}
              </div>
              <div className={styles.recentInfo}>
                <span className={styles.recentName}>
                  {u.nombre || `ID: ${u.idsap}`}
                </span>
                <span className={styles.recentMeta}>
                  {new Date(u.created_at).toLocaleDateString("es-SV")} · {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}