import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FaClock, FaUserShield, FaUserMd, FaUserNurse, FaUserInjured, FaSignOutAlt, FaClinicMedical, FaUserCog, FaBars, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const { userName, role, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const links = [
    //{ href: '/', label: 'Inicio', icon: <FaHome />, roles: ['paciente', 'enfermeria', 'doctor', 'admin'] },
    { href: '/paciente', label: 'Paciente', icon: <FaUserInjured />, roles: ['paciente', 'admin'] },
    { href: '/enfermeria', label: 'Enfermería', icon: <FaUserNurse />, roles: ['enfermeria', 'admin'] },
    { href: '/doctor', label: 'Doctor', icon: <FaUserMd />, roles: ['doctor', 'admin'] },
    { href: '/turno', label: 'Turno', icon: <FaClock />, roles: ['turno', 'admin'] },
    { href: '/supervisor', label: 'Supervisor', icon: <FaUserShield />, roles: ['supervisor', 'admin'] },
    { href: '/admin/control', label: 'Admin', icon: <FaUserCog />, roles: ['admin'] },
  ];

const handleLogout = async () => {
  setIsLoggingOut(true);  // Paso 1: Indicar que comienza el logout
  try {
    await logout();       // Paso 2: Ejecutar la acción de logout
    router.replace('/');  // Paso 3: Redirigir al login
  } finally {
    setIsLoggingOut(false); // Paso 4: Limpiar el estado (ocurra o no error)
  }
};

  return (
    <>
      <nav className="navbar">
        <div className="navbar-header">
          <div className="brand">
            {/* eslint-disable @next/next/no-img-element */}
            <img src="/logo_1.png" alt="MedyLink Logo" className="brand-logo" loading="eager"  // Carga inmediata
    decoding="sync" />
          </div>
          <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
            <FaBars />
          </button>
        </div>
        <ul className="navbar-links">
          {links
            .filter(link => link.roles.includes(role))
            .map((link, index) => (
              <li key={index}>
                <Link href={link.href}>
                  {link.icon} <span className="navbar-label">{link.label}</span>
                </Link>
              </li>
            ))}
        </ul>
        <div className="navbar-user">
          <div className="user-info">
            <span>{userName}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span className="navbar-label">Salir</span>
          </button>
        </div>
      </nav>

      {/* --- Menú móvil --- */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <FaTimes />
          </button>
          <ul>
            {links
              .filter(link => link.roles.includes(role))
              .map((link, index) => (
                <li key={index}>
                  <Link href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                    {link.icon} {link.label}
                  </Link>
                </li>
              ))}
          </ul>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Salir
          </button>
        </div>
      )}
    </>
  );
}
