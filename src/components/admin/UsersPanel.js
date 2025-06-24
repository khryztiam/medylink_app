import { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  FaUserShield,
  FaUserInjured,
  FaUserMd,
  FaUserNurse,
  FaCalendarAlt,
  FaUserCog,
} from "react-icons/fa";

Modal.setAppElement("#__next");

export default function PanelUsuarios() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "paciente",
    idsap: "",
  });
  const [loading, setLoading] = useState(false);

  // Efecto para sincronizar email con ID SAP
  useEffect(() => {
    if (newUser.idsap.trim() !== "") {
      setNewUser((prev) => ({
        ...prev,
        email: `${newUser.idsap.toLowerCase()}@yazaki.com`,
      }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        email: "",
      }));
    }
  }, [newUser.idsap]);

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/users');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || data.error || "Error al cargar usuarios");
        }

        setUsers(data.users || []);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
        alert(`Error al cargar usuarios: ${err.message}`);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Función para actualizar el usuario
  const handleUpdateUser = async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al actualizar usuario");

      alert("Usuario actualizado");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmation = confirm(
      "¿Estás seguro de que deseas eliminar este usuario?"
    );
    if (!confirmation) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");

      alert("Usuario eliminado");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error desconocido");

      alert("Usuario creado correctamente");
      setShowModal(false);
      resetNewUserForm();
      fetchUsers();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const resetNewUserForm = () => {
    setNewUser({
      email: "",
      password: "",
      role: "paciente",
      idsap: "",
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    paciente: <FaUserInjured />,
    medico: <FaUserMd />,
    enfermeria: <FaUserNurse />,
    supervisor: <FaUserShield />,
    turno: <FaCalendarAlt />,
    admin: <FaUserCog />,
  };

  const roleNames = {
    paciente: "Pacientes",
    medico: "Médicos",
    enfermeria: "Enfermería",
    supervisor: "Coordinadores",
    turno: "Turnos",
    admin: "Administradores",
  };

  // Agrupar usuarios por rol
  const usersByRole = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {});

  return (
    <div className="admin-users">
      <div className="admin-controls">
        <button className="ok" onClick={() => setShowModal(true)}>
          + Agregar Usuario
        </button>
      </div>

      {loading ? (
        <div className="loading-indicator">Cargando...</div>
      ) : (
        <div className="users-by-role">
          {Object.entries(usersByRole).map(([role, roleUsers]) => (
            <div key={role} className="role-group">
              <h3 className="role-header">
                {roleIcons[role]} {roleNames[role] || role} ({roleUsers.length})
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Nombre</th>
                    <th>ID SAP</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {roleUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      style={{ cursor: "pointer" }}
                      className={`admin-clickable-row rol-${user.role}`}
                    >
                      <td className={`rol-${user.role}`}>
                        <span className="rol-tag">{roleIcons[user.role]}</span>
                      </td>
                      <td>{user.nombre}</td>
                      <td>{user.idsap}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Agregar Usuario"
        className="medl-add-modal"
        overlayClassName="medl-add-modal-overlay"
        closeTimeoutMS={300}
      >
        <div className="medl-add-modal-header">
          <h2>Agregar Usuario</h2>
        </div>
        <div className="medl-add-modal-content">
          <input type="hidden" value={newUser.email} />

          <div className="medl-add-form-group">
            <label htmlFor="idsap">SAP</label>
            <input
              id="idsap"
              type="text"
              className="medl-add-form-control"
              placeholder="123456"
              value={newUser.idsap}
              onChange={(e) =>
                setNewUser({ ...newUser, idsap: e.target.value })
              }
              required
            />
          </div>

          <div className="medl-add-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="text"
              className="medl-add-form-control"
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
            />
          </div>

          <div className="medl-add-form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              className="medl-add-form-control"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="paciente">Paciente</option>
              <option value="enfermeria">Enfermería</option>
              <option value="medico">Medico</option>
              <option value="supervisor">Coordinador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <div className="medl-add-modal-actions">
          <button
            className="medl-add-btn medl-add-btn-cancel"
            onClick={() => setShowModal(false)}
          >
            Cancelar
          </button>
          <button
            className="medl-add-btn medl-add-btn-submit"
            onClick={handleCreateUser}
          >
            Crear Usuario
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedUser}
        onRequestClose={() => setSelectedUser(null)}
        contentLabel="Editar Usuario"
        className="medl-modal"
        overlayClassName="medl-modal-overlay"
        closeTimeoutMS={300}
      >
        {selectedUser && (
          <div>
            <div className="medl-modal-header">
              <h2>Editar Usuario</h2>
            </div>
            <div className="medl-modal-content">
              <p>
                <strong>Nombre:</strong> {selectedUser.nombre}
              </p>
              <p>
                <strong>ID SAP:</strong> {selectedUser.idsap}
              </p>

              <div className="medl-form-group">
                <label>Rol</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                >
                  <option value="paciente">Paciente</option>
                  <option value="enfermeria">Enfermería</option>
                  <option value="medico">Medico</option>
                  <option value="supervisor">Coordinador</option>
                  <option value="admin">Administrador</option>
                  <option value="turno">Turno</option>
                </select>
              </div>

              <div className="medl-form-group">
                <div className="medl-checkbox-container">
                  <input
                    type="checkbox"
                    id="userStatus"
                    checked={selectedUser.status}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        status: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="userStatus">Estado Activo</label>
                </div>
              </div>
            </div>
            <div className="medl-modal-actions">
              <button
                className="medl-btn medl-btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Cancelar
              </button>
              <button
                className="medl-btn medl-btn-danger"
                onClick={() => {
                  handleDeleteUser(selectedUser.id);
                  setSelectedUser(null);
                }}
              >
                Eliminar
              </button>
              <button
                className="medl-btn medl-btn-primary"
                onClick={() => {
                  handleUpdateUser(selectedUser.id, {
                    role: selectedUser.role,
                    status: selectedUser.status,
                  });
                  setSelectedUser(null);
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}