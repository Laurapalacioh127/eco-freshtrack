import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { ProductsProvider, useProducts, type CreateProductInput } from '@/providers/ProductsProvider';

const get = vi.fn();
const post = vi.fn();
const axiosMock = { get, post };
vi.mock('@/providers/AxiosProvider', () => ({ useAxios: () => axiosMock }));

const kiwi = { id: 'p1', name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10, substitutes: [] };

const input: CreateProductInput = { name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10, substitutes: [] };

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  get.mockResolvedValue({ data: [] });
});

const renderLoaded = async () => {
  const view = renderHook(() => useProducts(), { wrapper: ProductsProvider });
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
};

test('createProduct posts to /api/products and returns the created product', async () => {
  post.mockResolvedValue({ data: kiwi });
  const { result } = await renderLoaded();

  let created;
  await act(async () => {
    created = await result.current.createProduct(input);
  });

  expect(created).toEqual(kiwi);
  expect(post).toHaveBeenCalledWith('/api/products', input);
});

test('createProduct does not duplicate a product with the same id', async () => {
  post.mockResolvedValue({ data: kiwi });
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.createProduct(input);
    await result.current.createProduct(input);
  });

  expect(result.current.products).toEqual([kiwi]);
});

test('createProduct rejects and keeps the list when the request fails', async () => {
  post.mockRejectedValue(new Error('boom'));
  const { result } = await renderLoaded();

  await expect(
    act(async () => {
      await result.current.createProduct(input);
    }),
  ).rejects.toThrow('boom');
  expect(result.current.products).toEqual([]);
});
