interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div className={`avatar avatar--${size}`} aria-hidden="true">
      {getInitials(name) || '?'}
    </div>
  );
}