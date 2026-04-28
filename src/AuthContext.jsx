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

  // Force login screen every time the app loads for prototyping
  useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, tenantSlug) => {
    setError(null);
    try {
      // Mock login for frontend-only demo (backend docker is offline)
      let mockUser;
      const lowerEmail = email.toLowerCase();
      if (lowerEmail === "sophia@lms.dev") {
        mockUser = { id: 1, name: "Sophia Chen", email, roles: ["Super Admin"], tenantId: tenantSlug || 'T001' };
      } else if (lowerEmail === "m.rivera@lms.dev") {
        mockUser = { id: 2, name: "Marcus Rivera", email, roles: ["Admin"], tenantId: tenantSlug || 'T002' };
      } else if (lowerEmail === "aisha@lms.dev") {
        mockUser = { id: 3, name: "Aisha Patel", email, roles: ["Instructor"], tenantId: tenantSlug || 'T001' };
      } else if (lowerEmail === "jweber@lms.dev") {
        mockUser = { id: 4, name: "Jonas Weber", email, roles: ["Student"], tenantId: tenantSlug || 'T001' };
      } else if (lowerEmail === "staff@lms.dev") {
        mockUser = { id: 5, name: "Elena R.", email, roles: ["Staff"], tenantId: tenantSlug || 'T001' };
      } else {
        mockUser = { id: 99, name: "Demo User", email, roles: ["Student"], tenantId: tenantSlug || 'T001' };
      }

      localStorage.setItem('access_token',  'mock_access_token');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      localStorage.setItem('user',          JSON.stringify(mockUser));
      localStorage.setItem('tenant_id',     mockUser.tenantId || '');
      setUser(mockUser);
      setTenant(mockUser.tenantId);
      return { user: mockUser };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
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
