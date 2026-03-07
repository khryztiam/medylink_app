// components/admin/UsersPanel.jsx
import { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import {
  FaUserShield, FaUserInjured, FaUserMd,
  FaUserNurse, FaCalendarAlt, FaUserCog, FaPlus, FaKey,
} from "react-icons/fa";
import styles from "@/styles/Admin.module.css";

Modal.setAppElement("#__next");

const ROLE_ICONS = {
  paciente:   <FaUserInjured />,
  medico:     <FaUserMd />,
  enfermeria: <FaUserNurse />,
  supervisor: <FaUserShield />,
  turno:      <FaCalendarAlt />,
  admin:      <FaUserCog />,
};

const ROLE_NAMES = {
  paciente:   "Pacientes",
  medico:     "Médicos",
  enfermeria: "Enfermería",
  supervisor: "Coordinadores",
  turno:      "Turnos",
  admin:      "Administradores",
};

const ROL_TAG_CLASS = {
  paciente:   styles.rolPaciente,
  medico:     styles.rolMedico,
  enfermeria: styles.rolEnfermeria,
  supervisor: styles.rolSupervisor,
  admin:      styles.rolAdmin,
  turno:      styles.rolTurno,
};
const ROL_BADGE_CLASS = {
  paciente:   styles.rolBadgePaciente,
  medico:     styles.rolBadgeMedico,
  enfermeria: styles.rolBadgeEnfermeria,
  supervisor: styles.rolBadgeSupervisor,
  admin:      styles.rolBadgeAdmin,
  turno:      styles.rolBadgeTurno,
};

export default function PanelUsuarios({ externalSelected }) {
  const [users,        setUsers]        = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword,  setNewPassword]  = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [saveMsg,      setSaveMsg]      = useState(null);
  const [newUser,      setNewUser]      = useState({
    email: "", password: "", role: "paciente", idsap: "",
  });

  useEffect(() => {
    setNewUser((prev) => ({
      ...prev,
      email: newUser.idsap.trim()
        ? `${newUser.idsap.toLowerCase()}@yazaki.com`
        : "",
    }));
  }, [newUser.idsap]);

  useEffect(() => {
    if (externalSelected) setSelectedUser(externalSelected);
  }, [externalSelected]);

  const closeEditModal = () => {
    setSelectedUser(null);
    setNewPassword("");
    setSaveMsg(null);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cargar usuarios");
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdateUser = async (id, updates) => {
    try {
      const res  = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      await fetchUsers();
      setSaveMsg({ tipo: "exito", texto: "✅ Usuario actualizado correctamente." });
      setTimeout(() => closeEditModal(), 1400);
    } catch (err) {
      setSaveMsg({ tipo: "error", texto: `❌ ${err.message}` });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("¿Confirmas que deseas eliminar este usuario?")) return;
    try {
      const res  = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      closeEditModal();
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateUser = async () => {
    try {
      const res    = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error desconocido");
      setShowAddModal(false);
      setNewUser({ email: "", password: "", role: "paciente", idsap: "" });
      await fetchUsers();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const passwordValida = newPassword.length === 0 || newPassword.length >= 6;

  const usersByRole = users.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {});

  return (
    <div>
      <div className={styles.controls}>
        <button className={styles.btnAgregar} onClick={() => setShowAddModal(true)}>
          <FaPlus size={12} /> Agregar Usuario
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando usuarios...</div>
      ) : (
        Object.entries(usersByRole).map(([role, roleUsers]) => (
          <div key={role} className={styles.roleGroup}>
            <h3 className={styles.roleHeader}>
              <span className={`${styles.roleHeaderIcon} ${ROL_TAG_CLASS[role] || ""}`}>
                {ROLE_ICONS[role]}
              </span>
              {ROLE_NAMES[role] || role} ({roleUsers.length})
            </h3>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th style={{ width: 52 }}></th>
                  <th>Nombre</th>
                  <th>ID SAP</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {roleUsers.map((u) => (
                  <tr key={u.id} onClick={() => setSelectedUser(u)}>
                    <td>
                      <div className={`${styles.rolTag} ${ROL_TAG_CLASS[u.role] || ""}`}>
                        {ROLE_ICONS[u.role]}
                      </div>
                    </td>
                    <td><span className={styles.userName}>{u.nombre}</span></td>
                    <td>{u.idsap}</td>
                    <td>
                      <span className={`${styles.rolBadge} ${ROL_BADGE_CLASS[u.role] || ""}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* ── Modal Editar ─────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedUser}
        onRequestClose={closeEditModal}
        contentLabel="Editar Usuario"
        className="medl-modal"
        overlayClassName="medl-modal-overlay"
        closeTimeoutMS={250}
      >
        {selectedUser && (
          <>
            <div className="medl-modal-header">
              <div className="medl-modal-icon medl-modal-icon-indigo">✏️</div>
              <h2>Editar Usuario</h2>
            </div>

            <div className="medl-modal-content">
              {/* Info */}
              <div className="medl-info-row">
                <div className="medl-info-item">Nombre: <strong>{selectedUser.nombre}</strong></div>
                <div className="medl-info-item">ID SAP: <strong>{selectedUser.idsap}</strong></div>
              </div>

              {/* Rol */}
              <div className="medl-form-group">
                <label>Rol</label>
                <select
                  className="medl-form-select"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                >
                  <option value="paciente">Paciente</option>
                  <option value="enfermeria">Enfermería</option>
                  <option value="medico">Médico</option>
                  <option value="supervisor">Coordinador</option>
                  <option value="admin">Administrador</option>
                  <option value="turno">Turno</option>
                </select>
              </div>

              {/* Estado */}
              <div className="medl-form-group">
                <div className="medl-checkbox-container">
                  <input
                    type="checkbox"
                    id="userStatus"
                    checked={selectedUser.status || false}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.checked })}
                  />
                  <label htmlFor="userStatus">Estado Activo</label>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div className="medl-form-group">
                <label>
                  <FaKey style={{ marginRight: 6, color: "#6366f1", fontSize: "0.8rem" }} />
                  Nueva contraseña
                  <span style={{ fontSize: "0.73rem", color: "#94a3b8", fontWeight: 400, marginLeft: 6 }}>
                    (dejar vacío para no cambiar)
                  </span>
                </label>
                <input
                  type="password"
                  className="medl-form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <span style={{ fontSize: "0.76rem", color: "#dc2626", marginTop: 4, display: "block" }}>
                    La contraseña debe tener al menos 6 caracteres
                  </span>
                )}
              </div>

              {/* Mensaje resultado */}
              {saveMsg && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: 9,
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  background: saveMsg.tipo === "exito" ? "#dcfce7" : "#fee2e2",
                  color:      saveMsg.tipo === "exito" ? "#16a34a" : "#dc2626",
                  border:     `1px solid ${saveMsg.tipo === "exito" ? "#86efac" : "#fca5a5"}`,
                }}>
                  {saveMsg.texto}
                </div>
              )}
            </div>

            <div className="medl-modal-actions">
              <button className="medl-btn medl-btn-secondary" onClick={closeEditModal}>
                Cancelar
              </button>
              <button className="medl-btn medl-btn-danger" onClick={() => handleDeleteUser(selectedUser.id)}>
                Eliminar
              </button>
              <button
                className="medl-btn medl-btn-primary"
                disabled={!passwordValida}
                onClick={() => handleUpdateUser(selectedUser.id, {
                  role:     selectedUser.role,
                  status:   selectedUser.status,
                  password: newPassword.length >= 6 ? newPassword : undefined,
                })}
              >
                Guardar
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Modal Agregar ─────────────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        contentLabel="Agregar Usuario"
        className="medl-add-modal"
        overlayClassName="medl-modal-overlay"
        closeTimeoutMS={250}
      >
        <div className="medl-add-modal-header">
          <div className="medl-modal-icon medl-modal-icon-green">👤</div>
          <h2>Agregar Usuario</h2>
        </div>
        <div className="medl-add-modal-content">
          <div className="medl-add-form-group">
            <label>SAP</label>
            <input
              type="text"
              className="medl-add-form-control"
              placeholder="Número SAP del trabajador"
              value={newUser.idsap}
              onChange={(e) => setNewUser({ ...newUser, idsap: e.target.value })}
            />
          </div>
          <div className="medl-add-form-group">
            <label>Contraseña</label>
            <input
              type="password"
              className="medl-add-form-control"
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div className="medl-add-form-group">
            <label>Rol</label>
            <select
              className="medl-add-form-control"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="paciente">Paciente</option>
              <option value="enfermeria">Enfermería</option>
              <option value="medico">Médico</option>
              <option value="supervisor">Coordinador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {newUser.email && (
            <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>
              Email generado: <strong>{newUser.email}</strong>
            </p>
          )}
        </div>
        <div className="medl-add-modal-actions">
          <button className="medl-add-btn medl-add-btn-cancel" onClick={() => setShowAddModal(false)}>
            Cancelar
          </button>
          <button className="medl-add-btn medl-add-btn-submit" onClick={handleCreateUser}>
            Crear Usuario
          </button>
        </div>
      </Modal>
    </div>
  );
}