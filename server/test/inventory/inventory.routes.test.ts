import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, mockAuthModules } from '../helpers/auth';

mockAuthModules();

const findAllInventoryRepository = mock.fn(async () => [
  { id: '00000000-0000-4000-8000-000000000201', name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresInDays: -2 },
  { id: '00000000-0000-4000-8000-000000000202', name: 'Pan', category: 'Panadería', quantity: '1', expiresInDays: 2 },
]);
const findInventoryByIdRepository = mock.fn(async () => undefined);
const createInventoryItemRepository = mock.fn();
const shopping = [{ id: '00000000-0000-4000-8000-000000000301', name: 'Huevos', quantity: '12', reason: 'Se acabó', checked: false }];
const findShoppingListRepository = mock.fn(async () => shopping);

mock.module('../../src/features/inventory/inventory.repository', {
  namedExports: { createInventoryItemRepository, findAllInventoryRepository, findInventoryByIdRepository, findShoppingListRepository },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

test('GET /api/inventory/summary is not captured by /:id', async () => {
  const res = await request(app).get('/api/inventory/summary').set(authHeader('household'));

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { registered: 2, expiringSoon: 1, expired: 1 });
});

test('GET /api/inventory/shopping-list is not captured by /:id', async () => {
  const res = await request(app).get('/api/inventory/shopping-list').set(authHeader('household'));

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, shopping);
});

test('GET /api/inventory/:id returns 404 for a non-UUID id', async () => {
  const res = await request(app).get('/api/inventory/1').set(authHeader('household'));

  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'Inventory item not found');
});
