import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import Boom from '@hapi/boom';
import type { Express } from 'express';
import { authHeader, getUser, mockAuthModules } from '../helpers/auth';

mockAuthModules();

type AsyncFn = (...args: unknown[]) => Promise<unknown>;
const fetchOpenFoodFactsProductRepository = mock.fn<AsyncFn>();

mock.module('../../src/features/barcode/barcode.repository', {
  namedExports: { fetchOpenFoodFactsProductRepository },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

beforeEach(() => {
  fetchOpenFoodFactsProductRepository.mock.resetCalls();
  getUser.mock.resetCalls();
});

const CODE = '7702001043276';
const URL = `/api/products/barcode/${CODE}`;
const LENGTH_MESSAGE = 'El código de barras debe tener entre 8 y 14 dígitos';

test('returns 401 without a token', async () => {
  const res = await request(app).get(URL);

  assert.equal(res.status, 401);
});

test('returns 401 with a non-Bearer scheme', async () => {
  const res = await request(app).get(URL).set('Authorization', 'Basic x');

  assert.equal(res.status, 401);
});

test('returns 400 for a non-numeric code', async () => {
  const res = await request(app).get('/api/products/barcode/abc123').set(authHeader('household'));

  assert.equal(res.status, 400);
  assert.equal(res.body.message, LENGTH_MESSAGE);
});

test('returns 400 for 7 digits', async () => {
  const res = await request(app).get('/api/products/barcode/1234567').set(authHeader('household'));

  assert.equal(res.status, 400);
});

test('returns 400 for 15 digits', async () => {
  const res = await request(app).get('/api/products/barcode/123456789012345').set(authHeader('household'));

  assert.equal(res.status, 400);
});

test('does not call the repository for invalid codes', async () => {
  await request(app).get('/api/products/barcode/abc123').set(authHeader('household'));
  await request(app).get('/api/products/barcode/1234567').set(authHeader('household'));

  assert.equal(fetchOpenFoodFactsProductRepository.mock.callCount(), 0);
});

test('returns the mapped product for a valid code', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => ({
    product_name_es: 'Leche entera',
    categories: 'Lácteos, Leches',
  }));

  const res = await request(app).get(URL).set(authHeader('household'));

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { code: CODE, name: 'Leche entera', category: 'Lácteos', imageUrl: null });
});

test('returns 404 when the product is not found', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => null);

  const res = await request(app).get(URL).set(authHeader('household'));

  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'No encontramos un producto con ese código de barras');
});

test('returns 504 on upstream timeout', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => {
    throw Boom.gatewayTimeout('Open Food Facts tardó demasiado en responder, intenta de nuevo');
  });

  const res = await request(app).get(URL).set(authHeader('household'));

  assert.equal(res.status, 504);
  assert.equal(res.body.message, 'Open Food Facts tardó demasiado en responder, intenta de nuevo');
});

test('returns 502 on upstream failure', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => {
    throw Boom.badGateway('No pudimos consultar Open Food Facts, intenta de nuevo');
  });

  const res = await request(app).get(URL).set(authHeader('household'));

  assert.equal(res.status, 502);
  assert.equal(res.body.message, 'No pudimos consultar Open Food Facts, intenta de nuevo');
});

test('returns 500 without leaking an unexpected error', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => {
    throw new Error('boom');
  });

  const res = await request(app).get(URL).set(authHeader('household'));

  assert.equal(res.status, 500);
  assert.equal(JSON.stringify(res.body).includes('boom'), false);
});

test('allows an admin token', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => ({ product_name: 'Arroz' }));

  const res = await request(app).get(URL).set(authHeader('admin'));

  assert.equal(res.status, 200);
});

test('validates the token exactly once per request', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => ({ product_name: 'Arroz' }));

  await request(app).get(URL).set(authHeader('household'));

  assert.equal(getUser.mock.callCount(), 1);
});
