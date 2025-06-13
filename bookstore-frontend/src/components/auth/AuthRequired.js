import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthRequired = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Skip auth check for login, register and homepage routes
  if (
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/'
  ) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to register page but save the location they were trying to access
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child routes
  return <Outlet />;
};

export default AuthRequired; 