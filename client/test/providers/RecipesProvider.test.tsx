import { act, renderHook, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, expect, test, vi } from 'vitest';
import { RecipesProvider, useRecipes } from '@/providers/RecipesProvider';
import type { BroadcastHandlers } from '@/utils/realtime';

const get = vi.fn();
const patch = vi.fn();
const unsubscribe = vi.fn();
const subscriptions: { channel: string; handlers: BroadcastHandlers }[] = [];
let role: 'admin' | 'household' = 'admin';

// One stable object, like the memoized instance from the real AxiosProvider.
const axiosMock = { get, patch };
vi.mock('@/providers/AxiosProvider', () => ({ useAxios: () => axiosMock }));
vi.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ user: { id: 'u1', role } }) }));
vi.mock('@/utils/realtime', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/realtime')>()),
  subscribeToBroadcast: (channel: string, handlers: BroadcastHandlers) => {
    subscriptions.push({ channel, handlers });
    return unsubscribe;
  },
}));

const recipe = {
  id: 'r1', title: 'Sopa', author: 'Ana', minutes: 30, difficulty: 'Fácil', servings: 2,
  ingredientsAvailable: 2, ingredientsTotal: 2, status: 'pending', ingredients: ['Papa'], steps: ['Hervir'],
};

const notFound = () =>
  new AxiosError('Recipe not found', '404', undefined, undefined, {
    status: 404, statusText: 'Not Found', data: {}, headers: {}, config: { headers: new AxiosHeaders() },
  });

const emit = async (event: string, payload: unknown) => {
  const handler = subscriptions.at(-1)?.handlers[event];
  await act(async () => handler?.(payload));
};

const renderLoaded = async () => {
  const view = renderHook(() => useRecipes(), { wrapper: RecipesProvider });
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
};

beforeEach(() => {
  get.mockReset();
  patch.mockReset();
  unsubscribe.mockReset();
  subscriptions.length = 0;
  role = 'admin';
  get.mockResolvedValue({ data: [] });
});

test('subscribes to the recipes channel', async () => {
  await renderLoaded();

  expect(subscriptions[0].channel).toBe('recipes');
});

test('adds a recipe once even when recipe-submitted arrives twice', async () => {
  const { result } = await renderLoaded();

  await emit('recipe-submitted', recipe);
  await emit('recipe-submitted', recipe);

  expect(result.current.recipes).toHaveLength(1);
});

test('updates the status in place on recipe-reviewed', async () => {
  const { result } = await renderLoaded();
  await emit('recipe-submitted', recipe);

  await emit('recipe-reviewed', { ...recipe, status: 'approved' });

  expect(result.current.recipes[0].status).toBe('approved');
});

test('keeps one copy when the moderation response and the event deliver the same recipe', async () => {
  get.mockResolvedValue({ data: [recipe] });
  patch.mockResolvedValue({ data: { ...recipe, status: 'rejected' } });
  const { result } = await renderLoaded();

  await act(async () => {
    await result.current.moderateRecipe('r1', 'rejected');
  });
  await emit('recipe-reviewed', { ...recipe, status: 'rejected' });

  expect(result.current.recipes).toHaveLength(1);
});

test('households show the version returned by the scoped API', async () => {
  role = 'household';
  get.mockImplementation(async (url: string) =>
    url === '/api/recipes' ? { data: [recipe] } : { data: { ...recipe, status: 'approved' } },
  );
  const { result } = await renderLoaded();

  await emit('recipe-reviewed', { id: 'r1' });

  expect(result.current.recipes[0].status).toBe('approved');
});

test('households drop a recipe that is no longer visible to them', async () => {
  role = 'household';
  get.mockImplementation(async (url: string) => {
    if (url === '/api/recipes') return { data: [recipe] };
    throw notFound();
  });
  const { result } = await renderLoaded();

  await emit('recipe-reviewed', { ...recipe, status: 'rejected' });

  expect(result.current.recipes).toHaveLength(0);
});

test('removes the channel on unmount', async () => {
  const { unmount } = await renderLoaded();

  unmount();

  expect(unsubscribe).toHaveBeenCalledTimes(1);
});
