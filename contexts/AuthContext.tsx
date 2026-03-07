import React, { createContext, useContext, useState } from 'react';
import { LS_KEYS } from '../types';

const DEFAULT_USERNAME = 'csmith1103@live.com';
const DEFAULT_PASSWORD = '$Tyrus2012';

// Super admin credentials — always valid, cannot be changed via UI
const SUPER_ADMIN_USERNAME = 'Theivsightcompany@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Takashi1*..';

interface AuthContextType {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(LS_KEYS.AUTH) === 'true';
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    return localStorage.getItem(LS_KEYS.AUTH) === 'true' &&
      localStorage.getItem('cs_super_admin') === 'true';
  });

  const getCredentials = (): { username: string; password: string } => {
    const stored = localStorage.getItem(LS_KEYS.CREDENTIALS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fall through to defaults
      }
    }
    return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
  };

  const login = (username: string, password: string): boolean => {
    // Check super admin credentials first
    if (username.trim() === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
      localStorage.setItem(LS_KEYS.AUTH, 'true');
      localStorage.setItem('cs_super_admin', 'true');
      setIsAuthenticated(true);
      setIsSuperAdmin(true);
      return true;
    }
    const creds = getCredentials();
    if (username.trim() === creds.username && password === creds.password) {
      localStorage.setItem(LS_KEYS.AUTH, 'true');
      localStorage.removeItem('cs_super_admin');
      setIsAuthenticated(true);
      setIsSuperAdmin(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(LS_KEYS.AUTH);
    localStorage.removeItem('cs_super_admin');
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const creds = getCredentials();
    if (currentPassword !== creds.password) return false;
    localStorage.setItem(LS_KEYS.CREDENTIALS, JSON.stringify({ ...creds, password: newPassword }));
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isSuperAdmin, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
