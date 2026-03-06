import React, { createContext, useContext, useState } from 'react';
import { LS_KEYS } from '../types';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'CassAdmin2024!';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(LS_KEYS.AUTH) === 'true';
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
    const creds = getCredentials();
    if (username.trim() === creds.username && password === creds.password) {
      localStorage.setItem(LS_KEYS.AUTH, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(LS_KEYS.AUTH);
    setIsAuthenticated(false);
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const creds = getCredentials();
    if (currentPassword !== creds.password) return false;
    localStorage.setItem(LS_KEYS.CREDENTIALS, JSON.stringify({ ...creds, password: newPassword }));
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
