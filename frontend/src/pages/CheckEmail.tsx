import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { resendVerificationRequest } from '../api/auth.api';

export function CheckEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    if (!email) return;
    setSending(true);
    try {
      await resendVerificationRequest(email);
      setResent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Un paso más"
      title="Revisa tu correo"
      subtitle={email ? `Enviamos un enlace de verificación a ${email}.` : 'Enviamos un enlace de verificación a tu correo.'}
    >
      <div className="auth-form">
        <div className="security-note" style={{ justifyContent: 'flex-start' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="m3 6 9 7 9-7" />
          </svg>
          Haz clic en el enlace del correo para activar tu cuenta.
        </div>

        {resent && <p className="form-success">Te enviamos un nuevo enlace de verificación.</p>}

        <button type="button" className="btn-primary" onClick={handleResend} disabled={sending || !email}>
          {sending ? <span className="spinner" /> : 'Reenviar correo de verificación'}
        </button>

        <p className="auth-switch">
          ¿Ya verificaste? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </AuthLayout>
  );
}