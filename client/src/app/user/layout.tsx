'use client';

import { Suspense } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { InventoryProvider } from '@/providers/InventoryProvider';
import { RecipesProvider } from '@/providers/RecipesProvider';
import { UsersProvider } from '@/providers/UsersProvider';
import { PrivateRoute } from '@/components/PrivateRoute/PrivateRoute';
import { UserSidebar } from '@/components/UserSidebar/UserSidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Session-scoped providers remount per user so no data leaks across logins.
  const sessionKey = user?.id ?? 'anonymous';

  return (
    <PrivateRoute role="household">
      <UsersProvider key={sessionKey}>
        <InventoryProvider key={sessionKey}>
          <RecipesProvider key={sessionKey}>
            <div className="flex min-h-screen">
              <Suspense fallback={<aside className="m-4 w-56 shrink-0 rounded-[2rem] bg-white shadow-soft" />}>
                <UserSidebar />
              </Suspense>
              <main className="flex-1 p-8">{children}</main>
            </div>
          </RecipesProvider>
        </InventoryProvider>
      </UsersProvider>
    </PrivateRoute>
  );
}
