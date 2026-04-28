import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  updateUser: () => {},
});

const DEMO_USER: UserProfile = {
  name: 'Alex Solar',
  email: 'user@solar.com',
  phone: '+1 555-0123',
  location: 'San Diego, CA',
  preferences: {
    pushNotifications: true,
    darkModeOverride: false,
    autoTheme: true,
    emailReports: true,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    if (email === 'user@solar.com' && _password === 'demo123') {
      setUser(DEMO_USER);
      return true;
    }
    if (email && _password) {
      setUser({ ...DEMO_USER, email, name: email.split('@')[0] });
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (email: string, _password: string, name: string): Promise<boolean> => {
    setUser({ ...DEMO_USER, email, name: name || email.split('@')[0] });
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const isAuthenticated = useMemo(() => user !== null, [user]);

  const value = useMemo(() => ({ user, isAuthenticated, login, signup, logout, updateUser }), [user, isAuthenticated, login, signup, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
});

AuthProvider.displayName = 'AuthProvider';

export const useAuth = () => useContext(AuthContext);
