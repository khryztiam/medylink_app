import { useEffect, useState } from "react";
import { FaUserClock } from "react-icons/fa";

export default function UsuariosRecientes({ onUserSelect }) {
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Consideraremos "recientes" los registrados en los últimos 7 días
  const fetchRecentUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users/recent');
      const data = await res.json();
      setRecentUsers(data.users || []);
    } catch (error) {
      console.error("Error cargando usuarios recientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentUsers();
  }, []);

  return (
    <div className="recent-users-panel">
      <h3>
        <FaUserClock /> Usuarios Recientes ({recentUsers.length})
      </h3>
      
      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <div className="recent-users-list">
          {recentUsers.map(user => (
            <div 
              key={user.id} 
              className={`recent-user-item rol-${user.role}`}
              onClick={() => onUserSelect(user)}
            >
              <span className="user-avatar">{user.nombre.charAt(0)}</span>
              <div className="user-info">
                <strong>{user.nombre || `ID: ${user.idsap}`}</strong>
                <span className="user-meta">
                  {new Date(user.created_at).toLocaleDateString()} • {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}