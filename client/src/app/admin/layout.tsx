'use client';

import { Suspense } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { DonationsProvider } from '@/providers/DonationsProvider';
import { ProductsProvider } from '@/providers/ProductsProvider';
import { RecipesProvider } from '@/providers/RecipesProvider';
import { UsersProvider } from '@/providers/UsersProvider';
import { PrivateRoute } from '@/components/PrivateRoute/PrivateRoute';
import { AdminSidebar } from '@/components/AdminSidebar/AdminSidebar';
import { AdminTopbar } from '@/components/AdminTopbar/AdminTopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Session-scoped providers remount per user so no data leaks across logins.
  const sessionKey = user?.id ?? 'anonymous';

  return (
    <PrivateRoute role="admin">
      <UsersProvider key={sessionKey}>
        <ProductsProvider key={sessionKey}>
          <DonationsProvider key={sessionKey}>
            <RecipesProvider key={sessionKey}>
              <div className="flex min-h-screen">
                <Suspense fallback={<aside className="m-4 w-60 shrink-0 rounded-[2rem] bg-ink" />}>
                  <AdminSidebar />
                </Suspense>
                <div className="flex flex-1 flex-col">
                  <AdminTopbar />
                  <main className="flex-1 p-8">{children}</main>
                </div>
              </div>
            </RecipesProvider>
          </DonationsProvider>
        </ProductsProvider>
      </UsersProvider>
    </PrivateRoute>
  );
}
