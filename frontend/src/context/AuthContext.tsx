import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicUser, loginRequest, registerRequest, logoutRequest } from '../api/auth.api';
import { getMeRequest } from '../api/user.api';
import { saveTokens, clearTokens } from '../api/client';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ message: string }>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const hasToken = Boolean(localStorage.getItem('accessToken'));
      if (!hasToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMeRequest();
        setUser(me);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email: string, password: string) {
    const result = await loginRequest(email, password);
    saveTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  }

  async function register(name: string, email: string, password: string) {
    return registerRequest(name, email, password);
  }

  async function loginWithTokens(accessToken: string, refreshToken: string) {
    saveTokens(accessToken, refreshToken);
    const me = await getMeRequest();
    setUser(me);
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // Si falla la petición, igual limpiamos la sesión local.
      }
    }
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}