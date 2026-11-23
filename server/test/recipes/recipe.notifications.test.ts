import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const ID = '00000000-0000-4000-8000-000000000401';
const recipe = {
  id: ID, title: 'Sopa', author: 'Hogar', minutes: 30, difficulty: 'Fácil', servings: 2,
  ingredientsAvailable: 2, ingredientsTotal: 2, status: 'pending', ingredients: ['Papa'], steps: ['Hervir'],
};

const createRecipeRepository = mock.fn<AsyncFn>();
const updateRecipeStatusRepository = mock.fn<AsyncFn>();
const notifyRoleService = mock.fn<AsyncFn>(async () => undefined);
const notifyRecipeAuthorService = mock.fn<AsyncFn>(async () => undefined);

mock.module('../../src/features/notifications/notification.service', {
  namedExports: {
    notifyRoleService,
    notifyRecipeAuthorService,
    notifyDonationOwnerService: mock.fn(async () => {}),
    getNotificationsService: mock.fn(),
    markNotificationAsReadService: mock.fn(),
  },
});
mock.module('../../src/features/recipes/recipe.repository', {
  namedExports: {
    createRecipeRepository,
    updateRecipeStatusRepository,
    findRecipeByIdRepository: mock.fn(async () => recipe),
    findAllRecipesRepository: mock.fn(),
  },
});
mock.module('../../src/config/realtime', {
  namedExports: {
    broadcast: mock.fn(async () => undefined),
    REALTIME: {
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

const dto = {
  authorId: '00000000-0000-4000-8000-000000000901', author: 'Hogar', title: 'Sopa', minutes: 30, servings: 2,
  difficulty: 'Fácil', ingredients: ['Papa'], steps: ['Hervir'],
};
const is404 = (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404;

beforeEach(() => {
  createRecipeRepository.mock.resetCalls();
  updateRecipeStatusRepository.mock.resetCalls();
  notifyRoleService.mock.resetCalls();
  notifyRecipeAuthorService.mock.resetCalls();
  createRecipeRepository.mock.mockImplementation(async () => ID);
  updateRecipeStatusRepository.mock.mockImplementation(async () => true);
});

test('submitRecipeService notifies the admins with the author name', async () => {
  await submitRecipeService(dto);

  assert.deepEqual(notifyRoleService.mock.calls[0].arguments, ['admin', 'recipe-submitted', 'Nueva receta de Hogar']);
});

test('submitRecipeService does not notify when the insert fails', async () => {
  createRecipeRepository.mock.mockImplementation(async () => {
    throw new Error('db down');
  });

  await assert.rejects(() => submitRecipeService(dto));
  assert.equal(notifyRoleService.mock.callCount(), 0);
});

test('submitRecipeService still resolves to the recipe after notifying', async () => {
  const result = await submitRecipeService(dto);

  assert.deepEqual(result, recipe);
});

test('moderateRecipeService notifies the author when the recipe is approved', async () => {
  await moderateRecipeService(ID, 'approved');

  assert.deepEqual(notifyRecipeAuthorService.mock.calls[0].arguments, [
    ID, 'recipe-reviewed', 'Tu receta "Sopa" fue aprobada',
  ]);
});

test('moderateRecipeService notifies the author when the recipe is rejected', async () => {
  await moderateRecipeService(ID, 'rejected');

  assert.deepEqual(notifyRecipeAuthorService.mock.calls[0].arguments, [
    ID, 'recipe-reviewed', 'Tu receta "Sopa" fue rechazada',
  ]);
});

test('moderateRecipeService throws 404 and does not notify when the update matches nothing', async () => {
  updateRecipeStatusRepository.mock.mockImplementation(async () => false);

  await assert.rejects(() => moderateRecipeService(ID, 'approved'), is404);
  assert.equal(notifyRecipeAuthorService.mock.callCount(), 0);
});
