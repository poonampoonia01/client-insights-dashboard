import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [advisor, setAdvisor] = useState(() => {
    const stored = localStorage.getItem('advisor');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Confirm the stored token is still valid on refresh.
    api
      .get('/auth/me')
      .then(({ data }) => {
        setAdvisor(data.advisor);
        localStorage.setItem('advisor', JSON.stringify(data.advisor));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('advisor');
        setAdvisor(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('advisor', JSON.stringify(data.advisor));
    setAdvisor(data.advisor);
  }, []);

  const register = useCallback(async (name, email, password, firm) => {
    const { data } = await api.post('/auth/register', { name, email, password, firm });
    localStorage.setItem('token', data.token);
    localStorage.setItem('advisor', JSON.stringify(data.advisor));
    setAdvisor(data.advisor);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('advisor');
    setAdvisor(null);
  }, []);

  return (
    <AuthContext.Provider value={{ advisor, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
