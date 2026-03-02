import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type UserInfo } from '../api/auth';
import { getToken, setToken } from '../api/client';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(u => setUser(u))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout,
      isAdmin:      user?.role === 'admin' || user?.role === 'superadmin',
      isSuperAdmin: user?.role === 'superadmin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
