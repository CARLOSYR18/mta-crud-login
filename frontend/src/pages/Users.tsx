import { useEffect, useState } from 'react';
import { listUsersRequest, deleteUserRequest, PublicUser } from '../api/user.api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUsersRequest()
      .then(setUsers)
      .catch((err) => setError(err?.response?.data?.message ?? 'No se pudo cargar la lista'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    await deleteUserRequest(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="page">
        <header className="page-header fade-in-up">
          <p className="page-eyebrow">Administración</p>
          <h1>Usuarios</h1>
          <p className="page-lead">{users.length} cuenta{users.length === 1 ? '' : 's'} registrada{users.length === 1 ? '' : 's'}.</p>
        </header>

        {error && <p className="form-error">{error}</p>}

        {loading && (
          <div className="table-card fade-in-up">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        )}

        {!loading && !error && (
          <div className="table-card fade-in-up" style={{ animationDelay: '0.08s' }}>
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className="row-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <td>
                      <div className="user-cell">
                        <Avatar name={u.name} size="sm" />
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <Badge tone={u.role === 'admin' ? 'brand' : 'slate'}>
                        {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </Badge>
                    </td>
                    <td className="align-right">
                      {u.id !== currentUser?.id && (
                        <button type="button" className="btn-danger-ghost" onClick={() => handleDelete(u.id)}>
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && <p className="empty-state">Todavía no hay usuarios registrados.</p>}
          </div>
        )}
      </div>
    </div>
  );
}