"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, tokenStorage, userStorage, User, AuthResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = tokenStorage.get();
      const storedUser = userStorage.get();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Refresh user data from API
        try {
          const freshUser = await api.getCurrentUser(storedToken);
          setUser(freshUser);
          userStorage.set(freshUser);
        } catch (error) {
          console.error('Failed to refresh user:', error);
          // Token might be expired, log out
          logout();
        }
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await api.login(email, password);

    tokenStorage.set(response.access_token);
    setToken(response.access_token);

    const user = await api.getCurrentUser(response.access_token);
    userStorage.set(user);
    setUser(user);
  };

  const register = async (email: string, name: string, password: string) => {
    const response: AuthResponse = await api.register(email, name, password);

    tokenStorage.set(response.access_token);
    setToken(response.access_token);

    const user = await api.getCurrentUser(response.access_token);
    userStorage.set(user);
    setUser(user);
  };

  const logout = () => {
    tokenStorage.remove();
    userStorage.remove();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;

    const freshUser = await api.getCurrentUser(token);
    setUser(freshUser);
    userStorage.set(freshUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
