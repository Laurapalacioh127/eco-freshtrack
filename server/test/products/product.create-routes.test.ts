process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, mockAuthModules } from '../helpers/auth';

mockAuthModules();

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const createProductRepository = mock.fn<AsyncFn>(async (data: unknown) => ({
  id: '00000000-0000-4000-8000-000000000150', ...(data as object),
}));

mock.module('../../src/features/products/product.repository', {
  namedExports: {
    findAllProductsRepository: mock.fn(),
    findProductByIdRepository: mock.fn(),
    createProductRepository,
  },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

beforeEach(() => {
  createProductRepository.mock.resetCalls();
});

const post = (payload: object, token: 'household' | 'admin' = 'admin') =>
  request(app).post('/api/products').set(authHeader(token)).send(payload);

test('POST /api/products returns 201 with the canonical category for an admin', async () => {
  const res = await post({ name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10 });

  assert.equal(res.status, 201);
  assert.equal(res.body.category, 'Frutas');
});

test('POST /api/products sends the trimmed data to the repository', async () => {
  await post({ name: ' Kiwi ', category: 'Frutas', shelfLifeDays: 10, substitutes: [' Fresa '] });

  assert.deepEqual(createProductRepository.mock.calls[0].arguments[0], {
    name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10, substitutes: ['Fresa'],
  });
});

test('POST /api/products returns 400 for a category outside the list', async () => {
  const res = await post({ name: 'Atún', category: 'Enlatados', shelfLifeDays: 10 });

  assert.equal(res.status, 400);
});

test('POST /api/products does not call the repository for an invalid category', async () => {
  await post({ name: 'Atún', category: 'Enlatados', shelfLifeDays: 10 });

  assert.equal(createProductRepository.mock.callCount(), 0);
});

test('POST /api/products returns 400 when the shelf life is not a positive integer', async () => {
  const res = await post({ name: 'Kiwi', category: 'Frutas', shelfLifeDays: 0 });

  assert.equal(res.body.message, 'La vida útil debe ser un número entero de días mayor que 0');
});

test('POST /api/products returns 403 for a household user', async () => {
  const res = await post({ name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10 }, 'household');

  assert.equal(res.status, 403);
});

test('POST /api/products returns 401 without a token', async () => {
  const res = await request(app).post('/api/products').send({ name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10 });

  assert.equal(res.status, 401);
});
