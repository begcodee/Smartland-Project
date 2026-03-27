import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARD } from '@/contexts/AuthContext';
import type { User } from '@/lib/mockData';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allowed roles for this route. Empty = any authenticated user */
  allowedRoles?: User['role'][];
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const roleAllowed =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!roleAllowed) {
    const correctPath = ROLE_DASHBOARD[user.role];
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
}
