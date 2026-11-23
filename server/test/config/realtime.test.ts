import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const httpSend = mock.fn<AsyncFn>();
const removeChannel = mock.fn<AsyncFn>(async () => 'ok');
const channel = mock.fn(() => ({ httpSend }));
let adminFactory: () => unknown = () => ({ channel, removeChannel });

mock.module('../../src/config/supabase', {
  namedExports: { getSupabaseAdmin: () => adminFactory() },
});

type Mod = typeof import('../../src/config/realtime.js');
let broadcast: Mod['broadcast'];
before(async () => {
  ({ broadcast } = await import('../../src/config/realtime.js'));
});

const consoleError = mock.method(console, 'error', () => {});

beforeEach(() => {
  httpSend.mock.resetCalls();
  removeChannel.mock.resetCalls();
  channel.mock.resetCalls();
  consoleError.mock.resetCalls();
  httpSend.mock.mockImplementation(async () => ({ success: true }));
  adminFactory = () => ({ channel, removeChannel });
});

test('broadcast sends the event and payload on the named channel', async () => {
  await broadcast('donations', 'donation-created', { id: 'd1' });

  assert.deepEqual(channel.mock.calls[0].arguments, ['donations']);
  assert.deepEqual(httpSend.mock.calls[0].arguments, ['donation-created', { id: 'd1' }]);
});

test('broadcast removes the channel after sending', async () => {
  await broadcast('donations', 'donation-created', { id: 'd1' });

  assert.equal(removeChannel.mock.callCount(), 1);
});

test('broadcast logs instead of throwing when httpSend rejects', async () => {
  httpSend.mock.mockImplementation(async () => {
    throw new Error('network down');
  });

  await assert.doesNotReject(() => broadcast('recipes', 'recipe-reviewed', { id: 'r1' }));
  assert.equal(consoleError.mock.callCount(), 1);
  assert.equal(removeChannel.mock.callCount(), 1);
});

test('broadcast logs when Supabase answers with success false', async () => {
  httpSend.mock.mockImplementation(async () => ({ success: false, status: 500, error: 'boom' }));

  await broadcast('recipes', 'recipe-reviewed', { id: 'r1' });

  assert.equal(consoleError.mock.callCount(), 1);
});

test('broadcast logs instead of throwing when Supabase is not configured', async () => {
  adminFactory = () => {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
  };

  await assert.doesNotReject(() => broadcast('donations', 'donation-created', { id: 'd1' }));
  assert.equal(consoleError.mock.callCount(), 1);
});
