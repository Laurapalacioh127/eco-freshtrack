import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { DonationsProvider, useDonations } from '@/providers/DonationsProvider';
import type { BroadcastHandlers } from '@/utils/realtime';

const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
const unsubscribe = vi.fn();
const subscriptions: { channel: string; handlers: BroadcastHandlers }[] = [];
let role: 'admin' | 'household' = 'admin';

// One stable object, like the memoized instance from the real AxiosProvider.
const axiosMock = { get, post, patch };
vi.mock('@/providers/AxiosProvider', () => ({ useAxios: () => axiosMock }));
vi.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ user: { id: 'u1', role } }) }));
vi.mock('@/utils/realtime', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/realtime')>()),
  subscribeToBroadcast: (channel: string, handlers: BroadcastHandlers) => {
    subscriptions.push({ channel, handlers });
    return unsubscribe;
  },
}));

const summary = { kgRescued: 1, dailyGoalPercent: 10, families: 1, deliveries: 1, pendingDonations: 0 };
const donation = { id: 'd1', donorName: 'Ana', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy', status: 'pending' };

const emit = async (event: string, payload: unknown) => {
  const handler = subscriptions.at(-1)?.handlers[event];
  await act(async () => handler?.(payload));
};

const renderLoaded = async () => {
  const view = renderHook(() => useDonations(), { wrapper: DonationsProvider });
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
};

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  patch.mockReset();
  unsubscribe.mockReset();
  subscriptions.length = 0;
  role = 'admin';
  get.mockImplementation(async (url: string) =>
    url === '/api/donations' ? { data: [] } : url === '/api/donations/summary' ? { data: summary } : { data: donation },
  );
});

test('subscribes to the donations channel', async () => {
  await renderLoaded();

  expect(subscriptions[0].channel).toBe('donations');
});

test('adds a donation once even when donation-created arrives twice', async () => {
  const { result } = await renderLoaded();

  await emit('donation-created', donation);
  await emit('donation-created', donation);

  expect(result.current.donations).toHaveLength(1);
});

test('replaces the donation in place on donation-status-changed', async () => {
  const { result } = await renderLoaded();
  await emit('donation-created', donation);

  await emit('donation-status-changed', { ...donation, status: 'approved' });

  expect(result.current.donations).toEqual([{ ...donation, status: 'approved' }]);
});

test('keeps one copy when the HTTP response and the event deliver the same donation', async () => {
  post.mockResolvedValue({ data: donation });
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.createDonation({ zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy' });
  });
  await emit('donation-created', donation);

  expect(result.current.donations).toHaveLength(1);
});

test('households re-read an event through the scoped API before showing it', async () => {
  role = 'household';
  await renderLoaded();

  await emit('donation-created', { id: 'd1' });

  expect(get).toHaveBeenCalledWith('/api/donations/d1');
});

test('households ignore donations the API does not return to them', async () => {
  role = 'household';
  get.mockImplementation(async (url: string) => {
    if (url === '/api/donations') return { data: [] };
    if (url === '/api/donations/summary') return { data: summary };
    throw Object.assign(new Error('Donation not found'), { response: { status: 404 } });
  });
  const { result } = await renderLoaded();

  await emit('donation-created', donation);

  expect(result.current.donations).toHaveLength(0);
});

test('ignores payloads without an id', async () => {
  const { result } = await renderLoaded();

  await emit('donation-created', { status: 'pending' });

  expect(result.current.donations).toHaveLength(0);
});

test('removes the channel on unmount', async () => {
  const { unmount } = await renderLoaded();

  unmount();

  expect(unsubscribe).toHaveBeenCalledTimes(1);
});
