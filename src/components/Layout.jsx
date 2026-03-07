// src/components/Layout.jsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import {
  FaBars,
  FaUserInjured, FaUserNurse, FaUserMd,
  FaUserShield, FaUserCog,
  FaCalendarAlt, FaTachometerAlt,
} from 'react-icons/fa';
import styles from '@/styles/Layout.module.css';

// ─── Metadata + color POR RUTA ────────────────────────────────────────────────
// Cada ruta define su propio gradiente, ícono, título y pill.
// El rol NO influye en el color — todos ven el mismo header por página.
const ROUTE_META = {
  '/paciente': {
    gradient:   'linear-gradient(90deg, #3f91e8 0%, #74bff8 55%, #a8d8f8 100%)',
    shadow:     'rgba(63, 145, 232, 0.30)',
    icon:       <FaUserInjured />,
    title:      'Paciente',
    subtitle:   'Mis citas y estado de salud',
    panelIcon:  <FaCalendarAlt />,
    panelLabel: 'Panel de Usuario',
  },
  '/enfermeria': {
    gradient:   'linear-gradient(90deg, #9333ea 0%, #c084fc 55%, #e9d5ff 100%)',
    shadow:     'rgba(147, 51, 234, 0.28)',
    icon:       <FaUserNurse />,
    title:      'Enfermería',
    subtitle:   'Registro y seguimiento de pacientes',
    panelIcon:  <FaCalendarAlt />,
    panelLabel: 'Panel de Gestión de Citas',
  },
  '/medico': {
    gradient:   'linear-gradient(90deg, #16a34a 0%, #4ade80 55%, #bbf7d0 100%)',
    shadow:     'rgba(22, 163, 74, 0.28)',
    icon:       <FaUserMd />,
    title:      'Médico',
    subtitle:   'Consultas y atención clínica',
    panelIcon:  <FaCalendarAlt />,
    panelLabel: 'Panel de Gestión de Consultas',
  },
  '/supervisor': {
    gradient:   'linear-gradient(90deg, #ea580c 0%, #fb923c 55%, #fed7aa 100%)',
    shadow:     'rgba(234, 88, 12, 0.28)',
    icon:       <FaUserShield />,
    title:      'Coordinador',
    subtitle:   'Supervisión y gestión de turnos',
    panelIcon:  <FaTachometerAlt />,
    panelLabel: 'Panel de Gestión de Linea',
  },
  '/admin/control': {
    gradient:   'linear-gradient(90deg, #4f46e5 0%, #818cf8 55%, #c7d2fe 100%)',
    shadow:     'rgba(79, 70, 229, 0.28)',
    icon:       <FaUserCog />,
    title:      'Administrador',
    subtitle:   'Gestión general del sistema',
    panelIcon:  <FaTachometerAlt />,
    panelLabel: 'Panel de Control',
  },
};

// Fallback si la ruta no está mapeada
const DEFAULT_META = {
  gradient:   'linear-gradient(90deg, #3f91e8 0%, #74bff8 100%)',
  shadow:     'rgba(63, 145, 232, 0.25)',
  icon:       <FaUserCog />,
  title:      'MedyLink',
  subtitle:   '',
  panelIcon:  <FaTachometerAlt />,
  panelLabel: 'Panel',
};

// Rutas sin layout
const HIDDEN_ROUTES = ['/', '/login', '/turno'];

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const { userName, user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (HIDDEN_ROUTES.includes(router.pathname)) return <>{children}</>;

  // Color y contenido dependen únicamente de la ruta actual
  const meta        = ROUTE_META[router.pathname] || DEFAULT_META;
  const displayName = userName || user?.email     || 'Usuario';
  const initial     = displayName[0].toUpperCase();

  return (
    <div className={styles.wrapper}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={styles.main}>
        {/* ── Page Header ─────────────────────────────────────────── */}
        <header
          className={styles.pageHeader}
          style={{
            background: meta.gradient,
            boxShadow:  `0 2px 10px ${meta.shadow}`,
          }}
        >
          {/* Izquierda: hamburger + ícono + título */}
          <div className={styles.headerLeft}>
            <button
              className={styles.hamburger}
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <FaBars size={18} />
            </button>

            <div className={styles.roleIcon}>
              {meta.icon}
            </div>

            <div className={styles.titleBlock}>
              <h1 className={styles.pageTitle}>{meta.title}</h1>
              {meta.subtitle && (
                <p className={styles.pageSubtitle}>{meta.subtitle}</p>
              )}
            </div>
          </div>

          {/* Derecha: pill del panel */}
          <div className={styles.headerRight}>
            <div className={styles.panelPill}>
              <span className={styles.panelPillIcon}>{meta.panelIcon}</span>
              <span className={styles.panelPillLabel}>{meta.panelLabel}</span>
            </div>
          </div>
        </header>

        {/* ── Contenido ───────────────────────────────────────────── */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}