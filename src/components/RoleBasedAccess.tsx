import { ReactNode } from 'react';
import { useAuth } from '@/components/UserAuth';
import { User } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleBasedAccessProps {
  allowedRoles: User['role'][];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleBasedAccess = ({ allowedRoles, children, fallback }: RoleBasedAccessProps) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Please log in to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this feature. Required roles: {allowedRoles.join(', ')}.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export const useRoleAccess = () => {
  const { currentUser } = useAuth();

  const hasRole = (role: User['role']) => currentUser?.role === role;
  const hasAnyRole = (roles: User['role'][]) => currentUser ? roles.includes(currentUser.role) : false;
  const isVerified = () => currentUser?.verificationStatus === 'verified';

  return {
    currentUser,
    hasRole,
    hasAnyRole,
    isVerified,
    canRegisterLand: hasAnyRole(['landowner', 'authority']),
    canTransferLand: hasAnyRole(['landowner', 'buyer']),
    canFileDispute: hasAnyRole(['landowner', 'buyer']),
    canVoteOnDispute: hasAnyRole(['landowner', 'buyer', 'arbitrator', 'authority']),
    canResolveDispute: hasAnyRole(['arbitrator', 'authority']),
    canViewContracts: hasAnyRole(['authority', 'arbitrator']),
    canManageUsers: hasRole('authority')
  };
};