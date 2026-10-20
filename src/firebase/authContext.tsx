import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, testConnection } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOnline: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isOnline: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    testConnection().then(connected => {
      if (!connected && !navigator.onLine) {
        setIsOnline(false);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error('Falha no login Google:', e);
      alert('Não foi possível completar o login com Google. Tente novamente.');
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Falha no logout:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isOnline, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
