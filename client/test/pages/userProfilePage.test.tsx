import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import ProfilePage from '@/app/user/profile/page';

const handleLogout = vi.fn();

vi.mock('@/hooks/useLogout', () => ({ useLogout: () => handleLogout }));
vi.mock('@/providers/UsersProvider', () => ({
  useUsers: () => ({
    me: { id: 'u1', name: 'Laura Gómez', email: 'laura@example.com', role: 'household' },
    loading: false,
    error: null,
  }),
}));
vi.mock('@/providers/DonationsProvider', () => ({ useDonations: () => ({ summary: null }) }));

test('profile page has no "Preferencias" button', () => {
  render(<ProfilePage />);

  expect(screen.queryByRole('button', { name: /preferencias/i })).not.toBeInTheDocument();
});

test('"Cerrar sesión" calls logout once', async () => {
  const user = userEvent.setup();
  handleLogout.mockClear();
  render(<ProfilePage />);

  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

  expect(handleLogout).toHaveBeenCalledTimes(1);
});
