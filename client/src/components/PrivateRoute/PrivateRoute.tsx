'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { loginPathFor, portalForRole } from '@/utils/authStorage';

interface PrivateRouteProps {
  role: UserRole;
  children: ReactNode;
}

// Client-side guard: the session lives in localStorage, so the server cannot check it.
// The API still enforces auth and roles on every request; this only keeps the UI honest.
export const PrivateRoute = ({ role, children }: PrivateRouteProps) => {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const allowed = isReady && user?.role === role;

  useEffect(() => {
    // Without a session, or with another role's session, go to this portal's login.
    if (isReady && user?.role !== role) {
      router.replace(loginPathFor(portalForRole(role)));
    }
  }, [isReady, user, role, router]);

  if (!allowed) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Verificando tu sesión…
      </div>
    );
  }

  return <>{children}</>;
};
