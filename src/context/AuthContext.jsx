import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aviator_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    const u = { ...userData, balance: userData.balance ?? 5000 };
    setUser(u);
    localStorage.setItem('aviator_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aviator_user');
  };

  const updateBalance = (amount) => {
    setUser(prev => {
      const updated = { ...prev, balance: prev.balance + amount };
      localStorage.setItem('aviator_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);