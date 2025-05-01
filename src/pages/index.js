import Link from 'next/link';
import { FaUserShield, FaUserInjured, FaUserMd, FaUserNurse, FaCalendarAlt, FaUserCog } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import Image from 'next/image';

Modal.setAppElement('#__next');  // Es correcto.

export default function MenuPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { login, user, role, status, loading } = useAuth();
  const router = useRouter();
  const [idsapInput, setIdsapInput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openLoginModal = (role) => {
    setSelectedRole(role);
    setIsLoginModalOpen(true);
  };
  
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Realizamos el login
      await login(userInput, passwordInput);
  
      // Validación del rol (evitar la alerta)
      if (role === selectedRole || (selectedRole === 'admin' && role === 'admin')) {
        // Redirección basada en el rol
        const redirectPath = role === 'admin' ? '/admin/control' : `/${role}`;
        router.push(redirectPath);
      } else {
        // Si no se tiene el rol, no mostrar alerta, solo no hacer la redirección
        console.warn('No tienes permisos para acceder como ' + selectedRole);
      }
    } catch (error) {
      alert('Error de login: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const menuItems = [
    {
      title: 'Paciente',
      icon: <FaUserInjured size={48} className="text-teal-600" />,
      description: 'Solicitud de consulta',
      role: 'paciente'
    },
    {
      title: 'Medico',
      icon: <FaUserMd size={48} className="text-blue-600" />,
      description: 'Panel médico',
      role: 'medico'
    },
    {
      title: 'Enfermería',
      icon: <FaUserNurse size={48} className="text-green-600" />,
      description: 'Control de solicitudes',
      role: 'enfermeria'
    },
    {
      title: 'Supervisor',
      icon: <FaUserShield size={48} className="text-purple-600" />,
      description: 'Area de Produccion',
      role: 'supervisor'
    },
    {
      title: 'Turno',
      icon: <FaCalendarAlt size={48} className="text-purple-600" />,
      description: 'Visor de turnos',
      role: 'turno'
    },
    {
      title: 'Administrador',
      icon: <FaUserCog size={48} className="text-purple-600" />,
      description: 'Control de la app',
      role: 'admin'
    }

  ];

  return (
    <>
      <Head>
        <title>MedyLink</title>
      </Head>
      
      <div className="index-wrapper">
        {/* Panel Izquierdo: Imagen */}
        <div className="index-image-panel">
        {/* eslint-disable @next/next/no-img-element */}
          <img src="/logo.png" alt="desktop" className='logod' loading='eager' decoding='sync'/>
          <img src="/logo_1.png" alt="mobile" className='logob' loading='eager' decoding='sync'/>
        </div>

        {/* Panel Derecho: Opciones de menú */}
        <div className="index-menu-panel">
          <header className='index-header'>
            <p>Seleccione su perfil de acceso</p>
          </header>
          <div className="index-card-container">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              onClick={() => openLoginModal(item.role)}
              className="index-card-material"
            >
              <div className="index-icon-wrapper">
                {item.icon}
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          ))}
          </div>
        </div>

        {/* Modal de Login */}
        <Modal
          isOpen={isLoginModalOpen}
          onRequestClose={closeLoginModal}
          contentLabel="Login Modal"
          className="login-modal"
          overlayClassName="login-modal-overlay"
          closeTimeoutMS={300}
        >
          <div>
            <div className='login-modal-header'>
            <h2>
              Acceso {selectedRole ? `como ${selectedRole}` : ''}
            </h2>
            </div>
            <form onSubmit={handleLogin} className='login-modal-content'>

              <div className="login-form-group">
              <label htmlFor="email">Email</label>
                <input
                  type="text"
                  placeholder="Usuario"                  
                  onChange={(e) => setUserInput(e.target.value)}
                  className='login-form-control'
                  required
                />
              </div>
              <div className="login-form-group">
              <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  className='login-form-control'     
                  required
                />
              </div>
              <div className="login-modal-actions">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className='login-btn login-btn-submit'
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className='login-btn login-btn-cancel'
                >
                  Cancelar
                </button>
              </div>
              <div className="modal-footer">
                <p>¿No tienes cuenta?</p>
                <Link 
                  href="/register" 
                  className="modal-footer-link"
                  onClick={closeLoginModal}
                >
                  Regístrate aquí
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
}
