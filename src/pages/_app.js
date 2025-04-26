// pages/_app.js
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import AuthGate from '@/components/AuthGate';
import UnauthorizedAlert from '@/components/NoAuth';

import '../styles/globals.css';
import '@/styles/navbar.css';
import '@/styles/turno.css';
import '@/styles/doctor.css';
import '@/styles/index.css';
import '@/styles/register.css';
import '@/styles/control.css';
import '@/styles/noauth.css';
import '@/styles/paciente.css'
import '@/styles/enfermeria.css'
import '@/styles/supervisor.css'

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const noNavbarRoutes = ['/', '/register'];
  const hideNavbar = noNavbarRoutes.includes(router.pathname);

  return (
    <AuthProvider>
      <div className="app-container">
        {!hideNavbar && <Navbar />}
        <div className="content">
          <AuthGate>
          <Component {...pageProps} />
          </AuthGate>
        </div>
      </div>
    </AuthProvider>
  );
}
