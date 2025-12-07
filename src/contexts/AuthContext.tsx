import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../models/UserModel';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data in localStorage
    const storedToken = localStorage.getItem('smartcasino_token');
    const storedUser = localStorage.getItem('smartcasino_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
      
        // Basic validation to ensure the stored user data isn't corrupted
        if (parsedUser && parsedUser.id && parsedUser.username) {
          setToken(storedToken);
          setUser(parsedUser);
      ``} else {
          // If data is partial/corrupt, clear it
          localStorage.removeItem('smartcasino_token');
          localStorage.removeItem('smartcasino_user');
      }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('smartcasino_token');
        localStorage.removeItem('smartcasino_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Save to state
    setToken(newToken);
    setUser(newUser);
    
    // Save to LocalStorage for persistence
    localStorage.setItem('smartcasino_token', newToken);
    localStorage.setItem('smartcasino_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smartcasino_token');
    localStorage.removeItem('smartcasino_user');
    
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};