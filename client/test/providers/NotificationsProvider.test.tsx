import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { NotificationsProvider, useNotifications } from '@/providers/NotificationsProvider';
import type { BroadcastHandlers } from '@/utils/realtime';

const get = vi.fn();
const patch = vi.fn();
const unsubscribe = vi.fn();
const subscriptions: { channel: string; handlers: BroadcastHandlers }[] = [];

const axiosMock = { get, patch };
vi.mock('@/providers/AxiosProvider', () => ({ useAxios: () => axiosMock }));
vi.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ user: { id: 'u1', role: 'household' } }) }));
vi.mock('@/utils/realtime', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/realtime')>()),
  subscribeToBroadcast: (channel: string, handlers: BroadcastHandlers) => {
    subscriptions.push({ channel, handlers });
    return unsubscribe;
  },
}));

const n1 = { id: 'n1', type: 'recipe-reviewed', message: 'Uno', read: false, createdAt: '2026-01-01T10:00:00.000Z' };
const n2 = { id: 'n2', type: 'recipe-reviewed', message: 'Dos', read: true, createdAt: '2026-01-03T10:00:00.000Z' };
const n3 = { id: 'n3', type: 'recipe-reviewed', message: 'Tres', read: false, createdAt: '2026-01-02T10:00:00.000Z' };
const n9 = { id: 'n9', type: 'recipe-reviewed', message: 'Nueve', read: false, createdAt: '2026-01-04T10:00:00.000Z' };

const emit = async (payload: unknown) => {
  const handler = subscriptions.at(-1)?.handlers['notification-created'];
  await act(async () => handler?.(payload));
};

const renderLoaded = async () => {
  const view = renderHook(() => useNotifications(), { wrapper: NotificationsProvider });
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
};

beforeEach(() => {
  get.mockReset();
  patch.mockReset();
  unsubscribe.mockReset();
  subscriptions.length = 0;
  get.mockResolvedValue({ data: [n1, n2, n3] });
});

test('subscribes to the notifications channel', async () => {
  await renderLoaded();

  expect(subscriptions[0].channel).toBe('notifications');
});

test('lists notifications newest first', async () => {
  const { result } = await renderLoaded();

  expect(result.current.notifications.map((n) => n.id)).toEqual(['n2', 'n3', 'n1']);
});

test('counts the unread notifications', async () => {
  const { result } = await renderLoaded();

  expect(result.current.unreadCount).toBe(2);
});

test('sets the error and stops loading when the request fails', async () => {
  get.mockRejectedValue(new Error('boom'));

  const { result } = await renderLoaded();

  expect(result.current.error).toBe('boom');
});

test('ignores events addressed to another user', async () => {
  await renderLoaded();
  get.mockClear();

  await emit({ id: 'n9', userId: 'u2' });

  expect(get).not.toHaveBeenCalled();
});

test('does not refetch for an id it already knows', async () => {
  await renderLoaded();
  get.mockClear();

  await emit({ id: 'n1', userId: 'u1' });

  expect(get).not.toHaveBeenCalled();
});

test('keeps the list length when the event repeats a known id', async () => {
  const { result } = await renderLoaded();

  await emit({ id: 'n1', userId: 'u1' });

  expect(result.current.notifications).toHaveLength(3);
});

test('shows a notification once when its event arrives twice', async () => {
  const { result } = await renderLoaded();
  get.mockResolvedValue({ data: [n1, n2, n3, n9] });

  await emit({ id: 'n9', userId: 'u1' });
  await emit({ id: 'n9', userId: 'u1' });

  expect(result.current.notifications.filter((n) => n.id === 'n9')).toHaveLength(1);
});

test('ignores payloads that are not objects with an id', async () => {
  await renderLoaded();
  get.mockClear();

  await emit(null);
  await emit({});

  expect(get).not.toHaveBeenCalled();
});

test('markAsRead patches the notification endpoint', async () => {
  patch.mockResolvedValue({ data: { ...n1, read: true } });
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.markAsRead('n1');
  });

  expect(patch).toHaveBeenCalledWith('/api/notifications/n1/read');
});

test('markAsRead marks the item as read and lowers the unread count by one', async () => {
  patch.mockResolvedValue({ data: { ...n1, read: true } });
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.markAsRead('n1');
  });

  expect(result.current.unreadCount).toBe(1);
});

test('markAsRead does not call the API for an already read item', async () => {
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.markAsRead('n2');
  });

  expect(patch).not.toHaveBeenCalled();
});

test('removes the channel on unmount', async () => {
  const { unmount } = await renderLoaded();

  unmount();

  expect(unsubscribe).toHaveBeenCalledTimes(1);
});
