import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const findAllProductsRepository = mock.fn<AsyncFn>();
const findProductByIdRepository = mock.fn<AsyncFn>();

mock.module('../../src/features/products/product.repository', {
  namedExports: { findAllProductsRepository, findProductByIdRepository },
});

type Mod = typeof import('../../src/features/products/product.service.js');
let getProductsService: Mod['getProductsService'];
let getProductByIdService: Mod['getProductByIdService'];
before(async () => {
  ({ getProductsService, getProductByIdService } = await import('../../src/features/products/product.service.js'));
});

const ID = '00000000-0000-4000-8000-000000000101';
const tomato = { id: ID, name: 'Tomate cherry', category: 'Frutas', shelfLifeDays: 7, substitutes: [] };

beforeEach(() => {
  findAllProductsRepository.mock.resetCalls();
  findProductByIdRepository.mock.resetCalls();
});

test('getProductsService passes the category to the repository', async () => {
  findAllProductsRepository.mock.mockImplementation(async () => [tomato]);

  await getProductsService('Frutas');

  assert.deepEqual(findAllProductsRepository.mock.calls[0].arguments, ['Frutas']);
});

test('getProductByIdService throws 404 for a non-UUID id without calling the repository', async () => {
  await assert.rejects(
    () => getProductByIdService('does-not-exist'),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
  assert.equal(findProductByIdRepository.mock.callCount(), 0);
});

test('getProductByIdService throws 404 Product not found when the repository returns undefined', async () => {
  findProductByIdRepository.mock.mockImplementation(async () => undefined);

  await assert.rejects(
    () => getProductByIdService(ID),
    (error: { output?: { statusCode: number; payload: { message: string } } }) =>
      error.output?.statusCode === 404 && error.output.payload.message === 'Product not found',
  );
});

test('getProductByIdService returns the product when it exists', async () => {
  findProductByIdRepository.mock.mockImplementation(async () => tomato);

  assert.deepEqual(await getProductByIdService(ID), tomato);
});
