import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const createRecipeRepository = mock.fn<AsyncFn>();
const findRecipeByIdRepository = mock.fn<AsyncFn>();
const updateRecipeStatusRepository = mock.fn<AsyncFn>();
const broadcast = mock.fn<AsyncFn>(async () => undefined);

mock.module('../../src/features/recipes/recipe.repository', {
  namedExports: {
    createRecipeRepository,
    findRecipeByIdRepository,
    updateRecipeStatusRepository,
    findAllRecipesRepository: mock.fn(),
  },
});
mock.module('../../src/config/realtime', {
  namedExports: {
    broadcast,
    REALTIME: {
      donations: { channel: 'donations', created: 'donation-created', statusChanged: 'donation-status-changed' },
      recipes: { channel: 'recipes', submitted: 'recipe-submitted', reviewed: 'recipe-reviewed' },
    },
  },
});

type Mod = typeof import('../../src/features/recipes/recipe.service.js');
let submitRecipeService: Mod['submitRecipeService'];
let moderateRecipeService: Mod['moderateRecipeService'];
before(async () => {
  ({ submitRecipeService, moderateRecipeService } = await import('../../src/features/recipes/recipe.service.js'));
});

const ID = '00000000-0000-4000-8000-000000000401';
const recipe = {
  id: ID, title: 'Sopa', author: 'Hogar', minutes: 30, difficulty: 'Fácil', servings: 2,
  ingredientsAvailable: 2, ingredientsTotal: 2, status: 'pending', ingredients: ['Papa', 'Sal'], steps: ['Hervir'],
};
const dto = {
  authorId: '00000000-0000-4000-8000-000000000901', author: 'Hogar', title: 'Sopa', minutes: 30,
  difficulty: 'Fácil', servings: 2, ingredients: ['Papa', 'Sal'], steps: ['Hervir'],
};

beforeEach(() => {
  createRecipeRepository.mock.resetCalls();
  findRecipeByIdRepository.mock.resetCalls();
  updateRecipeStatusRepository.mock.resetCalls();
  broadcast.mock.resetCalls();
});

test('submitRecipeService broadcasts recipe-submitted with the full recipe', async () => {
  createRecipeRepository.mock.mockImplementation(async () => ID);
  findRecipeByIdRepository.mock.mockImplementation(async () => recipe);

  await submitRecipeService(dto);

  assert.deepEqual(broadcast.mock.calls[0].arguments, ['recipes', 'recipe-submitted', recipe]);
});

test('submitRecipeService does not broadcast when the insert fails', async () => {
  createRecipeRepository.mock.mockImplementation(async () => {
    throw new Error('db down');
  });

  await assert.rejects(() => submitRecipeService(dto));
  assert.equal(broadcast.mock.callCount(), 0);
});

test('moderateRecipeService broadcasts recipe-reviewed with the reviewed recipe', async () => {
  const approved = { ...recipe, status: 'approved' };
  updateRecipeStatusRepository.mock.mockImplementation(async () => true);
  findRecipeByIdRepository.mock.mockImplementation(async () => approved);

  await moderateRecipeService(ID, 'approved');

  assert.deepEqual(broadcast.mock.calls[0].arguments, ['recipes', 'recipe-reviewed', approved]);
});

test('moderateRecipeService throws 404 and does not broadcast when the recipe does not exist', async () => {
  updateRecipeStatusRepository.mock.mockImplementation(async () => false);

  await assert.rejects(
    () => moderateRecipeService(ID, 'rejected'),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
  assert.equal(broadcast.mock.callCount(), 0);
});
