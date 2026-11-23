import assert from 'node:assert/strict';
import { test } from 'node:test';

const hasDb = Boolean(process.env.DB_HOST) && process.env.DB_HOST !== 'db.test';

test('initDb can run twice without throwing', { skip: !hasDb }, async () => {
  const { initDb } = await import('../../src/db/db.js');

  await initDb();
  await assert.doesNotReject(() => initDb());
});

test('findAllRecipesRepository returns only pending recipes after seeding', { skip: !hasDb }, async () => {
  const { initDb } = await import('../../src/db/db.js');
  const { seedDb } = await import('../../src/db/seed.js');
  const { findAllRecipesRepository } = await import('../../src/features/recipes/recipe.repository.js');

  await initDb();
  await seedDb();
  const recipes = await findAllRecipesRepository(null, 'pending');

  assert.ok(recipes.every((recipe) => recipe.status === 'pending'));
});
