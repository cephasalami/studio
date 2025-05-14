'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/types';

interface AuthContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  loading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_ROLE_KEY = 'estateWatchUserRole';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem(LOCAL_STORAGE_ROLE_KEY);
      if (storedRole) {
        setUserRoleState(storedRole as UserRole);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setUserRole = useCallback((role: UserRole | null) => {
    setUserRoleState(role);
    setLoading(false);
    if (role) {
      try {
        localStorage.setItem(LOCAL_STORAGE_ROLE_KEY, role);
      } catch (error) {
         console.error("Failed to set role in localStorage:", error);
      }
    } else {
      try {
        localStorage.removeItem(LOCAL_STORAGE_ROLE_KEY);
      } catch (error) {
        console.error("Failed to remove role from localStorage:", error);
      }
    }
  }, []);

  const logout = useCallback(() => {
    setUserRole(null);
  }, [setUserRole]);

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
