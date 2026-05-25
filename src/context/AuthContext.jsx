import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const BASE = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aviator_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('aviator_token')
  );

  const login = async (email, password) => {
    const res  = await fetch(`${BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    // Read as text first to avoid empty JSON crash
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Server error — could not parse response');
    }

    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('aviator_token', data.token);
    localStorage.setItem('aviator_user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (form) => {
    const res  = await fetch(`${BASE}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Server error — could not parse response');
    }

    if (!res.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('aviator_token', data.token);
    localStorage.setItem('aviator_user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aviator_user');
    localStorage.removeItem('aviator_token');
  };

  const updateBalance = (newBalance) => {
    setUser(prev => {
      if (!prev) return prev;
      // If newBalance is a full number treat as absolute,
      // if negative or small treat as delta
      const updated = {
        ...prev,
        balance: typeof newBalance === 'number' && newBalance > 100
          ? newBalance
          : prev.balance + newBalance,
      };
      localStorage.setItem('aviator_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshBalance = async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => {
          const updated = { ...prev, balance: data.balance };
          localStorage.setItem('aviator_user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // silent
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, register, logout, updateBalance, refreshBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);