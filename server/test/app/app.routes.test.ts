import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

test('GET / returns the API banner', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.text, 'FreshTrack API');
});

test('GET /api/products returns the product list', async () => {
  const res = await request(app).get('/api/products');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
});

test('GET /api/products includes Tomate cherry with id 1', async () => {
  const res = await request(app).get('/api/products');
  const items = res.body as Array<{ id: string; name: string }>;
  assert.ok(items.some((p) => p.id === '1' && p.name === 'Tomate cherry'));
});

test('GET /api/products/:id returns 404 when the product does not exist', async () => {
  const res = await request(app).get('/api/products/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'Product not found');
});

test('GET an unknown route returns 404', async () => {
  const res = await request(app).get('/api/unknown');
  assert.equal(res.status, 404);
});
