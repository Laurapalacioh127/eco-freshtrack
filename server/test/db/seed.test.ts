import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

let tablesPresent = true;
const queries: string[] = [];

const query = mock.fn(async (sql: string) => {
  queries.push(sql);
  if (sql.includes('SELECT EXISTS')) {
    return { rows: [{ present: tablesPresent }] };
  }
  return { rows: [] };
});

mock.module('../../src/db/db', {
  namedExports: {
    pool: { query },
    withTransaction: async (fn: (client: { query: typeof query }) => Promise<unknown>) => fn({ query }),
  },
});

type Mod = typeof import('../../src/db/seed.js');
let seedDb: Mod['seedDb'];
before(async () => {
  ({ seedDb } = await import('../../src/db/seed.js'));
});

beforeEach(() => {
  queries.length = 0;
});

test('seedDb issues no INSERT when every table already has rows', async () => {
  tablesPresent = true;

  await seedDb();

  assert.equal(queries.filter((sql) => sql.includes('INSERT')).length, 0);
});

test('seedDb inserts users before inventory items when every table is empty', async () => {
  tablesPresent = false;

  await seedDb();

  const usersIndex = queries.findIndex((sql) => sql.includes('INSERT INTO public.users'));
  const inventoryIndex = queries.findIndex((sql) => sql.includes('INSERT INTO public.inventory_items'));
  assert.ok(usersIndex >= 0 && inventoryIndex > usersIndex);
});

test('seedDb inserts products before donation stats when every table is empty', async () => {
  tablesPresent = false;

  await seedDb();

  const productsIndex = queries.findIndex((sql) => sql.includes('INSERT INTO public.products'));
  const statsIndex = queries.findIndex((sql) => sql.includes('INSERT INTO public.donation_stats'));
  assert.ok(productsIndex >= 0 && statsIndex > productsIndex);
});
