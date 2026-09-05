'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthService, CustomerProfile } from '@/frontend/services/authService';

interface AuthContextType {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await AuthService.getMe();
      if (res.authenticated && res.customer) {
        setCustomer(res.customer);
        setIsAuthenticated(true);
        setIsGuest(false);
      } else {
        setCustomer(null);
        setIsAuthenticated(false);
        setIsGuest(true);
      }
    } catch {
      setCustomer(null);
      setIsAuthenticated(false);
      setIsGuest(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await AuthService.login(credentials);
    setCustomer(res.customer);
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  }) => {
    const res = await AuthService.register(data);
    setCustomer(res.customer);
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const logout = async () => {
    await AuthService.logout();
    setCustomer(null);
    setIsAuthenticated(false);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated,
        isGuest,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
