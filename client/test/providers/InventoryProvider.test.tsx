import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { InventoryProvider, useInventory } from '@/providers/InventoryProvider';

const get = vi.fn();
const post = vi.fn();

// One stable object, like the memoized instance from the real AxiosProvider.
const axiosMock = { get, post };
vi.mock('@/providers/AxiosProvider', () => ({ useAxios: () => axiosMock }));

const summary = { registered: 0, expiringSoon: 0, expired: 0 };
const item = { id: 'i1', name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresInDays: 5, status: 'ok' };
const input = { name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresOn: '2030-01-15' };

const renderLoaded = async () => {
  const view = renderHook(() => useInventory(), { wrapper: InventoryProvider });
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
};

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  get.mockImplementation(async (url: string) =>
    url === '/api/inventory/summary' ? { data: summary } : { data: [] },
  );
});

test('addItem posts the input to /api/inventory', async () => {
  post.mockResolvedValue({ data: item });
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.addItem(input);
  });

  expect(post).toHaveBeenCalledWith('/api/inventory', input);
});

test('addItem adds the created item to items', async () => {
  post.mockResolvedValue({ data: item });
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.addItem(input);
  });

  expect(result.current.items).toEqual([item]);
});

test('addItem keeps one copy when the same id comes back twice', async () => {
  post.mockResolvedValue({ data: item });
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.addItem(input);
    await result.current.addItem(input);
  });

  expect(result.current.items).toHaveLength(1);
});

test('addItem refreshes the summary', async () => {
  post.mockResolvedValue({ data: item });
  const { result } = await renderLoaded();
  const updated = { registered: 1, expiringSoon: 0, expired: 0 };
  get.mockImplementation(async (url: string) => (url === '/api/inventory/summary' ? { data: updated } : { data: [] }));

  await act(async () => {
    await result.current.addItem(input);
  });

  await waitFor(() => expect(result.current.summary).toEqual(updated));
});

test('addItem rejects with the error message when the post fails', async () => {
  post.mockRejectedValue(new Error('El campo "nombre" es obligatorio'));
  const { result } = await renderLoaded();

  await expect(result.current.addItem(input)).rejects.toThrow('El campo "nombre" es obligatorio');
});

test('items stays empty when the post fails', async () => {
  post.mockRejectedValue(new Error('boom'));
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.addItem(input).catch(() => undefined);
  });

  expect(result.current.items).toEqual([]);
});
