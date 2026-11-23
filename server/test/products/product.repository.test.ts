import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const query = mock.fn<AsyncFn>();
mock.module('../../src/db/db', { namedExports: { pool: { query } } });

type Mod = typeof import('../../src/features/products/product.repository.js');
let findAllProductsRepository: Mod['findAllProductsRepository'];
let findProductByIdRepository: Mod['findProductByIdRepository'];
before(async () => {
  ({ findAllProductsRepository, findProductByIdRepository } = await import('../../src/features/products/product.repository.js'));
});

beforeEach(() => {
  query.mock.resetCalls();
  query.mock.mockImplementation(async () => ({ rows: [] }));
});

test('findAllProductsRepository passes null when no category is given', async () => {
  await findAllProductsRepository();

  assert.deepEqual(query.mock.calls[0].arguments[1], [null]);
});

test('findAllProductsRepository passes the category as parameter', async () => {
  await findAllProductsRepository('Frutas');

  assert.deepEqual(query.mock.calls[0].arguments[1], ['Frutas']);
});

test('findProductByIdRepository returns undefined when there are no rows', async () => {
  assert.equal(await findProductByIdRepository('00000000-0000-4000-8000-000000000101'), undefined);
});
