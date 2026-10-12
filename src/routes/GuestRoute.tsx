import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import type { ReactNode } from 'react';

export default function GuestRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
