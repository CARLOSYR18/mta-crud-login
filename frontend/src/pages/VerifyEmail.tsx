import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { verifyEmailRequest } from '../api/auth.api';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const token = params.get('token');

  const handleVerify = () => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace de verificación no es válido.');
      return;
    }
    setStatus('loading');
    verifyEmailRequest(token)
      .then((res) => {
        setStatus('ok');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.response?.data?.message ?? 'No se pudo verificar el correo.');
      });
  };

  return (
    <AuthLayout
      eyebrow="Verificación de cuenta"
      title={
        status === 'ok'
          ? '¡Correo verificado!'
          : status === 'error'
            ? 'No se pudo verificar'
            : 'Confirma tu cuenta'
      }
      subtitle={
        status === 'idle'
          ? 'Presiona el botón para verificar tu correo.'
          : status === 'loading'
            ? 'Esto solo toma un segundo.'
            : message
      }
    >
      <div className="auth-form">
        {status === 'idle' && (
          <button type="button" className="btn-primary" onClick={handleVerify}>
            Verificar mi correo
          </button>
        )}
        {status === 'ok' && (
          <Link to="/login" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Ir a iniciar sesión
          </Link>
        )}
        {status === 'error' && (
          <Link to="/register" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Volver a registrarme
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
