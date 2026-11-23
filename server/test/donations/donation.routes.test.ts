import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, HOUSEHOLD, mockAuthModules } from '../helpers/auth';

mockAuthModules();

const findAllDonationsRepository = mock.fn(async (_status?: string) => []);
const findDonationByIdRepository = mock.fn(async () => undefined);
const findDonationSummaryRepository = mock.fn(async () => ({
  kgRescued: 48.6, dailyGoalPercent: 81, families: 24, deliveries: 7, pendingDonations: 1,
}));

mock.module('../../src/features/donations/donation.repository', {
  namedExports: { findAllDonationsRepository, findDonationByIdRepository, findDonationSummaryRepository },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

test('GET /api/donations?status=approved passes the status to the repository', async () => {
  await request(app).get('/api/donations?status=approved').set(authHeader('household'));

  assert.deepEqual(findAllDonationsRepository.mock.calls[0].arguments, [HOUSEHOLD.id, 'approved']);
});

test('GET /api/donations/summary is not captured by /:id', async () => {
  const res = await request(app).get('/api/donations/summary').set(authHeader('household'));

  assert.equal(res.status, 200);
  assert.equal(res.body.pendingDonations, 1);
});

test('GET /api/donations/:id returns 404 for a non-UUID id', async () => {
  const res = await request(app).get('/api/donations/d1').set(authHeader('household'));

  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'Donation not found');
});
