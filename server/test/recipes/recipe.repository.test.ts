import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const query = mock.fn<AsyncFn>();
mock.module('../../src/db/db', { namedExports: { pool: { query } } });

type Mod = typeof import('../../src/features/recipes/recipe.repository.js');
let findAllRecipesRepository: Mod['findAllRecipesRepository'];
let findRecipeByIdRepository: Mod['findRecipeByIdRepository'];
before(async () => {
  ({ findAllRecipesRepository, findRecipeByIdRepository } = await import('../../src/features/recipes/recipe.repository.js'));
});

const ID = '00000000-0000-4000-8000-000000000401';

beforeEach(() => {
  query.mock.resetCalls();
  query.mock.mockImplementation(async () => ({ rows: [] }));
});

test('findAllRecipesRepository passes null when no status is given', async () => {
  await findAllRecipesRepository();

  assert.deepEqual(query.mock.calls[0].arguments[1], [null]);
});

test('findRecipeByIdRepository passes the id as parameter', async () => {
  await findRecipeByIdRepository(ID);

  assert.deepEqual(query.mock.calls[0].arguments[1], [ID]);
});

test('findRecipeByIdRepository returns undefined when there are no rows', async () => {
  assert.equal(await findRecipeByIdRepository(ID), undefined);
});
