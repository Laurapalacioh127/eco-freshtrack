import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { NotificationBell } from '@/components/NotificationBell/NotificationBell';
import { ToastProvider } from '@/providers/ToastProvider';

const markAsRead = vi.fn();
let state: {
  notifications: { id: string; type: string; message: string; read: boolean; createdAt: string }[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
};

vi.mock('@/providers/NotificationsProvider', () => ({
  useNotifications: () => ({ ...state, markAsRead }),
}));

const item = (id: string, message: string) => ({
  id, type: 'recipe-reviewed', message, read: false, createdAt: '2026-01-01T10:00:00.000Z',
});

const renderBell = () =>
  render(
    <ToastProvider>
      <NotificationBell />
    </ToastProvider>,
  );

const open = async () => userEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));

beforeEach(() => {
  markAsRead.mockReset();
  state = { notifications: [], unreadCount: 0, loading: false, error: null };
});

test('shows the unread count in a badge', () => {
  state.unreadCount = 3;

  renderBell();

  expect(screen.getByLabelText('3 sin leer').textContent).toBe('3');
});

test('shows no badge when there is nothing unread', () => {
  renderBell();

  expect(screen.queryByLabelText(/sin leer/)).toBeNull();
});

test('caps the badge at 9+', () => {
  state.unreadCount = 12;

  renderBell();

  expect(screen.getByLabelText('12 sin leer').textContent).toBe('9+');
});

test('opens the list with the notification messages', async () => {
  state.notifications = [item('n1', 'Tu receta "Sopa" fue aprobada')];
  renderBell();

  await open();

  expect(screen.getByText('Tu receta "Sopa" fue aprobada')).toBeTruthy();
});

test('shows the empty text when there are no notifications', async () => {
  renderBell();

  await open();

  expect(screen.getByText('No tienes notificaciones')).toBeTruthy();
});

test('shows the loading text while loading', async () => {
  state.loading = true;
  renderBell();

  await open();

  expect(screen.getByText('Cargando notificaciones…')).toBeTruthy();
});

test('shows an alert when loading failed', async () => {
  state.error = 'boom';
  renderBell();

  await open();

  expect(screen.getByRole('alert').textContent).toBe('No pudimos cargar las notificaciones');
});

test('marks a notification as read when clicking it', async () => {
  state.notifications = [item('n1', 'Uno')];
  markAsRead.mockResolvedValue(undefined);
  renderBell();
  await open();

  await userEvent.click(screen.getByText('Uno'));

  expect(markAsRead).toHaveBeenCalledWith('n1');
});

test('shows an error toast when marking as read fails', async () => {
  state.notifications = [item('n1', 'Uno')];
  markAsRead.mockRejectedValue(new Error('boom'));
  renderBell();
  await open();

  await userEvent.click(screen.getByText('Uno'));

  expect(await screen.findByText('No se pudo marcar la notificación como leída')).toBeTruthy();
});

test('closes the list when pressing Escape', async () => {
  renderBell();
  await open();

  await userEvent.keyboard('{Escape}');

  expect(screen.queryByText('No tienes notificaciones')).toBeNull();
});
