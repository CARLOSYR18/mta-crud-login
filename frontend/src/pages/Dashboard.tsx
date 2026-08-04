import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserRequest, deleteUserRequest } from '../api/user.api';
import { Navbar } from '../components/Navbar';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      await updateUserRequest(user!.id, { name, email });
      setMessage('Perfil actualizado correctamente. Vuelve a iniciar sesión si cambiaste el email.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) return;
    await deleteUserRequest(user!.id);
    await logout();
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="page">
        <header className="page-header fade-in-up">
          <p className="page-eyebrow">Panel de cuenta</p>
          <h1>Hola, {user.name.split(' ')[0]}</h1>
          <p className="page-lead">Gestiona tu información personal y la seguridad de tu cuenta.</p>
        </header>

        <section className="profile-card fade-in-up" style={{ animationDelay: '0.08s' }}>
          <div className="profile-card__identity">
            <Avatar name={user.name} size="lg" />
            <div>
              <h2>{user.name}</h2>
              <p className="muted">{user.email}</p>
              <Badge tone={user.role === 'admin' ? 'brand' : 'slate'}>
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Badge>
            </div>
          </div>

          <div className="profile-card__divider" />

          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}

          <form onSubmit={handleUpdate} className="profile-form">
            <label className="field">
              <span>Nombre</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Guardar cambios'}
            </button>
          </form>
        </section>

        {user.role === 'admin' && (
          <section className="callout-card fade-in-up" style={{ animationDelay: '0.14s' }}>
            <div>
              <h3>Gestión de usuarios</h3>
              <p className="muted">Consulta y administra todas las cuentas registradas en la plataforma.</p>
            </div>
            <Link to="/users" className="btn-secondary">
              Ver usuarios
            </Link>
          </section>
        )}

        <section className="danger-card fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div>
            <h3>Eliminar cuenta</h3>
            <p className="muted">Esta acción es permanente y no se puede deshacer.</p>
          </div>
          <button type="button" className="btn-danger" onClick={handleDelete}>
            Eliminar mi cuenta
          </button>
        </section>
      </div>
    </div>
  );
}