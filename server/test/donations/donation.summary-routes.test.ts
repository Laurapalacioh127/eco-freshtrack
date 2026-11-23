process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, HOUSEHOLD, mockAuthModules } from '../helpers/auth';

mockAuthModules();

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const summary = { totalDonations: 5, pendingDonations: 1, approvedDonations: 2, completedDonations: 2 };
const findDonationSummaryRepository = mock.fn<AsyncFn>(async () => summary);

mock.module('../../src/features/notifications/notification.service', {
  namedExports: {
    notifyRoleService: mock.fn(async () => {}),
    notifyRecipeAuthorService: mock.fn(async () => {}),
    notifyDonationOwnerService: mock.fn(async () => {}),
    getNotificationsService: mock.fn(),
    markNotificationAsReadService: mock.fn(),
  },
});

mock.module('../../src/features/donations/donation.repository', {
  namedExports: {
    findAllDonationsRepository: mock.fn(),
    findDonationByIdRepository: mock.fn(),
    findDonationSummaryRepository,
    createDonationRepository: mock.fn(),
    updateDonationStatusRepository: mock.fn(),
  },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

beforeEach(() => {
  findDonationSummaryRepository.mock.resetCalls();
});

test('GET /api/donations/summary returns the four counts from the repository', async () => {
  const res = await request(app).get('/api/donations/summary').set(authHeader('household'));

  assert.deepEqual(res.body, summary);
});

test('GET /api/donations/summary scopes a household to its own id', async () => {
  await request(app).get('/api/donations/summary').set(authHeader('household'));

  assert.deepEqual(findDonationSummaryRepository.mock.calls[0].arguments, [HOUSEHOLD.id]);
});

test('GET /api/donations/summary passes null for an admin', async () => {
  await request(app).get('/api/donations/summary').set(authHeader('admin'));

  assert.deepEqual(findDonationSummaryRepository.mock.calls[0].arguments, [null]);
});

test('GET /api/donations/summary returns 401 without a token', async () => {
  const res = await request(app).get('/api/donations/summary');

  assert.equal(res.status, 401);
});
