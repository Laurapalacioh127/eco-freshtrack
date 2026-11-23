import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { ToastProvider, useToast } from '@/providers/ToastProvider';

const Trigger = ({ message, variant }: { message: string; variant?: 'error' | 'success' | 'info' }) => {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, variant)}>mostrar</button>;
};

const renderToast = (message: string, variant?: 'error' | 'success' | 'info') =>
  render(
    <ToastProvider>
      <Trigger message={message} variant={variant} />
    </ToastProvider>,
  );

afterEach(() => {
  vi.useRealTimers();
});

test('an error toast uses role alert', async () => {
  const user = userEvent.setup();
  renderToast('Fallo');

  await user.click(screen.getByRole('button', { name: 'mostrar' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Fallo');
});

test('a success toast uses role status', async () => {
  const user = userEvent.setup();
  renderToast('Listo', 'success');

  await user.click(screen.getByRole('button', { name: 'mostrar' }));

  expect(screen.getByRole('status')).toHaveTextContent('Listo');
});

test('the close button removes the toast', async () => {
  const user = userEvent.setup();
  renderToast('Fallo');
  await user.click(screen.getByRole('button', { name: 'mostrar' }));

  await user.click(screen.getByRole('button', { name: 'Cerrar notificación' }));

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('the toast disappears after 5 seconds', () => {
  vi.useFakeTimers();
  renderToast('Fallo');
  act(() => screen.getByRole('button', { name: 'mostrar' }).click());

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('useToast throws outside the provider', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  expect(() => renderHook(() => useToast())).toThrow('useToast must be used within a ToastProvider');
});
