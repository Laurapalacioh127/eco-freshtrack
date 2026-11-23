import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { AdminSidebar } from '@/components/AdminSidebar/AdminSidebar';
import { ToastProvider } from '@/providers/ToastProvider';

const replace = vi.fn();
const logout = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }), usePathname: () => '/admin' }));
vi.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ logout }) }));
vi.mock('@/components/logo/Logo', () => ({ Logo: () => <span>FreshTrack</span> }));
vi.mock('@/providers/RecipesProvider', () => ({ useRecipes: () => ({ recipes: [] }) }));

beforeEach(() => {
  replace.mockReset();
  logout.mockReset();
});

const renderSidebar = () =>
  render(
    <ToastProvider>
      <AdminSidebar />
    </ToastProvider>,
  );

test('logs out when clicking Cerrar sesión', async () => {
  const user = userEvent.setup();
  renderSidebar();

  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

  expect(logout).toHaveBeenCalledTimes(1);
});

test('shows the signed-out toast', async () => {
  const user = userEvent.setup();
  renderSidebar();

  await act(async () => {
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  });

  expect(screen.getByRole('status')).toHaveTextContent('Cerraste sesión');
});
