import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@ai-quiz-app/shared';
import { useUser } from '../context/UserContext';
import Loading from './Loading';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading, hasRole } = useUser();

  // Show loading state while user data is being fetched
  if (loading) {
    return <Loading />;
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if user has one of the allowed roles
  const isAuthorized = allowedRoles.some(role => hasRole(role));

  // Redirect to unauthorized page if user doesn't have required role
  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
};

export default RoleProtectedRoute;
