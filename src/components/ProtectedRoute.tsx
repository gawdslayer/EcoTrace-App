import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, initializing, user } = useAuth();

  // Show loading while checking authentication
  if (initializing) {
    return <LoadingSpinner text="Verifying access..." overlay />;
  }

  // If not authenticated, show fallback or nothing
  if (!isAuthenticated || !user) {
    return fallback ? <>{fallback}</> : <View />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}