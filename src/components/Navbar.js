import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  FaClock,
  FaUserShield,
  FaUserMd,
  FaUserNurse,
  FaUserInjured,
  FaSignOutAlt,
  FaClinicMedical,
  FaUserCog,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const { userName, role, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const links = [
    //{ href: '/', label: 'Inicio', icon: <FaHome />, roles: ['paciente', 'enfermeria', 'doctor', 'admin'] },
    {
      href: "/paciente",
      label: "Paciente",
      icon: <FaUserInjured />,
      roles: ["paciente", "admin"],
    },
    {
      href: "/enfermeria",
      label: "Enfermería",
      icon: <FaUserNurse />,
      roles: ["enfermeria", "admin"],
    },
    {
      href: "/medico",
      label: "Medico",
      icon: <FaUserMd />,
      roles: ["medico", "admin"],
    },
    //{ href: '/turno', label: 'Turno', icon: <FaClock />, roles: ['turno', 'admin'] },
    {
      href: "/supervisor",
      label: "Coordinador",
      icon: <FaUserShield />,
      roles: ["supervisor", "admin"],
    },
    {
      href: "/admin/control",
      label: "Admin",
      icon: <FaUserCog />,
      roles: ["admin"],
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true); // Paso 1: Indicar que comienza el logout
    try {
      await logout(); // Paso 2: Ejecutar la acción de logout
      router.replace("/"); // Paso 3: Redirigir al login
    } finally {
      setIsLoggingOut(false); // Paso 4: Limpiar el estado (ocurra o no error)
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".user-dropdown")) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-header">
          <div className="brand">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              src="/logo_1.png"
              alt="MedyLink Logo"
              className="brand-logo"
              loading="eager" // Carga inmediata
              decoding="sync"
            />
          </div>
          <button
            className="hamburger"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <FaBars />
          </button>
        </div>
        <ul className="navbar-links">
          {links
            .filter((link) => link.roles.includes(role))
            .map((link, index) => (
              <li key={index}>
                <Link href={link.href} className="navbar-link">
                  <span className="navbar-icon">{link.icon}</span>
                  <span className="navbar-label">{link.label}</span>
                </Link>
              </li>
            ))}
        </ul>
        <div className="navbar-user">
          <div className="user-dropdown">
            <button
              className="avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="avatar-circle2">
                {userName.charAt(0).toUpperCase()}
              </span>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-user-info">{userName}</div>
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Salir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- Menú móvil --- */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <button
            className="close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaTimes />
          </button>
          <ul>
            {links
              .filter((link) => link.roles.includes(role))
              .map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
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
