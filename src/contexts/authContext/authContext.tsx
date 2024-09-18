import React, { useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../../firebase/FirebaseConfig'; // Update the path as needed
import { GoogleAuthProvider, User, onAuthStateChanged, setPersistence, browserLocalPersistence } from '../../../node_modules/firebase/auth';

interface AuthContextType {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  isGoogleUser: boolean;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  errorMessage: string;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing authentication:', error);
        setErrorMessage('Failed to initialize authentication. Please try again.');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  function initializeUser(user: User | null) {
    if (user) {
      setCurrentUser(user);
      const isEmail = user.providerData.some(provider => provider.providerId === 'password');
      setIsEmailUser(isEmail);
      const isGoogle = user.providerData.some(provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID);
      setIsGoogleUser(isGoogle);
      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
  }

  const value: AuthContextType = {
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    currentUser,
    setCurrentUser,
    errorMessage,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
