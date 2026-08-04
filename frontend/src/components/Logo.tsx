import { useState } from 'react';
import { LOGO_URL, BRAND_NAME, BRAND_SUFFIX } from '../config/branding';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

function FallbackMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logoGradient" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4FC3F7" />
          <stop offset="1" stopColor="#1E4FD8" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="16" r="8.5" stroke="url(#logoGradient)" strokeWidth="4.5" />
      <circle cx="34" cy="16" r="8.5" stroke="url(#logoGradient)" strokeWidth="4.5" />
      <path d="M14 24 L24 40 L34 24" stroke="url(#logoGradient)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Contenedor de tamaño FIJO para la insignia — así, sea la imagen que sea
// (ancha, alta, cuadrada, o incluso una captura de pantalla mal recortada),
// siempre se ve contenida y centrada, nunca deformada ni desbordada.
const BOX_SIZES = { sm: 34, md: 44, lg: 64 };
const TEXT_SIZES = { sm: 16, md: 20, lg: 26 };

export function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const box = BOX_SIZES[size];

  const showImage = Boolean(LOGO_URL) && !imageFailed;

  return (
    <div className={`brand-mark brand-mark--${variant}`}>
      <span className="brand-mark__chip" style={{ width: box, height: box }}>
        {showImage ? (
          <img
            src={LOGO_URL}
            alt={`${BRAND_NAME} ${BRAND_SUFFIX}`}
            onError={() => setImageFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <FallbackMark size={box * 0.62} />
        )}
      </span>
      <span className="brand-mark__text" style={{ fontSize: TEXT_SIZES[size] }}>
        {BRAND_NAME}
        <em>{BRAND_SUFFIX}</em>
      </span>
    </div>
  );
}