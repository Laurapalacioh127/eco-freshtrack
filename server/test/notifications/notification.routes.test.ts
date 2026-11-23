process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { ADMIN, authHeader, HOUSEHOLD, mockAuthModules } from '../helpers/auth';

mockAuthModules();

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const UUID = '00000000-0000-4000-8000-000000000701';
const row = { id: UUID, type: 'recipe-submitted', message: 'Hola', read: false, createdAt: '2026-01-01T00:00:00.000Z' };

const findNotificationsByUserRepository = mock.fn<AsyncFn>(async () => [row]);
const markNotificationAsReadRepository = mock.fn<AsyncFn>(async () => ({ ...row, read: true }));

mock.module('../../src/features/notifications/notification.repository', {
  namedExports: {
    findNotificationsByUserRepository,
    markNotificationAsReadRepository,
    createNotificationsForRoleRepository: mock.fn(),
    createNotificationForRecipeAuthorRepository: mock.fn(),
    createNotificationForDonationOwnerRepository: mock.fn(),
  },
});
mock.module('../../src/config/realtime', {
  namedExports: {
    broadcast: mock.fn(async () => undefined),
    REALTIME: {
      donations: { channel: 'donations', created: 'donation-created', statusChanged: 'donation-status-changed' },
      recipes: { channel: 'recipes', submitted: 'recipe-submitted', reviewed: 'recipe-reviewed' },
      notifications: { channel: 'notifications', created: 'notification-created' },
    },
  },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

beforeEach(() => {
  findNotificationsByUserRepository.mock.resetCalls();
  markNotificationAsReadRepository.mock.resetCalls();
  markNotificationAsReadRepository.mock.mockImplementation(async () => ({ ...row, read: true }));
});

test('GET /api/notifications returns 401 without a token', async () => {
  const res = await request(app).get('/api/notifications');

  assert.equal(res.status, 401);
});

test('GET /api/notifications returns 200 with the array', async () => {
  const res = await request(app).get('/api/notifications').set(authHeader('household'));

  assert.deepEqual(res.body, [row]);
});

test('GET /api/notifications reads the notifications of the token user', async () => {
  await request(app).get('/api/notifications').set(authHeader('household'));

  assert.deepEqual(findNotificationsByUserRepository.mock.calls[0].arguments, [HOUSEHOLD.id]);
});

test('GET /api/notifications works for an admin', async () => {
  const res = await request(app).get('/api/notifications').set(authHeader('admin'));

  assert.equal(res.status, 200);
});

test('PATCH /api/notifications/:id/read returns 401 without a token', async () => {
  const res = await request(app).patch(`/api/notifications/${UUID}/read`);

  assert.equal(res.status, 401);
});

test('PATCH /api/notifications/abc/read returns 404 Notification not found', async () => {
  const res = await request(app).patch('/api/notifications/abc/read').set(authHeader('household'));

  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'Notification not found');
});

test('PATCH /api/notifications/:id/read returns 404 when the notification is not the caller\'s', async () => {
  markNotificationAsReadRepository.mock.mockImplementation(async () => undefined);

  const res = await request(app).patch(`/api/notifications/${UUID}/read`).set(authHeader('other'));

  assert.equal(res.status, 404);
});

test('PATCH /api/notifications/:id/read returns 200 with the notification marked as read', async () => {
  const res = await request(app).patch(`/api/notifications/${UUID}/read`).set(authHeader('household'));

  assert.equal(res.body.read, true);
});

test('PATCH /api/notifications/:id/read scopes the update to the token user', async () => {
  await request(app).patch(`/api/notifications/${UUID}/read`).set(authHeader('household'));

  assert.deepEqual(markNotificationAsReadRepository.mock.calls[0].arguments, [HOUSEHOLD.id, UUID]);
});

test('PATCH /api/notifications/:id/read works for an admin', async () => {
  const res = await request(app).patch(`/api/notifications/${UUID}/read`).set(authHeader('admin'));

  assert.equal(res.status, 200);
  assert.equal(markNotificationAsReadRepository.mock.calls[0].arguments[0], ADMIN.id);
});
