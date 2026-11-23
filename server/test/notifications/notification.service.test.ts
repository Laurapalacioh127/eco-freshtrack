import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const findNotificationsByUserRepository = mock.fn<AsyncFn>();
const markNotificationAsReadRepository = mock.fn<AsyncFn>();
const createNotificationsForRoleRepository = mock.fn<AsyncFn>();
const createNotificationForRecipeAuthorRepository = mock.fn<AsyncFn>();
const createNotificationForDonationOwnerRepository = mock.fn<AsyncFn>();
const broadcast = mock.fn<AsyncFn>(async () => undefined);
const consoleError = mock.method(console, 'error', () => {});

mock.module('../../src/features/notifications/notification.repository', {
  namedExports: {
    findNotificationsByUserRepository,
    markNotificationAsReadRepository,
    createNotificationsForRoleRepository,
    createNotificationForRecipeAuthorRepository,
    createNotificationForDonationOwnerRepository,
  },
});
mock.module('../../src/config/realtime', {
  namedExports: {
    broadcast,
    REALTIME: {
      notifications: { channel: 'notifications', created: 'notification-created' },
    },
  },
});

type Mod = typeof import('../../src/features/notifications/notification.service.js');
let service: Mod;
before(async () => {
  service = await import('../../src/features/notifications/notification.service.js');
});

const UUID = '00000000-0000-4000-8000-000000000701';
const row = { id: UUID, type: 'recipe-submitted', message: 'Hola', read: false, createdAt: '2026-01-01T00:00:00.000Z' };

beforeEach(() => {
  for (const fn of [
    findNotificationsByUserRepository,
    markNotificationAsReadRepository,
    createNotificationsForRoleRepository,
    createNotificationForRecipeAuthorRepository,
    createNotificationForDonationOwnerRepository,
    broadcast,
    consoleError,
  ]) {
    fn.mock.resetCalls();
  }
});

test('getNotificationsService returns the rows of the repository for that user', async () => {
  findNotificationsByUserRepository.mock.mockImplementation(async () => [row]);

  const result = await service.getNotificationsService('u1');

  assert.deepEqual(result, [row]);
  assert.deepEqual(findNotificationsByUserRepository.mock.calls[0].arguments, ['u1']);
});

test('markNotificationAsReadService throws 404 for a non-UUID id without touching the database', async () => {
  await assert.rejects(
    () => service.markNotificationAsReadService('u1', 'abc'),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
  assert.equal(markNotificationAsReadRepository.mock.callCount(), 0);
});

test('markNotificationAsReadService throws 404 when the notification is not found for that user', async () => {
  markNotificationAsReadRepository.mock.mockImplementation(async () => undefined);

  await assert.rejects(
    () => service.markNotificationAsReadService('u1', UUID),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
});

test('markNotificationAsReadService returns the read notification', async () => {
  markNotificationAsReadRepository.mock.mockImplementation(async () => ({ ...row, read: true }));

  const result = await service.markNotificationAsReadService('u1', UUID);

  assert.deepEqual(result, { ...row, read: true });
});

test('markNotificationAsReadService scopes the repository call to the user and id', async () => {
  markNotificationAsReadRepository.mock.mockImplementation(async () => ({ ...row, read: true }));

  await service.markNotificationAsReadService('u1', UUID);

  assert.deepEqual(markNotificationAsReadRepository.mock.calls[0].arguments, ['u1', UUID]);
});

test('notifyRoleService broadcasts one notification-created per created row', async () => {
  createNotificationsForRoleRepository.mock.mockImplementation(async () => [
    { id: 'n1', userId: 'a1' },
    { id: 'n2', userId: 'a2' },
  ]);

  await service.notifyRoleService('admin', 'recipe-submitted', 'Nueva receta de Ana');

  assert.deepEqual(
    broadcast.mock.calls.map((call) => call.arguments),
    [
      ['notifications', 'notification-created', { id: 'n1', userId: 'a1' }],
      ['notifications', 'notification-created', { id: 'n2', userId: 'a2' }],
    ],
  );
});

test('notifyRoleService does not broadcast when no user has the role', async () => {
  createNotificationsForRoleRepository.mock.mockImplementation(async () => []);

  await service.notifyRoleService('admin', 'recipe-submitted', 'Nueva receta de Ana');

  assert.equal(broadcast.mock.callCount(), 0);
});

test('notifyRoleService resolves and does not broadcast when the repository throws', async () => {
  createNotificationsForRoleRepository.mock.mockImplementation(async () => {
    throw new Error('db down');
  });

  await assert.doesNotReject(() => service.notifyRoleService('admin', 'recipe-submitted', 'x'));
  assert.equal(broadcast.mock.callCount(), 0);
});

test('notifyRoleService logs the error when the repository throws', async () => {
  createNotificationsForRoleRepository.mock.mockImplementation(async () => {
    throw new Error('db down');
  });

  await service.notifyRoleService('admin', 'recipe-submitted', 'x');

  assert.equal(consoleError.mock.callCount(), 1);
});

test('notifyRecipeAuthorService does not broadcast nor throw when the recipe has no author', async () => {
  createNotificationForRecipeAuthorRepository.mock.mockImplementation(async () => undefined);

  await assert.doesNotReject(() => service.notifyRecipeAuthorService(UUID, 'recipe-reviewed', 'x'));
  assert.equal(broadcast.mock.callCount(), 0);
});

test('notifyDonationOwnerService broadcasts the id and userId of the created notification', async () => {
  createNotificationForDonationOwnerRepository.mock.mockImplementation(async () => ({ id: 'n7', userId: 'u7' }));

  await service.notifyDonationOwnerService(UUID, 'donation-status-changed', 'x');

  assert.deepEqual(broadcast.mock.calls.map((call) => call.arguments), [
    ['notifications', 'notification-created', { id: 'n7', userId: 'u7' }],
  ]);
});
