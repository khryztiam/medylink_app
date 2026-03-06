// src/components/Sidebar.jsx
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  FaUserInjured, FaUserNurse, FaUserMd,
  FaUserShield, FaUserCog, FaSignOutAlt, FaTimes,
} from 'react-icons/fa';
import styles from '@/styles/Sidebar.module.css';

const ROLE_COLOR = {
  admin:      '#3f91e8',
  supervisor: '#f59e0b',
  medico:     '#22c55e',
  enfermeria: '#a855f7',
  paciente:   '#06b6d4',
};

const ICONS = {
  paciente:   <FaUserInjured />,
  enfermeria: <FaUserNurse />,
  medico:     <FaUserMd />,
  supervisor: <FaUserShield />,
  admin:      <FaUserCog />,
};

const NAV_BY_ROLE = {
  admin: [
    {
      label: 'Administración',
      links: [{ href: '/admin/control', icon: 'admin', label: 'Admin' }],
    },
    {
      label: 'Operaciones',
      links: [
        { href: '/paciente',   icon: 'paciente',   label: 'Paciente'    },
        { href: '/enfermeria', icon: 'enfermeria', label: 'Enfermería'  },
        { href: '/medico',     icon: 'medico',     label: 'Médico'      },
        { href: '/supervisor', icon: 'supervisor', label: 'Coordinador' },
      ],
    },
  ],
  supervisor: [
    { label: 'Supervisión', links: [{ href: '/supervisor', icon: 'supervisor', label: 'Coordinador' }] },
  ],
  medico: [
    { label: 'Mi área', links: [{ href: '/medico', icon: 'medico', label: 'Médico' }] },
  ],
  enfermeria: [
    { label: 'Mi área', links: [{ href: '/enfermeria', icon: 'enfermeria', label: 'Enfermería' }] },
  ],
  paciente: [
    { label: 'Mi área', links: [{ href: '/paciente', icon: 'paciente', label: 'Paciente' }] },
  ],
};

const HIDDEN_ROUTES = ['/', '/login', '/register', '/turno'];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, role, userName, user } = useAuth();
  const router = useRouter();

  if (HIDDEN_ROUTES.includes(router.pathname)) return null;

  const sections    = NAV_BY_ROLE[role] || [];
  const roleColor   = ROLE_COLOR[role]  || '#3f91e8';
  const displayName = userName || user?.email || 'Usuario';

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace('/');
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        aria-label="Navegación principal"
      >
        {/* ── Brand ─────────────────────────────────────────────────── */}
        <div className={styles.brand}>
          <div className={styles.brandInner}>
            <div className={styles.logoMark}>
              <Image
                src="/logo_1.png"
                alt="MedyLink"
                width={100}
                height={40}
                style={{ objectFit: 'contain', maxHeight: '54px', width: 'auto' }}
                priority
              />
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">
            <FaTimes size={18} />
          </button>
        </div>

        {/* ── Navegación ────────────────────────────────────────────── */}
        <nav className={styles.nav}>
          {sections.map((section, idx) => (
            <div key={idx} className={styles.section}>
              <p className={styles.sectionLabel}>{section.label}</p>
              {section.links.map(({ href, icon, label }) => {
                const isActive = router.pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    style={{ '--role-color': roleColor }}
                  >
                    <span className={styles.navIcon}>{ICONS[icon]}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Footer: nombre + rol + logout ─────────────────────────── */}
        <div className={styles.footer}>

          {/* Nombre completo — wrappea si es muy largo */}
          <p className={styles.userName}>{displayName}</p>

          {/* Badge de rol */}
          <div
            className={styles.roleBadge}
            style={{ background: `${roleColor}22`, borderColor: `${roleColor}55` }}
          >
            <span className={styles.roleDot} style={{ background: roleColor }} />
            <span className={styles.roleLabel} style={{ color: roleColor }}>
              {role?.toUpperCase()}
            </span>
          </div>

          {/* Botón logout */}
          <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Cerrar sesión">
            <FaSignOutAlt size={14} />
            <span>Cerrar sesión</span>
          </button>

        </div>
      </aside>
    </>
  );
}