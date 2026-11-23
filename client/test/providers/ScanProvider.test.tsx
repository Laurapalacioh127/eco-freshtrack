import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { ScanProvider, useScan } from '@/providers/ScanProvider';

const get = vi.fn();
const axiosMock = { get };
vi.mock('@/providers/AxiosProvider', () => ({ useAxios: () => axiosMock }));

const product = { code: '7702001043276', name: 'Leche entera', category: 'Lácteos', imageUrl: null };
const notFound = new Error('No encontramos un producto con ese código de barras');

const renderScan = (code: string | null) =>
  renderHook(() => useScan(), {
    wrapper: ({ children }: { children: ReactNode }) => <ScanProvider code={code}>{children}</ScanProvider>,
  });

beforeEach(() => get.mockReset());

test('requests the barcode endpoint and exposes the product', async () => {
  get.mockResolvedValue({ data: product });
  const { result } = renderScan('7702001043276');

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(get).toHaveBeenCalledWith('/api/products/barcode/7702001043276');
  expect(result.current.product).toEqual(product);
});

test('exposes the error message and no product on 404', async () => {
  get.mockImplementationOnce(async () => {
    throw notFound;
  });
  const { result } = renderScan('7702001043276');

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBe('No encontramos un producto con ese código de barras');
  expect(result.current.product).toBeNull();
});

test('does not request anything for a null code', async () => {
  const { result } = renderScan(null);

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(get).not.toHaveBeenCalled();
  expect(result.current.error).toBe('El código de barras no es válido');
});

test('retry requests the product again', async () => {
  get
    .mockImplementationOnce(async () => {
      throw notFound;
    })
    .mockResolvedValueOnce({ data: product });
  const { result } = renderScan('7702001043276');
  await waitFor(() => expect(result.current.error).not.toBeNull());

  act(() => result.current.retry());
  await waitFor(() => expect(result.current.product).toEqual(product));

  expect(get).toHaveBeenCalledTimes(2);
});
