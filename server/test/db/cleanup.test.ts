import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

interface Call { sql: string; params: unknown[] }
const queries: Call[] = [];
const client = {
  query: async (sql: string, params: unknown[] = []) => {
    queries.push({ sql, params });
    return { rows: [] };
  },
};

mock.module('../../src/db/db', {
  namedExports: {
    withTransaction: async (fn: (c: typeof client) => Promise<unknown>) => fn(client),
  },
});

type Mod = typeof import('../../src/db/cleanup.js');
let cleanupSeedDataDb: Mod['cleanupSeedDataDb'];
let normalizeLegacyCategoriesDb: Mod['normalizeLegacyCategoriesDb'];
before(async () => {
  ({ cleanupSeedDataDb, normalizeLegacyCategoriesDb } = await import('../../src/db/cleanup.js'));
});

beforeEach(() => {
  queries.length = 0;
});

const id = (n: string) => `00000000-0000-4000-8000-00000000${n}`;
const range = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, i) => id(String(first + i).padStart(4, '0')));
const SEEDED_VALUE = /^(00000000-0000-4000-8000-00000000\d{4}|valentina@correo\.com)$/;

test('cleanupSeedDataDb only sends DELETE statements', async () => {
  await cleanupSeedDataDb();

  assert.ok(queries.every((q) => q.sql.trimStart().startsWith('DELETE FROM')));
});

test('cleanupSeedDataDb gives every DELETE a WHERE clause', async () => {
  await cleanupSeedDataDb();

  assert.ok(queries.every((q) => /\bWHERE\b/.test(q.sql)));
});

test('cleanupSeedDataDb binds only hand-written seeded ids and emails', async () => {
  await cleanupSeedDataDb();

  assert.ok(queries.flatMap((q) => q.params.flat()).every((p) => SEEDED_VALUE.test(String(p))));
});

test('cleanupSeedDataDb deletes the shopping rows of the seeded users only', async () => {
  await cleanupSeedDataDb();

  const q = queries.find((x) => x.sql.includes('public.shopping_items'));
  assert.deepEqual(q?.params, [range(301, 304), [id('0601'), id('0602')]]);
});

test('cleanupSeedDataDb scopes inventory deletion by id and seeded user', async () => {
  await cleanupSeedDataDb();

  const q = queries.find((x) => x.sql.includes('public.inventory_items'));
  assert.deepEqual(q?.params, [range(201, 207), [id('0601'), id('0602')]]);
  assert.match(q?.sql ?? '', /id = ANY\(\$1::uuid\[\]\) AND user_id = ANY\(\$2::uuid\[\]\)/);
});

test('cleanupSeedDataDb only deletes donations without an owner', async () => {
  await cleanupSeedDataDb();

  const q = queries.find((x) => x.sql.includes('public.donations'));
  assert.match(q?.sql ?? '', /user_id IS NULL/);
  assert.deepEqual(q?.params, [range(501, 503)]);
});

test('cleanupSeedDataDb only deletes recipes without an author', async () => {
  await cleanupSeedDataDb();

  const q = queries.find((x) => x.sql.includes('public.recipes'));
  assert.match(q?.sql ?? '', /author_id IS NULL/);
  assert.deepEqual(q?.params, [range(401, 406)]);
});

test('cleanupSeedDataDb deletes only Valentina and requires id and email to match', async () => {
  await cleanupSeedDataDb();

  const q = queries.find((x) => x.sql.includes('public.users'));
  assert.match(q?.sql ?? '', /id = ANY\(\$1::uuid\[\]\) AND email = ANY\(\$2::text\[\]\)/);
  assert.deepEqual(q?.params, [[id('0601')], ['valentina@correo.com']]);
});

test('cleanupSeedDataDb keeps the seeded catalog products', async () => {
  await cleanupSeedDataDb();

  assert.equal(queries.some((q) => q.sql.includes('public.products')), false);
});

test('normalizeLegacyCategoriesDb sends exactly two UPDATE statements', async () => {
  await normalizeLegacyCategoriesDb();

  assert.equal(queries.filter((q) => q.sql.trimStart().startsWith('UPDATE')).length, 2);
  assert.equal(queries.length, 2);
});

test('normalizeLegacyCategoriesDb updates products and inventory items with the nine categories', async () => {
  await normalizeLegacyCategoriesDb();

  const list = ['Frutas', 'Verduras', 'Lácteos', 'Carnes', 'Panadería', 'Granos', 'Bebidas', 'Congelados', 'Otros'];
  assert.ok(queries[0].sql.includes('public.products'));
  assert.ok(queries[1].sql.includes('public.inventory_items'));
  assert.deepEqual(queries.map((q) => q.params), [[list], [list]]);
});
