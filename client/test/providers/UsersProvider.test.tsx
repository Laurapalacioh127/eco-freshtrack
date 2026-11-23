import { renderHook, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { UsersProvider, useUsers } from '@/providers/UsersProvider';

const get = vi.fn();

vi.mock('@/providers/AxiosProvider', () => ({ useAxios: () => ({ get }) }));

const me = { id: 'u1', name: 'Valentina', email: 'v@correo.com', role: 'household', points: 120, kgSaved: 3.5 };

test('loads the profile from /api/users/me', async () => {
  get.mockResolvedValue({ data: me });
  renderHook(() => useUsers(), { wrapper: UsersProvider });
  await waitFor(() => expect(get).toHaveBeenCalledWith('/api/users/me'));
});

test('exposes the signed-in profile as me', async () => {
  get.mockResolvedValue({ data: me });
  const { result } = renderHook(() => useUsers(), { wrapper: UsersProvider });
  await waitFor(() => expect(result.current.me?.points).toBe(120));
});

test('exposes the error message when the request fails', async () => {
  get.mockRejectedValue(new Error('Tu sesión expiró, inicia sesión de nuevo'));
  const { result } = renderHook(() => useUsers(), { wrapper: UsersProvider });
  await waitFor(() => expect(result.current.error).toBe('Tu sesión expiró, inicia sesión de nuevo'));
});
