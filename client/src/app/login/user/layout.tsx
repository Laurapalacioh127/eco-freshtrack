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
            <UserSidebar />
            <main className="flex-1 p-8">{children}</main>
          </div>
        </RecipesProvider>
      </InventoryProvider>
    </UsersProvider>
  );
}