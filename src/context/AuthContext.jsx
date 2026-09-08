import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { DEFAULT_MANAGER_SIG } from '../utils/constants.js';

const AuthContext = createContext(null);

function readSavedUser() {
  const saved = localStorage.getItem('kas_user');
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem('kas_user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [token, setToken] = useState(() => localStorage.getItem('kas_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;

    async function refreshUser() {
      try {
        const admin = await api.getMe(token);
        if (!active) return;
        setUser(admin);
        localStorage.setItem('kas_user', JSON.stringify(admin));
      } catch {
        if (!active) return;
        setUser(null);
        setToken(null);
        localStorage.removeItem('kas_user');
        localStorage.removeItem('kas_token');
      }
    }

    refreshUser();

    return () => {
      active = false;
    };
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('kas_user', JSON.stringify(data.user));
      localStorage.setItem('kas_token', data.token);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kas_user');
    localStorage.removeItem('kas_token');
  };

  const updateProfile = async (updates) => {
    const updated = await api.updateSettings(updates, token);
    setUser(updated);
    localStorage.setItem('kas_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      logout,
      updateProfile,
      defaultSignature: user?.defaultSignature || DEFAULT_MANAGER_SIG
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
