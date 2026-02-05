import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setAuthToken } from '../services/api';

interface AuthContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_KEY_STORAGE_KEY = 'url_shortener_api_key';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  });

  const setApiKey = (key: string | null) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    setAuthToken(key);
  };

  useEffect(() => {
    if (apiKey) {
      setAuthToken(apiKey);
    }
  }, [apiKey]);

  return (
    <AuthContext.Provider value={{ apiKey, setApiKey, isAuthenticated: !!apiKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
