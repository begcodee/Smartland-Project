import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARD } from '@/contexts/AuthContext';
import type { User } from '@/lib/mockData';
import { shouldForceBuyerSellerVerificationRoute } from '@/lib/verificationRouting';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allowed roles for this route. Empty = any authenticated user */
  allowedRoles?: User['role'][];
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, user, authReady, authHydrating } = useAuth();
  const location = useLocation();

  if (!authReady || authHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const lockedBuyerSellerVerification = shouldForceBuyerSellerVerificationRoute(user);

  const path = location.pathname;
  const paymentOk = path.startsWith('/payment/callback');

  const onVerificationStatusRoute = path === '/verification/status' || path === '/verification-status';

  if (lockedBuyerSellerVerification && !paymentOk && !onVerificationStatusRoute) {
    return <Navigate to="/verification-status" replace />;
  }

  const roleAllowed =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!roleAllowed) {
    const correctPath = ROLE_DASHBOARD[user.role];
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
}
