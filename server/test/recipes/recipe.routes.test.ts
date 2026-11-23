import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, mockAuthModules } from '../helpers/auth';

mockAuthModules();

const ID = '00000000-0000-4000-8000-000000000401';
const recipe = {
  id: ID, title: 'Sopa', author: 'Ana', minutes: 30, difficulty: 'Fácil', servings: 2,
  ingredientsAvailable: 2, ingredientsTotal: 3, status: 'approved',
  ingredients: ['Papa', 'Cebolla', 'Sal'], steps: ['Pelar', 'Hervir'],
};
const findAllRecipesRepository = mock.fn(async () => [recipe]);
const findRecipeByIdRepository = mock.fn(async () => recipe);

mock.module('../../src/features/notifications/notification.service', {
  namedExports: {
    notifyRoleService: mock.fn(async () => {}),
    notifyRecipeAuthorService: mock.fn(async () => {}),
    notifyDonationOwnerService: mock.fn(async () => {}),
    getNotificationsService: mock.fn(),
    markNotificationAsReadService: mock.fn(),
  },
});

mock.module('../../src/features/recipes/recipe.repository', {
  namedExports: { findAllRecipesRepository, findRecipeByIdRepository },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

test('GET /api/recipes/:id returns ingredients in order', async () => {
  const res = await request(app).get(`/api/recipes/${ID}`).set(authHeader('household'));

  assert.deepEqual(res.body.ingredients, ['Papa', 'Cebolla', 'Sal']);
});

test('GET /api/recipes/:id returns steps in order', async () => {
  const res = await request(app).get(`/api/recipes/${ID}`).set(authHeader('household'));

  assert.deepEqual(res.body.steps, ['Pelar', 'Hervir']);
});

test('GET /api/recipes/:id returns 404 for a non-UUID id', async () => {
  const res = await request(app).get('/api/recipes/r1').set(authHeader('household'));

  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'Recipe not found');
});
