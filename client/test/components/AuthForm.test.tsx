import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { AuthForm } from '@/components/AuthForm/AuthForm';
import { ToastProvider } from '@/providers/ToastProvider';
import type { AuthUser } from '@/types';

const replace = vi.fn();
const login = vi.fn();
const register = vi.fn();
const logout = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ user: null, isReady: true, login, register, logout }),
}));

const household: AuthUser = { id: 'u1', email: 'valentina@correo.com', name: 'Valentina', role: 'household' };

const renderForm = (portal: 'user' | 'admin' = 'user') =>
  render(
    <ToastProvider>
      <AuthForm portal={portal} />
    </ToastProvider>,
  );

const fillLogin = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Correo electrónico'), 'valentina@correo.com');
  await user.type(screen.getByLabelText('Contraseña'), 'secreto1');
};

beforeEach(() => {
  [replace, login, register, logout].forEach((fn) => fn.mockReset());
});

test('shows a validation error and does not call login with an invalid email', async () => {
  const user = userEvent.setup();
  renderForm();

  await user.type(screen.getByLabelText('Correo electrónico'), 'valentina');
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión →' }));

  expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument();
});

test('does not call login when validation fails', async () => {
  const user = userEvent.setup();
  renderForm();

  await user.click(screen.getByRole('button', { name: 'Iniciar sesión →' }));

  expect(login).not.toHaveBeenCalled();
});

test('logs in and goes to the user portal', async () => {
  login.mockResolvedValue(household);
  const user = userEvent.setup();
  renderForm();

  await fillLogin(user);
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión →' }));

  expect(replace).toHaveBeenCalledWith('/user');
});

test('disables the submit button while the request is in flight', async () => {
  login.mockReturnValue(new Promise(() => {}));
  const user = userEvent.setup();
  renderForm();

  await fillLogin(user);
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión →' }));

  expect(screen.getByRole('button', { name: 'Ingresando…' })).toBeDisabled();
});

test('shows the server error in a toast when login fails', async () => {
  login.mockRejectedValue(new Error('Correo o contraseña incorrectos'));
  const user = userEvent.setup();
  renderForm();

  await fillLogin(user);
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión →' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
});

test('logs out a household account that signs in on the admin portal', async () => {
  login.mockResolvedValue(household);
  const user = userEvent.setup();
  renderForm('admin');

  await fillLogin(user);
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión →' }));

  expect(logout).toHaveBeenCalled();
});

test('register rejects passwords that do not match', async () => {
  const user = userEvent.setup();
  renderForm();

  await user.click(screen.getByRole('button', { name: 'Registrarme' }));
  await user.type(screen.getByLabelText('Nombre completo'), 'Valentina Ríos');
  await fillLogin(user);
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'distinta');
  await user.click(screen.getByRole('button', { name: 'Crear cuenta →' }));

  expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
});

test('the admin portal does not offer self-registration', () => {
  renderForm('admin');
  expect(screen.queryByRole('button', { name: 'Registrarme' })).not.toBeInTheDocument();
});
