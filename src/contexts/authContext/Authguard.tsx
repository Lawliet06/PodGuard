import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';
import paths from 'routes/paths';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!userLoggedIn) {
    return <Navigate to={paths.signin} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
