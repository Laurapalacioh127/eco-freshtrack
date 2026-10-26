import { Suspense } from 'react';
import { InventoryProvider } from '@/providers/InventoryProvider';
import { RecipesProvider } from '@/providers/RecipesProvider';
import { UsersProvider } from '@/providers/UsersProvider';
import { UserSidebar } from '@/components/UserSidebar/UserSidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <UsersProvider>
      <InventoryProvider>
        <RecipesProvider>
          <div className="flex min-h-screen">
            <Suspense fallback={<aside className="w-56 shrink-0 border-r border-black/5 bg-white" />}>
              <UserSidebar />
            </Suspense>
            <main className="flex-1 p-8">{children}</main>
          </div>
        </RecipesProvider>
      </InventoryProvider>
    </UsersProvider>
  );
}