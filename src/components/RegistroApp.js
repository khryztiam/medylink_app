import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Modal from 'react-modal';
import Link from 'next/link';

Modal.setAppElement('#__next');

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idsap, setIdsap] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      // Validar si el ID SAP ya está registrado
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('*')
        .eq('idsap', idsap)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Ya existe un usuario con ese ID SAP.');
      }

      // Registro en Supabase Auth
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        if (signUpError.message.includes('invalid email')) {
          throw new Error('El correo no es válido.');
        }
        throw signUpError;
      }

      // Insertar en app_users
      const { error: insertError } = await supabase.from('app_users').insert([
        {
          id: userData.user.id,
          idsap,
          role: 'paciente',
          status: false,
        }
      ]);

      if (insertError) {
        throw insertError;
      }

      // Verificar si el idsap está permitido
      const { data: allowedUser, error: allowedUserError } = await supabase
        .from('allowed_users')
        .select('*')
        .eq('idsap', idsap)
        .single();

      if (allowedUserError && allowedUserError.code !== 'PGRST116') {
        throw allowedUserError;
      }

      if (allowedUser) {
        await supabase
          .from('app_users')
          .update({ status: true })
          .eq('id', userData.user.id);
      }

      // Redirigir al login
      router.push('/');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError(error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className='login-modal-header'>
        <h2>Registro de Usuario</h2>
      </div> 
      <form onSubmit={handleRegister} className='login-modal-content'>
        <div className="material-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email' 
            className='login-form-control'
            required
          />
        </div>

        <div className="material-group">
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Contraseña'
            required
          />
        </div>

        <div className="material-group">
          <input
            type="text"
            value={idsap}
            onChange={(e) => setIdsap(e.target.value)}
            placeholder='SAP'
            required
          />
        </div>

        {error && (
          <div className="text-red-600 font-semibold my-2">
            {error}
          </div>
        )}

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </div>

        <div className="mt-4">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/" className="text-blue-600 underline">Inicia sesión aquí</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
