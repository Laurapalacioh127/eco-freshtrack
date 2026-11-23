import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { AuthRetryableFetchError } from '@supabase/supabase-js';
import { ADMIN, authHeader, getUser, HOUSEHOLD, mockAuthModules } from '../helpers/auth';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

mockAuthModules();

const findAllInventoryRepository = mock.fn<AsyncFn>(async () => []);
const findInventoryByIdRepository = mock.fn<AsyncFn>(async () => undefined);
const createInventoryItemRepository = mock.fn<AsyncFn>();
const findShoppingListRepository = mock.fn<AsyncFn>(async () => []);
mock.module('../../src/features/inventory/inventory.repository', {
  namedExports: { createInventoryItemRepository, findAllInventoryRepository, findInventoryByIdRepository, findShoppingListRepository },
});

const findAllDonationsRepository = mock.fn<AsyncFn>(async () => []);
const findDonationByIdRepository = mock.fn<AsyncFn>(async () => undefined);
const findDonationSummaryRepository = mock.fn<AsyncFn>(async () => ({}));
mock.module('../../src/features/donations/donation.repository', {
  namedExports: { findAllDonationsRepository, findDonationByIdRepository, findDonationSummaryRepository },
});

const RECIPE_ID = '00000000-0000-4000-8000-000000000401';
const recipe = {
  id: RECIPE_ID, title: 'Sopa', author: 'Ana', minutes: 30, difficulty: 'Fácil', servings: 2,
  ingredientsAvailable: 0, ingredientsTotal: 0, status: 'approved', ingredients: [], steps: [],
};
const findAllRecipesRepository = mock.fn<AsyncFn>(async () => []);
const findRecipeByIdRepository = mock.fn<AsyncFn>(async () => recipe);
const updateRecipeStatusRepository = mock.fn<AsyncFn>(async () => true);
mock.module('../../src/features/recipes/recipe.repository', {
  namedExports: { findAllRecipesRepository, findRecipeByIdRepository, updateRecipeStatusRepository },
});

const createProductRepository = mock.fn<AsyncFn>(async (data: unknown) => ({
  id: '00000000-0000-4000-8000-000000000150', ...(data as object),
}));
mock.module('../../src/features/products/product.repository', {
  namedExports: {
    findAllProductsRepository: mock.fn(async () => []),
    findProductByIdRepository: mock.fn(async () => undefined),
    createProductRepository,
  },
});

const findAllUsersRepository = mock.fn<AsyncFn>(async () => []);
const findUserByIdRepository = mock.fn<AsyncFn>(async (id: unknown) => ({
  id, name: 'Hogar', email: 'hogar@x.co', role: 'household',
}));
mock.module('../../src/features/users/user.repository', {
  namedExports: { findAllUsersRepository, findUserByIdRepository },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

beforeEach(() => {
  for (const fn of [
    findAllInventoryRepository, findInventoryByIdRepository, findShoppingListRepository,
    findAllDonationsRepository, findDonationByIdRepository, findDonationSummaryRepository,
    findAllRecipesRepository, findRecipeByIdRepository, updateRecipeStatusRepository,
    createProductRepository, findAllUsersRepository, findUserByIdRepository,
  ]) {
    fn.mock.resetCalls();
  }
});

const ITEM_ID = '00000000-0000-4000-8000-000000000201';
const validProduct = { name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10, substitutes: ['Mango'] };

// --- authMiddleware -------------------------------------------------------------

for (const path of ['/api/products', '/api/inventory', '/api/recipes', '/api/donations', '/api/users/me']) {
  test(`GET ${path} returns 401 without an Authorization header`, async () => {
    const res = await request(app).get(path);

    assert.equal(res.status, 401);
  });
}

test('a malformed Authorization header returns 401', async () => {
  const res = await request(app).get('/api/inventory').set('Authorization', 'Token abc');

  assert.equal(res.status, 401);
});

test('a Bearer header without a token returns 401', async () => {
  const res = await request(app).get('/api/inventory').set('Authorization', 'Bearer ');

  assert.equal(res.status, 401);
});

test('a token rejected by Supabase returns 401', async () => {
  const res = await request(app).get('/api/inventory').set('Authorization', 'Bearer forged');

  assert.equal(res.status, 401);
});

test('a valid token for an account without a profile returns 403', async () => {
  const res = await request(app).get('/api/inventory').set(authHeader('noProfile'));

  assert.equal(res.status, 403);
});

test('a network failure reaching Supabase returns 502 instead of 401', async () => {
  getUser.mock.mockImplementationOnce(async () => ({
    data: { user: null }, error: new AuthRetryableFetchError('fetch failed', 0),
  }));

  const res = await request(app).get('/api/inventory').set(authHeader('household'));

  assert.equal(res.status, 502);
});

test('the middleware validates the token with supabase.auth.getUser', async () => {
  getUser.mock.resetCalls();

  await request(app).get('/api/inventory').set(authHeader('household'));

  assert.deepEqual(getUser.mock.calls[0].arguments, ['token-household']);
});

// --- requireRole ------------------------------------------------------------------

test('GET /api/users returns 403 for a household', async () => {
  const res = await request(app).get('/api/users').set(authHeader('household'));

  assert.equal(res.status, 403);
});

test('GET /api/users returns 200 for an admin', async () => {
  const res = await request(app).get('/api/users').set(authHeader('admin'));

  assert.equal(res.status, 200);
});

test('GET /api/users/:id returns 403 for a household', async () => {
  const res = await request(app).get(`/api/users/${ADMIN.id}`).set(authHeader('household'));

  assert.equal(res.status, 403);
});

test('GET /api/users/me returns the caller profile for a household', async () => {
  await request(app).get('/api/users/me').set(authHeader('household'));

  assert.deepEqual(findUserByIdRepository.mock.calls[0].arguments, [HOUSEHOLD.id]);
});

test('POST /api/products returns 403 for a household', async () => {
  const res = await request(app).post('/api/products').set(authHeader('household')).send(validProduct);

  assert.equal(res.status, 403);
});

test('POST /api/products does not write when the caller is a household', async () => {
  await request(app).post('/api/products').set(authHeader('household')).send(validProduct);

  assert.equal(createProductRepository.mock.callCount(), 0);
});

test('POST /api/products returns 201 with the created product for an admin', async () => {
  const res = await request(app).post('/api/products').set(authHeader('admin')).send(validProduct);

  assert.deepEqual(
    { status: res.status, body: res.body },
    { status: 201, body: { id: '00000000-0000-4000-8000-000000000150', ...validProduct } },
  );
});

test('POST /api/products returns 400 when shelfLifeDays is not a positive integer', async () => {
  const res = await request(app)
    .post('/api/products')
    .set(authHeader('admin'))
    .send({ ...validProduct, shelfLifeDays: 0 });

  assert.equal(res.status, 400);
});

test('POST /api/products returns 400 when the name is missing', async () => {
  const res = await request(app)
    .post('/api/products')
    .set(authHeader('admin'))
    .send({ ...validProduct, name: '' });

  assert.equal(res.status, 400);
});

test('PATCH /api/recipes/:id/status returns 403 for a household', async () => {
  const res = await request(app)
    .patch(`/api/recipes/${RECIPE_ID}/status`)
    .set(authHeader('household'))
    .send({ status: 'approved' });

  assert.equal(res.status, 403);
});

test('PATCH /api/recipes/:id/status updates the status for an admin', async () => {
  await request(app)
    .patch(`/api/recipes/${RECIPE_ID}/status`)
    .set(authHeader('admin'))
    .send({ status: 'rejected' });

  assert.deepEqual(updateRecipeStatusRepository.mock.calls[0].arguments, [RECIPE_ID, 'rejected']);
});

test('PATCH /api/recipes/:id/status returns 400 for a status other than approved/rejected', async () => {
  const res = await request(app)
    .patch(`/api/recipes/${RECIPE_ID}/status`)
    .set(authHeader('admin'))
    .send({ status: 'pending' });

  assert.equal(res.status, 400);
});

test('PATCH /api/recipes/:id/status returns 404 when the recipe does not exist', async () => {
  updateRecipeStatusRepository.mock.mockImplementationOnce(async () => false);

  const res = await request(app)
    .patch(`/api/recipes/${RECIPE_ID}/status`)
    .set(authHeader('admin'))
    .send({ status: 'approved' });

  assert.equal(res.status, 404);
});

// --- ownership / scoping ------------------------------------------------------------

test('GET /api/inventory filters by the logged-in user id', async () => {
  await request(app).get('/api/inventory').set(authHeader('household'));

  assert.deepEqual(findAllInventoryRepository.mock.calls[0].arguments, [HOUSEHOLD.id, undefined]);
});

test('GET /api/inventory/:id returns 404 for an item owned by another user', async () => {
  const res = await request(app).get(`/api/inventory/${ITEM_ID}`).set(authHeader('other'));

  assert.equal(res.status, 404);
});

test('GET /api/inventory/:id looks the item up scoped to the caller', async () => {
  await request(app).get(`/api/inventory/${ITEM_ID}`).set(authHeader('household'));

  assert.deepEqual(findInventoryByIdRepository.mock.calls[0].arguments, [HOUSEHOLD.id, ITEM_ID]);
});

test('GET /api/inventory/shopping-list filters by the logged-in user id', async () => {
  await request(app).get('/api/inventory/shopping-list').set(authHeader('household'));

  assert.deepEqual(findShoppingListRepository.mock.calls[0].arguments, [HOUSEHOLD.id]);
});

test('GET /api/donations is scoped to the household caller', async () => {
  await request(app).get('/api/donations').set(authHeader('household'));

  assert.deepEqual(findAllDonationsRepository.mock.calls[0].arguments, [HOUSEHOLD.id, undefined]);
});

test('GET /api/donations is not scoped for an admin', async () => {
  await request(app).get('/api/donations').set(authHeader('admin'));

  assert.deepEqual(findAllDonationsRepository.mock.calls[0].arguments, [null, undefined]);
});

test('GET /api/donations/:id returns 404 for a donation owned by another user', async () => {
  const res = await request(app)
    .get('/api/donations/00000000-0000-4000-8000-000000000501')
    .set(authHeader('other'));

  assert.equal(res.status, 404);
});

test('GET /api/donations/summary scopes the pending count to the household caller', async () => {
  await request(app).get('/api/donations/summary').set(authHeader('household'));

  assert.deepEqual(findDonationSummaryRepository.mock.calls[0].arguments, [HOUSEHOLD.id]);
});

test('GET /api/recipes limits a household to approved and own recipes', async () => {
  await request(app).get('/api/recipes').set(authHeader('household'));

  assert.deepEqual(findAllRecipesRepository.mock.calls[0].arguments, [HOUSEHOLD.id, undefined]);
});

test('GET /api/recipes?status=pending shows every pending recipe to an admin', async () => {
  await request(app).get('/api/recipes?status=pending').set(authHeader('admin'));

  assert.deepEqual(findAllRecipesRepository.mock.calls[0].arguments, [null, 'pending']);
});
