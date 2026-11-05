import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAppStore, switchStudentProgress } from '../store/useAppStore';
import { authApi, getToken, type AuthUser } from '../services/api';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!getToken()) { setLoading(false); return () => { active = false; }; }
    authApi.me().then((profile) => { if (active) { switchStudentProgress(profile.id); setUser(profile); } })
      .catch(() => { authApi.logout(); if (active) { switchStudentProgress(null); setUser(null); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading,
    login: async (email, password) => { const result = await authApi.login({ email, password }); switchStudentProgress(result.user.id); setUser(result.user); },
    register: async (name, email, password) => { const result = await authApi.register({ name, email, password }); switchStudentProgress(result.user.id); setUser(result.user); },
    logout: () => { authApi.logout(); switchStudentProgress(null); setUser(null); },
    refreshProfile: async () => { setUser(await authApi.me()); },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
