import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-black flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider animate-pulse">
          Synchronizing credentials...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect the user to login page, saving their target location
    return <Navigate to={`/login?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
