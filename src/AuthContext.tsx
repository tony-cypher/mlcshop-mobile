import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { setMemoryToken, storage } from './storage';
import type { AuthResponse, User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const savedToken = await storage.getItem('mlc_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    setMemoryToken(savedToken);
    try {
      const res = await api<AuthResponse>('/auth/me');
      setUser(res.data);
    } catch {
      await storage.removeItem('mlc_token');
      setMemoryToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res.token) {
      await storage.setItem('mlc_token', res.token);
      setMemoryToken(res.token);
    }
    setUser(res.data);
    return res.data;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: {
        name,
        email,
        password,
        password_confirmation: password,
      },
    });
    if (res.token) {
      await storage.setItem('mlc_token', res.token);
      setMemoryToken(res.token);
    }
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    await storage.removeItem('mlc_token');
    setMemoryToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
