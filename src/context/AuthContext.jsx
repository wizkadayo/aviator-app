import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AuthContext = createContext(null);
const BASE = import.meta.env.VITE_API_URL;

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    const saved = localStorage.getItem('aviator_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem('aviator_token')
  );

  const logoutTimer = useRef(null);

  // ── LOGOUT ──
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aviator_user');
    localStorage.removeItem('aviator_token');
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  }, []);

  // ── AUTO LOGOUT ON INACTIVITY ──
  const resetTimer = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (!token) return;
    logoutTimer.current = setTimeout(() => {
      logout();
      window.location.href = '/login';
    }, INACTIVITY_LIMIT);
  }, [token, logout]);

  useEffect(() => {
    if (!token) return;
    const events = ['mousedown','mousemove','keydown','scroll','touchstart','click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [token, resetTimer]);

  // ── LOGIN ──
  const login = async (email, password) => {
    const res  = await fetch(`${BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error('Server error — could not parse response'); }
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('aviator_token', data.token);
    localStorage.setItem('aviator_user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── REGISTER ──
  const register = async (form) => {
    const res  = await fetch(`${BASE}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error('Server error — could not parse response'); }
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('aviator_token', data.token);
    localStorage.setItem('aviator_user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── UPDATE BALANCE ──
  const updateBalance = (newBalance) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, balance: newBalance };
      localStorage.setItem('aviator_user', JSON.stringify(updated));
      return updated;
    });
  };

  // ── REFRESH BALANCE FROM SERVER ──
  const refreshBalance = useCallback(async () => {
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
    } catch { /* silent */ }
  }, [token]);

  // ── FORGOT PASSWORD ──
  const forgotPassword = async (email) => {
    const res  = await fetch(`${BASE}/auth/forgot-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
    return data;
  };

  // ── RESET PASSWORD ──
  const resetPassword = async (resetToken, newPassword) => {
    const res  = await fetch(`${BASE}/auth/reset-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token: resetToken, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      updateBalance,
      refreshBalance,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);