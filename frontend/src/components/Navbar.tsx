import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Logo variant="dark" size="sm" />

        <nav className="topbar__nav">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            Mi perfil
          </NavLink>
          {user.role === 'admin' && (
            <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="topbar__user">
          <Avatar name={user.name} size="sm" />
          <div className="topbar__user-meta">
            <span className="topbar__user-name">{user.name}</span>
            <span className="topbar__user-role">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}