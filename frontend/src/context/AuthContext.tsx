/**
 * SECURITY & ARCHITECTURE NOTE:
 * JWT Token is stored purely in React Context (in-memory state) rather than localStorage.
 * 
 * Trade-offs:
 * 1. Security Advantage: Storing tokens in memory prevents XSS (Cross-Site Scripting) token theft. 
 *    Attacker scripts injected into the browser DOM cannot access window.localStorage to steal the bearer token.
 * 2. UX Trade-off: On hard browser page refreshes, the in-memory token state is reset, requiring re-login 
 *    unless paired with a secure HttpOnly refresh cookie mechanism.
 * 
 * For this operations portal, in-memory state provides strong client-side credential isolation.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../types';
import { setAuthToken } from '../services/api';
import * as authService from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authService.loginApi(email, password);
    setToken(response.token);
    setUser(response.user);
    setAuthToken(response.token);
    return response.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const hasRole = (...roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
