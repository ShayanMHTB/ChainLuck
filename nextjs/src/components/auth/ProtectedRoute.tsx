// nextjs/src/components/auth/ProtectedRoute.tsx

'use client';

import { ReactNode } from 'react';
import { useUser } from '@/components/providers/UserProvider';
import { LoginPrompt } from '@/components/auth/LoginPrompt';
// import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requireWallet?: boolean;
  requireMinSpending?: number;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireWallet = true,
  requireMinSpending = 0,
  fallback,
  loadingComponent,
}: ProtectedRouteProps) {
  const { isAuthenticated, canAccessDashboard, stats, isLoading } = useUser();

  // Show loading state
  // if (isLoading) {
  //   return loadingComponent || <LoadingScreen />;
  // }

  // Check wallet requirement
  if (requireWallet && !isAuthenticated) {
    return fallback || <LoginPrompt />;
  }

  // Check dashboard access
  if (requireWallet && !canAccessDashboard) {
    return fallback || <LoginPrompt />;
  }

  // Check minimum spending requirement
  if (
    requireMinSpending > 0 &&
    stats &&
    stats.totalSpent < requireMinSpending
  ) {
    return (
      fallback || (
        <LoginPrompt
          title="Minimum Spending Required"
          description={`You need to spend at least $${requireMinSpending} to access this feature.`}
          action="Buy Tickets"
          actionHref="/"
        />
      )
    );
  }

  return <>{children}</>;
}

// Specific auth guards for common use cases
export function DashboardGuard({ children }: { children: ReactNode }) {
  return <ProtectedRoute requireWallet={true}>{children}</ProtectedRoute>;
}

export function ReferralGuard({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireWallet={true} requireMinSpending={10}>
      {children}
    </ProtectedRoute>
  );
}
