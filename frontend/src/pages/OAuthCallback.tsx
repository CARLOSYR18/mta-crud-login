import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const access = params.get('access');
    const refresh = params.get('refresh');

    if (!access || !refresh) {
      navigate('/login?oauthError=1', { replace: true });
      return;
    }

    loginWithTokens(access, refresh)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => navigate('/login?oauthError=1', { replace: true }));
  }, [params, navigate, loginWithTokens]);

  return (
    <div className="auth-scene">
      <div className="auth-scene__bg" aria-hidden="true">
        <span className="auth-scene__grid" />
      </div>
      <p style={{ color: '#fff', position: 'relative', zIndex: 1 }}>Iniciando sesión…</p>
    </div>
  );
}