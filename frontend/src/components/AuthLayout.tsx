import type { ReactNode } from 'react';
import { Logo } from './Logo';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const FEATURES: { icon: 'shield' | 'users' | 'bolt'; text: string }[] = [
  { icon: 'shield', text: 'Sesiones protegidas con JWT y rotación de refresh tokens' },
  { icon: 'users', text: 'Control de acceso por roles para tu equipo' },
  { icon: 'bolt', text: 'Infraestructura pensada para escalar' },
];

function FeatureIcon({ name }: { name: 'shield' | 'users' | 'bolt' }) {
  if (name === 'shield') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  if (name === 'users') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 19c1-3.2 3.4-4.6 6.5-4.6s5.5 1.4 6.5 4.6" />
        <path d="M16.5 8.6a3 3 0 1 1 0-5.4" />
        <path d="M19 14.6c2 .5 3.3 1.9 4 4.4" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="m13 2-9 12h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" />
    </svg>
  );
}

export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-scene">
      <div className="auth-scene__bg" aria-hidden="true">
        <span className="auth-scene__grid" />
        <span className="blob blob--a" />
        <span className="blob blob--b" />
      </div>

      <div className="auth-card">
        <aside className="auth-card__brand">
          <Logo variant="light" size="md" />

          <div className="auth-card__brand-copy">
            <p className="auth-hero__eyebrow">Plataforma para equipos</p>
            <h2>Conecta a tu equipo con una base sólida.</h2>
            <p className="auth-hero__lead">
              Autenticación, roles y datos de usuario en un solo lugar, listo para crecer con tu producto.
            </p>
          </div>

          <ul className="auth-card__features">
            {FEATURES.map((f, i) => (
              <li key={f.text} style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                <span className="auth-card__feature-icon">
                  <FeatureIcon name={f.icon} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>

          <div className="auth-card__brand-orb" aria-hidden="true">
            <svg viewBox="0 0 320 320" className="rings-orbit">
              <defs>
                <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#4FC3F7" />
                  <stop offset="1" stopColor="#2F6FED" />
                </linearGradient>
              </defs>
              <circle cx="120" cy="120" r="70" stroke="url(#ringGradient)" strokeWidth="2.5" fill="none" opacity="0.9" />
              <circle cx="210" cy="170" r="46" stroke="url(#ringGradient)" strokeWidth="2.5" fill="none" opacity="0.7" />
              <circle cx="90" cy="230" r="30" stroke="url(#ringGradient)" strokeWidth="2.5" fill="none" opacity="0.55" />
            </svg>
          </div>
        </aside>

        <main className="auth-card__form">
          <div className="auth-card__form-inner">
            <div className="auth-panel__brand-mobile">
              <Logo variant="dark" size="sm" />
            </div>
            <p className="auth-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}