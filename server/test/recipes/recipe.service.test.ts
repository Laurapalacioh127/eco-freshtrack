import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const findAllRecipesRepository = mock.fn<AsyncFn>();
const findRecipeByIdRepository = mock.fn<AsyncFn>();

mock.module('../../src/features/recipes/recipe.repository', {
  namedExports: { findAllRecipesRepository, findRecipeByIdRepository },
});

type Mod = typeof import('../../src/features/recipes/recipe.service.js');
let getRecipesService: Mod['getRecipesService'];
let getRecipeByIdService: Mod['getRecipeByIdService'];
before(async () => {
  ({ getRecipesService, getRecipeByIdService } = await import('../../src/features/recipes/recipe.service.js'));
});

const ID = '00000000-0000-4000-8000-000000000401';
const recipe = {
  id: ID, title: 'Sopa', author: 'Ana', minutes: 30, difficulty: 'Fácil', servings: 2,
  ingredientsAvailable: 0, ingredientsTotal: 0, status: 'pending', ingredients: [], steps: [],
};

beforeEach(() => {
  findAllRecipesRepository.mock.resetCalls();
  findRecipeByIdRepository.mock.resetCalls();
});

test('getRecipesService passes the status to the repository', async () => {
  findAllRecipesRepository.mock.mockImplementation(async () => []);

  await getRecipesService(null, 'pending');

  assert.deepEqual(findAllRecipesRepository.mock.calls[0].arguments, [null, 'pending']);
});

test('getRecipeByIdService throws 404 for a non-UUID id without calling the repository', async () => {
  await assert.rejects(
    () => getRecipeByIdService(null, 'r1'),
    (error: { output?: { statusCode: number; payload: { message: string } } }) =>
      error.output?.statusCode === 404 && error.output.payload.message === 'Recipe not found',
  );
  assert.equal(findRecipeByIdRepository.mock.callCount(), 0);
});

test('getRecipeByIdService throws 404 when the repository returns undefined', async () => {
  findRecipeByIdRepository.mock.mockImplementation(async () => undefined);

  await assert.rejects(
    () => getRecipeByIdService(null, ID),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
});

test('getRecipeByIdService passes through a recipe with empty ingredients', async () => {
  findRecipeByIdRepository.mock.mockImplementation(async () => recipe);

  assert.deepEqual((await getRecipeByIdService(null, ID)).ingredients, []);
});
