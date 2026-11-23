import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, mockAuthModules } from '../helpers/auth';

mockAuthModules();

const findAllProductsRepository = mock.fn(async () => [
  { id: '00000000-0000-4000-8000-000000000101', name: 'Tomate cherry', category: 'Frutas', shelfLifeDays: 7, substitutes: [] },
]);
const findProductByIdRepository = mock.fn(async () => undefined);

mock.module('../../src/features/products/product.repository', {
  namedExports: { findAllProductsRepository, findProductByIdRepository },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

test('GET / returns the API banner', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.text, 'FreshTrack API');
});

test('GET /api/products returns the product list', async () => {
  const res = await request(app).get('/api/products').set(authHeader('household'));
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 1);
});

test('GET /api/products includes Tomate cherry with its UUID', async () => {
  const res = await request(app).get('/api/products').set(authHeader('household'));
  const items = res.body as Array<{ id: string; name: string }>;
  assert.ok(items.some((p) => p.id === '00000000-0000-4000-8000-000000000101' && p.name === 'Tomate cherry'));
});

test('GET /api/products/:id returns 404 when the product does not exist', async () => {
  const res = await request(app).get('/api/products/does-not-exist').set(authHeader('household'));
  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'Product not found');
});

test('GET an unknown route returns 404', async () => {
  const res = await request(app).get('/api/unknown');
  assert.equal(res.status, 404);
});
