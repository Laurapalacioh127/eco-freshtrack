process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, HOUSEHOLD, mockAuthModules } from '../helpers/auth';

mockAuthModules();

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const ID = '00000000-0000-4000-8000-000000000501';
const donation = {
  id: ID, donorName: 'Hogar', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy', status: 'pending',
};
const createDonationRepository = mock.fn<AsyncFn>(async () => donation);
const updateDonationStatusRepository = mock.fn<AsyncFn>(async () => ({ ...donation, status: 'approved' }));

mock.module('../../src/features/donations/donation.repository', {
  namedExports: {
    createDonationRepository,
    updateDonationStatusRepository,
    findAllDonationsRepository: mock.fn(),
    findDonationByIdRepository: mock.fn(),
    findDonationSummaryRepository: mock.fn(),
  },
});
mock.module('../../src/config/realtime', {
  namedExports: {
    broadcast: mock.fn(async () => undefined),
    REALTIME: {
      donations: { channel: 'donations', created: 'donation-created', statusChanged: 'donation-status-changed' },
      recipes: { channel: 'recipes', submitted: 'recipe-submitted', reviewed: 'recipe-reviewed' },
    },
  },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

beforeEach(() => {
  createDonationRepository.mock.resetCalls();
  updateDonationStatusRepository.mock.resetCalls();
});

const body = { zone: '  Cali  ', items: 'Pan', expiresLabel: 'Vence hoy' };

test('POST /api/donations returns 201 with the created donation', async () => {
  const res = await request(app).post('/api/donations').set(authHeader('household')).send(body);

  assert.equal(res.status, 201);
});

test('POST /api/donations takes the owner and donor name from the token, not the body', async () => {
  await request(app)
    .post('/api/donations')
    .set(authHeader('household'))
    .send({ ...body, userId: 'someone-else', donorName: 'Impostor' });

  assert.deepEqual(createDonationRepository.mock.calls[0].arguments[0], {
    userId: HOUSEHOLD.id, donorName: 'Hogar', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy',
  });
});

test('POST /api/donations returns 400 when the zone is blank', async () => {
  const res = await request(app).post('/api/donations').set(authHeader('household')).send({ ...body, zone: ' ' });

  assert.equal(res.status, 400);
});

test('POST /api/donations lets an admin register a donation with a null owner', async () => {
  const res = await request(app)
    .post('/api/donations')
    .set(authHeader('admin'))
    .send({ donorName: 'Ana', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy' });

  assert.equal(res.status, 201);
  assert.deepEqual(createDonationRepository.mock.calls[0].arguments[0], {
    userId: null, donorName: 'Ana', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy',
  });
});

test('POST /api/donations returns 400 for an admin without donorName', async () => {
  const res = await request(app).post('/api/donations').set(authHeader('admin')).send(body);

  assert.equal(res.body.message, 'El campo "nombre del donante" es obligatorio');
});

test('POST /api/donations defaults the expiry label to "Sin fecha indicada" for a household', async () => {
  await request(app).post('/api/donations').set(authHeader('household')).send({ zone: 'Cali', items: 'Pan' });

  assert.deepEqual(createDonationRepository.mock.calls[0].arguments[0], {
    userId: HOUSEHOLD.id, donorName: 'Hogar', zone: 'Cali', items: 'Pan', expiresLabel: 'Sin fecha indicada',
  });
});

test('POST /api/donations defaults a blank expiry label to "Sin fecha indicada"', async () => {
  await request(app).post('/api/donations').set(authHeader('household')).send({ ...body, expiresLabel: '   ' });

  assert.equal((createDonationRepository.mock.calls[0].arguments[0] as { expiresLabel: string }).expiresLabel, 'Sin fecha indicada');
});

test('POST /api/donations returns 400 when the expiry label is longer than 60 characters', async () => {
  const res = await request(app)
    .post('/api/donations')
    .set(authHeader('household'))
    .send({ ...body, expiresLabel: 'a'.repeat(61) });

  assert.equal(res.body.message, 'El campo "vencimiento" no puede superar 60 caracteres');
});

test('POST /api/donations returns 400 when the items are empty', async () => {
  const res = await request(app).post('/api/donations').set(authHeader('household')).send({ ...body, items: '' });

  assert.equal(res.status, 400);
});

test('POST /api/donations returns 401 without a token', async () => {
  const res = await request(app).post('/api/donations').send(body);

  assert.equal(res.status, 401);
});

test('PATCH /api/donations/:id/status returns the updated donation for an admin', async () => {
  const res = await request(app)
    .patch(`/api/donations/${ID}/status`)
    .set(authHeader('admin'))
    .send({ status: 'approved' });

  assert.equal(res.body.status, 'approved');
});

test('PATCH /api/donations/:id/status returns 400 for an unknown status', async () => {
  const res = await request(app)
    .patch(`/api/donations/${ID}/status`)
    .set(authHeader('admin'))
    .send({ status: 'lost' });

  assert.equal(res.status, 400);
});

test('PATCH /api/donations/:id/status returns 403 for a household', async () => {
  const res = await request(app)
    .patch(`/api/donations/${ID}/status`)
    .set(authHeader('household'))
    .send({ status: 'approved' });

  assert.equal(res.status, 403);
});
