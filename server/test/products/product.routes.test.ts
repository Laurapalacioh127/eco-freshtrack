import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, mockAuthModules } from '../helpers/auth';

mockAuthModules();

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const findAllProductsRepository = mock.fn<AsyncFn>();
const findProductByIdRepository = mock.fn<AsyncFn>();

mock.module('../../src/features/products/product.repository', {
  namedExports: { findAllProductsRepository, findProductByIdRepository },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

const products = [
  { id: '00000000-0000-4000-8000-000000000101', name: 'Tomate cherry', category: 'Frutas', shelfLifeDays: 7, substitutes: ['Tomate'] },
];

beforeEach(() => {
  findAllProductsRepository.mock.resetCalls();
  findProductByIdRepository.mock.resetCalls();
});

test('GET /api/products returns the repository rows', async () => {
  findAllProductsRepository.mock.mockImplementation(async () => products);

  const res = await request(app).get('/api/products').set(authHeader('household'));

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, products);
});

test('GET /api/products/:id returns 404 for a non-UUID id', async () => {
  const res = await request(app).get('/api/products/does-not-exist').set(authHeader('household'));

  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'Product not found');
});

test('GET /api/products returns 500 without leaking the database error', async () => {
  findAllProductsRepository.mock.mockImplementation(async () => {
    throw new Error('db down');
  });

  const res = await request(app).get('/api/products').set(authHeader('household'));

  assert.equal(res.status, 500);
  assert.equal(JSON.stringify(res.body).includes('db down'), false);
});
