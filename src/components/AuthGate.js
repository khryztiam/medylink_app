// components/AuthGate.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import UnauthorizedAlert from '@/components/NoAuth';

const roleRoutes = {
  paciente: ['/', '/paciente'],
  enfermeria: ['/', '/enfermeria','/turno'],
  medico: ['/', '/medico'],
  turno:['/','/turno'],
  supervisor: ['/', '/supervisor'],
  admin: ['/', '/admin/control', '/paciente', '/enfermeria', '/medico','/turno','/supervisor'],
};

export default function AuthGate({ children }) {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [showAlert, setShowAlert] = useState(false);

  const isLoginPage = router.pathname === '/';
  const openRoutes = ['/', '/register'];
  const isOpenRoute = openRoutes.includes(router.pathname);


  useEffect(() => {
    if (loading) return; // Espera mientras se carga el estado de autenticación
    const allowedRoutes = role ? roleRoutes[role] || [] : [];
    const isOpenRoute = ['/', '/register'].includes(router.pathname);
    // Si no hay usuario y no estamos en una ruta abierta, redirige al login
    if (!user && !isOpenRoute) {
      router.replace('/', undefined, { shallow: true });
      return;
    }

    // Si hay usuario pero estamos en la ruta abierta (login o register), redirige al home del rol
    if (user && (router.pathname === '/' || router.pathname === '/register')) {
      switch (role) {
        case 'paciente':
          router.replace('/paciente');
          break;
        case 'enfermeria':
          router.replace('/enfermeria');
          break;
        case 'medico':
          router.replace('/medico');
          break;
        case 'turno':
            router.replace('/turno');
            break;  
        case 'admin':
          router.replace('/admin/control');
          break;
      }
      return;
    }

    // Si hay usuario pero no tiene acceso a esta ruta, muestra el alert
    if (user && !allowedRoutes.includes(router.pathname) && !isOpenRoute) {
      setShowAlert(true); // Muestra el mensaje de "Acceso Denegado"
    } else {
      setShowAlert(false); // Si está autorizado, no muestra el mensaje
    }
  }, [user, role, loading, router]); // Todas las dependencias
  // Mientras estamos cargando o redirigiendo, no mostramos nada
  if (loading) return null;
  if (!user && !isOpenRoute) return null;
  if (user && (router.pathname === '/' || router.pathname === '/register')) return null;

  return (
    <>
      {showAlert && <UnauthorizedAlert />}
      {!showAlert && children}
    </>
  );
}
