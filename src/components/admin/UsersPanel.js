  import { useEffect, useState } from 'react';
  import Modal from 'react-modal';

  Modal.setAppElement('#__next'); // o '#root' dependiendo de tu estructura

  export default function PanelUsuarios() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
      email: '',
      password: '',
      role: 'paciente',
      idsap: '',
    });

    useEffect(() =>{
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/listarUsers');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Error cargando usuarios:', err);
      }
    };
    fetchUsers();
  },[]);

    const handleUpdateUser = async (id, { role, status }) => {
      try {
        const response = await fetch(`/api/admin/actualizarUser/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, status }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error desconocido');
        alert('Usuario actualizado correctamente');

        setUsers(prev =>
          prev.map(user => (user.id === id ? { ...user, role, status } : user))
        );
      } catch (error) {
        alert('Error: ' + error.message);
      }
    };

    const handleDeleteUser = async (id) => {
      const confirmation = confirm("¿Estás seguro de que deseas eliminar este usuario?");
      if (!confirmation) return;

      try {
        const res = await fetch(`/api/admin/eliminarUser?id=${id}`, { method: 'DELETE' });

        if (!res.ok) {
          const error = await res.json();
          alert('Error al eliminar usuario: ' + error.error);
          return;
        }

        setUsers(users.filter(user => user.id !== id));
        alert('Usuario eliminado correctamente');
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        alert('Error al eliminar usuario');
      }
    };

    const handleCreateUser = async () => {
      try {
        const response = await fetch('/api/admin/crearUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error desconocido');

        alert('Usuario creado correctamente');
        setShowModal(false);
        resetNewUserForm(); // Limpiar el formulario
        
        const res = await fetch('/api/admin/listarUsers');
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    };

    const resetNewUserForm = () => {
      setNewUser({
        email: '',
        password: '',
        role: 'paciente',
        idsap: ''
      });
    };

    return (
      <div className="admin-users">
        <button className="admin-add-btn" onClick={() => setShowModal(true)}>+ Agregar Usuario</button>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>ID SAP</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr 
                key={user.id} 
                onClick={() => setSelectedUser(user)} 
                style={{ cursor: 'pointer' }}
                className="admin-clickable-row"
                >
                <td>{user.nombre}</td>
                <td>{user.idsap}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
              <div className="medl-add-form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="medl-add-form-control"
                  placeholder="usuario@ejemplo.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="medl-add-form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  className="medl-add-form-control"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div className="medl-add-form-group">
                <label htmlFor="idsap">ID SAP</label>
                <input
                  id="idsap"
                  type="text"
                  className="medl-add-form-control"
                  placeholder="123456"
                  value={newUser.idsap}
                  onChange={(e) => setNewUser({ ...newUser, idsap: e.target.value })}
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
                  <option value="doctor">Doctor</option>
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
                <p><strong>Nombre:</strong> {selectedUser.nombre}</p>
                <p><strong>ID SAP:</strong> {selectedUser.idsap}</p>

                <div className="medl-form-group">
                  <label>Rol</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  >
                    <option value="paciente">Paciente</option>
                    <option value="enfermeria">Enfermería</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Administrador</option>
                    <option value="turno">Administrador</option>
                  </select>
                </div>

                <div className="medl-form-group">
                  <div className="medl-checkbox-container">
                    <input
                      type="checkbox"
                      id="userStatus"
                      checked={selectedUser.status}
                      onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.checked })}
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