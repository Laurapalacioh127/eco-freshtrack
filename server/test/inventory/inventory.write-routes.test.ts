process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { ADMIN, authHeader, HOUSEHOLD, mockAuthModules } from '../helpers/auth';

mockAuthModules();

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const ID = '00000000-0000-4000-8000-000000000601';
const row = { id: ID, name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresInDays: 5 };
const createInventoryItemRepository = mock.fn<AsyncFn>(async () => row);

mock.module('../../src/features/inventory/inventory.repository', {
  namedExports: {
    createInventoryItemRepository,
    findAllInventoryRepository: mock.fn(),
    findInventoryByIdRepository: mock.fn(),
    findShoppingListRepository: mock.fn(),
  },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

beforeEach(() => {
  createInventoryItemRepository.mock.resetCalls();
});

const body = { name: '  Leche ', category: 'Lácteos', quantity: '1 L', expiresOn: '2030-01-15' };
const post = (payload: object, token: 'household' | 'admin' = 'household') =>
  request(app).post('/api/inventory').set(authHeader(token)).send(payload);
const CATEGORY_MESSAGE =
  'El campo "categoría" debe ser una de: Frutas, Verduras, Lácteos, Carnes, Panadería, Granos, Bebidas, Congelados, Otros';
const DATE_MESSAGE = 'El campo "fecha de vencimiento" debe ser una fecha válida (AAAA-MM-DD)';

test('POST /api/inventory returns 201 with the created item and its status', async () => {
  const res = await post(body);

  assert.equal(res.status, 201);
  assert.deepEqual(res.body, {
    id: ID, name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresInDays: 5, status: 'ok',
  });
});

test('POST /api/inventory takes the owner from the token and ignores a body userId', async () => {
  await post({ ...body, userId: 'someone-else' });

  assert.deepEqual(createInventoryItemRepository.mock.calls[0].arguments[0], {
    userId: HOUSEHOLD.id, name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresOn: '2030-01-15',
  });
});

test('POST /api/inventory lets an admin create an item for themselves', async () => {
  const res = await post(body, 'admin');

  assert.equal(res.status, 201);
  assert.equal((createInventoryItemRepository.mock.calls[0].arguments[0] as { userId: string }).userId, ADMIN.id);
});

test('POST /api/inventory returns 400 when the name is blank', async () => {
  const res = await post({ ...body, name: ' ' });

  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'El campo "nombre" es obligatorio');
});

test('POST /api/inventory returns 400 when the quantity is missing', async () => {
  const res = await post({ name: 'Leche', category: 'Lácteos', expiresOn: '2030-01-15' });

  assert.equal(res.status, 400);
});

test('POST /api/inventory returns 400 when the category is longer than 60 characters', async () => {
  const res = await post({ ...body, category: 'a'.repeat(61) });

  assert.equal(res.body.message, CATEGORY_MESSAGE);
});

test('POST /api/inventory returns 400 for a category outside the list', async () => {
  const res = await post({ ...body, category: 'Despensa' });

  assert.equal(res.status, 400);
  assert.equal(res.body.message, CATEGORY_MESSAGE);
});

test('POST /api/inventory does not call the repository for an invalid category', async () => {
  await post({ ...body, category: 'Despensa' });

  assert.equal(createInventoryItemRepository.mock.callCount(), 0);
});

test('POST /api/inventory returns 201 for the category Lácteos', async () => {
  const res = await post({ ...body, category: 'Lácteos' });

  assert.equal(res.status, 201);
});

test('POST /api/inventory returns 400 for a date in the wrong format', async () => {
  const res = await post({ ...body, expiresOn: '15/01/2030' });

  assert.equal(res.body.message, DATE_MESSAGE);
});

test('POST /api/inventory returns 400 for an impossible date', async () => {
  const res = await post({ ...body, expiresOn: '2030-02-30' });

  assert.equal(res.body.message, DATE_MESSAGE);
});

test('POST /api/inventory returns 400 when the date is not a string', async () => {
  const res = await post({ ...body, expiresOn: 20300115 });

  assert.equal(res.status, 400);
});

test('POST /api/inventory does not call the repository when validation fails', async () => {
  await post({ ...body, expiresOn: '' });

  assert.equal(createInventoryItemRepository.mock.callCount(), 0);
});

test('POST /api/inventory returns 401 without a token', async () => {
  const res = await request(app).post('/api/inventory').send(body);

  assert.equal(res.status, 401);
});
