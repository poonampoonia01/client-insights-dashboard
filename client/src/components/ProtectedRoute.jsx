import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { advisor, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!advisor) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
