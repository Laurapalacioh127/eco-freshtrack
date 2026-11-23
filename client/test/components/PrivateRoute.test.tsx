import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { PrivateRoute } from '@/components/PrivateRoute/PrivateRoute';
import type { AuthUser } from '@/types';

const replace = vi.fn();
let auth: { user: AuthUser | null; isReady: boolean } = { user: null, isReady: true };

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/providers/AuthProvider', () => ({ useAuth: () => auth }));

const household: AuthUser = { id: 'u1', email: 'v@correo.com', name: 'Valentina', role: 'household' };

beforeEach(() => {
  replace.mockReset();
});

test('redirects to the admin login when there is no session', () => {
  auth = { user: null, isReady: true };
  render(<PrivateRoute role="admin">contenido</PrivateRoute>);
  expect(replace).toHaveBeenCalledWith('/login/admin');
});

test('redirects to the user login when there is no session', () => {
  auth = { user: null, isReady: true };
  render(<PrivateRoute role="household">contenido</PrivateRoute>);
  expect(replace).toHaveBeenCalledWith('/login/user');
});

test('redirects a household user away from the admin portal to the admin login', () => {
  auth = { user: household, isReady: true };
  render(<PrivateRoute role="admin">contenido</PrivateRoute>);
  expect(replace).toHaveBeenCalledWith('/login/admin');
});

test('renders the children for the right role', () => {
  auth = { user: household, isReady: true };
  render(<PrivateRoute role="household">contenido</PrivateRoute>);
  expect(screen.getByText('contenido')).toBeInTheDocument();
});

test('waits for hydration before redirecting', () => {
  auth = { user: null, isReady: false };
  render(<PrivateRoute role="household">contenido</PrivateRoute>);
  expect(replace).not.toHaveBeenCalled();
});
