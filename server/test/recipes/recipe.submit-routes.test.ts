process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, HOUSEHOLD, mockAuthModules } from '../helpers/auth';

mockAuthModules();

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const ID = '00000000-0000-4000-8000-000000000401';
const recipe = {
  id: ID, title: 'Sopa', author: 'Hogar', minutes: 30, difficulty: 'Fácil', servings: 2,
  ingredientsAvailable: 2, ingredientsTotal: 2, status: 'pending', ingredients: ['Papa', 'Sal'], steps: ['Hervir'],
};
const createRecipeRepository = mock.fn<AsyncFn>(async () => ID);

mock.module('../../src/features/recipes/recipe.repository', {
  namedExports: {
    createRecipeRepository,
    findRecipeByIdRepository: mock.fn(async () => recipe),
    findAllRecipesRepository: mock.fn(),
    updateRecipeStatusRepository: mock.fn(),
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
  createRecipeRepository.mock.resetCalls();
});

const body = { title: ' Sopa ', minutes: 30, servings: 2, ingredients: ['Papa', 'Sal'], steps: ['Hervir'] };

const post = (payload: object, token: 'household' | 'admin' = 'household') =>
  request(app).post('/api/recipes').set(authHeader(token)).send(payload);

test('POST /api/recipes returns 201 with the pending recipe', async () => {
  const res = await post(body);

  assert.equal(res.status, 201);
});

test('POST /api/recipes takes the author from the token and defaults the difficulty', async () => {
  await post({ ...body, author: 'Impostor' });

  assert.deepEqual(createRecipeRepository.mock.calls[0].arguments[0], {
    authorId: HOUSEHOLD.id, author: 'Hogar', title: 'Sopa', minutes: 30, servings: 2,
    difficulty: 'Fácil', ingredients: ['Papa', 'Sal'], steps: ['Hervir'],
  });
});

test('POST /api/recipes returns 400 when minutes is not a positive integer', async () => {
  const res = await post({ ...body, minutes: '30' });

  assert.equal(res.status, 400);
});

test('POST /api/recipes returns 400 when ingredients is empty', async () => {
  const res = await post({ ...body, ingredients: [] });

  assert.equal(res.status, 400);
});

test('POST /api/recipes returns 400 when a step is blank', async () => {
  const res = await post({ ...body, steps: ['Hervir', '  '] });

  assert.equal(res.status, 400);
});

test('POST /api/recipes returns 403 for an admin', async () => {
  const res = await post(body, 'admin');

  assert.equal(res.status, 403);
});
