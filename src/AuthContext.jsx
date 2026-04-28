/**
 * AcadLMS Frontend — Auth Context
 * JWT auth state shared across the React app
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthAPI } from './services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]   = useState(null);
  const [tenantId,setTenant] = useState(null);
  const [loading, setLoading]= useState(true);
  const [error,   setError]  = useState(null);

  // Check for existing session on load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    const tid = localStorage.getItem('tenant_id');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setTenant(tid);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await AuthAPI.login({ email, password });
      
      const { accessToken, refreshToken, user: userData } = data;

      localStorage.setItem('access_token',  accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user',          JSON.stringify(userData));
      localStorage.setItem('tenant_id',     userData.tenantId || '');
      
      setUser(userData);
      setTenant(userData.tenantId);
      return { user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await AuthAPI.logout(); } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant_id');
    setUser(null); setTenant(null);
  }, []);

  const updateUser = useCallback(updates => {
    setUser(prev => {
      const u = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(u));
      return u;
    });
  }, []);

  const hasRole = useCallback((...roles) =>
    roles.some(r => user?.roles?.includes(r)), [user]);

  return (
    <AuthContext.Provider value={{
      user, tenantId, loading, error,
      login, logout, updateUser, hasRole,
      isLoggedIn:   !!user,
      isSuperAdmin: user?.roles?.includes('Super Admin'),
      isAdmin:      user?.roles?.some(r => ['Super Admin','Admin'].includes(r)),
      isInstructor: user?.roles?.includes('Instructor'),
      isStaff:      user?.roles?.includes('Staff'),
      isStudent:    user?.roles?.includes('Student'),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
