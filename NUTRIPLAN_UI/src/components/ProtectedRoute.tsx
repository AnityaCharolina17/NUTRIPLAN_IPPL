import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    // Redirect to home instead of showing login prompt
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}