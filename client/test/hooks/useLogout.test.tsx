import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { useLogout } from '@/hooks/useLogout';
import { ToastProvider } from '@/providers/ToastProvider';

const replace = vi.fn();
const logout = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ logout }) }));

const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

beforeEach(() => {
  replace.mockReset();
  logout.mockReset();
});

test('calls logout once', () => {
  const { result } = renderHook(() => useLogout('user'), { wrapper });

  result.current();

  expect(logout).toHaveBeenCalledTimes(1);
});

test('redirects the user portal to its login', () => {
  const { result } = renderHook(() => useLogout('user'), { wrapper });

  result.current();

  expect(replace).toHaveBeenCalledWith('/login/user');
});

test('redirects the admin portal to its login', () => {
  const { result } = renderHook(() => useLogout('admin'), { wrapper });

  result.current();

  expect(replace).toHaveBeenCalledWith('/login/admin');
});
