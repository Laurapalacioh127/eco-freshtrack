import assert from 'node:assert/strict';
import { test } from 'node:test';

const hasDb = Boolean(process.env.DB_HOST) && process.env.DB_HOST !== 'db.test';

test('initDb can run twice without throwing', { skip: !hasDb }, async () => {
  const { initDb } = await import('../../src/db/db.js');

  await initDb();
  await assert.doesNotReject(() => initDb());
});

test('findAllRecipesRepository returns only pending recipes', { skip: !hasDb }, async () => {
  const { initDb } = await import('../../src/db/db.js');
  const { findAllRecipesRepository } = await import('../../src/features/recipes/recipe.repository.js');

  await initDb();
  const recipes = await findAllRecipesRepository(null, 'pending');

  assert.ok(recipes.every((recipe) => recipe.status === 'pending'));
});

test('cleanupSeedDataDb can run twice without throwing', { skip: !hasDb }, async () => {
  const { initDb } = await import('../../src/db/db.js');
  const { cleanupSeedDataDb } = await import('../../src/db/cleanup.js');

  await initDb();
  await cleanupSeedDataDb();
  await assert.doesNotReject(() => cleanupSeedDataDb());
});

test('cleanupSeedDataDb removes the seeded inventory item of Valentina', { skip: !hasDb }, async () => {
  const { initDb, pool } = await import('../../src/db/db.js');
  const { cleanupSeedDataDb } = await import('../../src/db/cleanup.js');
  const seededItem = '00000000-0000-4000-8000-000000000201';

  await initDb();
  await cleanupSeedDataDb();
  const { rows } = await pool.query('SELECT id FROM public.inventory_items WHERE id = $1', [seededItem]);

  assert.equal(rows.length, 0);
});
