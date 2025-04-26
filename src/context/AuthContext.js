import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [idsap, setIdsap] = useState(null);
  const [status, setStatus] = useState(false);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper: fetch user details from app_users
  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from('app_users')
      .select(`
        idsap,
        role,
        status,
        allowed_users ( nombre )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
    return data;
  };

  // Login returns role and related info for immediate use
  const login = async (email, password) => {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;

    const loggedUser = authData.user;
    setUser(loggedUser);

    // Fetch app-specific user data
    const userData = await fetchUserData(loggedUser.id);
    if (!userData) throw new Error('No se pudieron obtener datos del usuario');

    // If user is not active, log out and throw
    if (!userData.status) {
      await supabase.auth.signOut();
      throw new Error('Usuario inactivo');
    }

    // Update state
    setUserName(userData.allowed_users.nombre);
    setRole(userData.role);
    setIdsap(userData.idsap);
    setStatus(userData.status);

    // Return role and name for immediate login logic
    return { role: userData.role, userName: userData.allowed_users.nombre };
  };

  // Logout clears state
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserName('');
    setRole('');
    setIdsap(null);
    setStatus(false);
  };

  // Initial session check
  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const userData = await fetchUserData(session.user.id);
        if (userData && userData.status) {
          setUserName(userData.allowed_users.nombre);
          setRole(userData.role);
          setIdsap(userData.idsap);
          setStatus(userData.status);
        } else if (userData && !userData.status) {
          await logout();
        }
      }
      setLoading(false);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        initSession();
      } else {
        // Clear on sign out
        setUser(null);
        setUserName('');
        setRole('');
        setIdsap(null);
        setStatus(false);
        setLoading(false);
      }
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userName, idsap, status, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
