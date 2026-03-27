import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/mockData';
import { api } from '@/lib/api';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function mapApiUser(u: { id?: string; name?: string; email?: string; role?: string; verificationStatus?: string; country?: string; phoneNumber?: string; organization?: string; staffId?: string; arbitratorRegNo?: string; blockchainToken?: string; reputation?: object; creditScore?: object; financialProfile?: object }) {
  return {
    id: u.id ?? '',
    name: u.name ?? '',
    email: u.email ?? '',
    role: (u.role ?? 'buyer') as User['role'],
    verificationStatus: (u.verificationStatus ?? 'verified') as User['verificationStatus'],
    country: u.country ?? 'GH',
    phoneNumber: u.phoneNumber ?? '',
    organization: u.organization,
    staffId: u.staffId,
    arbitratorRegNo: u.arbitratorRegNo,
    blockchainToken: u.blockchainToken,
    reputation: u.reputation as User['reputation'],
    creditScore: u.creditScore as User['creditScore'],
    financialProfile: u.financialProfile as User['financialProfile']
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('smartland_token');
    if (!token) return;
    api.me()
      .then((res) => {
        if (res.success && res.user) {
          setUserState(mapApiUser(res.user));
        }
      })
      .catch(() => {
        api.logout();
      });
  }, []);

  const login = useCallback((u: User) => {
    setUserState(u);
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUserState(null);
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUserState((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function isUserRestricted(user: User | null | undefined) {
  return !!user && user.verificationStatus !== 'verified';
}

/** Base path for each role after login */
export const ROLE_DASHBOARD: Record<User['role'], string> = {
  admin: '/admin',
  seller: '/seller',
  buyer: '/buyer',
  arbitrator: '/arbitrator',
};
