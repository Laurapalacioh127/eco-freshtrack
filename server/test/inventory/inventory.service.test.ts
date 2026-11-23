import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

import type { CreateInventoryItemDTO } from '../../src/features/inventory/inventory.types.js';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const findAllInventoryRepository = mock.fn<AsyncFn>();
const findInventoryByIdRepository = mock.fn<AsyncFn>();
const createInventoryItemRepository = mock.fn<AsyncFn>();
const findShoppingListRepository = mock.fn<AsyncFn>();

mock.module('../../src/features/inventory/inventory.repository', {
  namedExports: { createInventoryItemRepository, findAllInventoryRepository, findInventoryByIdRepository, findShoppingListRepository },
});

type Mod = typeof import('../../src/features/inventory/inventory.service.js');
let getInventoryService: Mod['getInventoryService'];
let getInventoryByIdService: Mod['getInventoryByIdService'];
let getInventorySummaryService: Mod['getInventorySummaryService'];
let getShoppingListService: Mod['getShoppingListService'];
let createInventoryItemService: Mod['createInventoryItemService'];
before(async () => {
  ({ createInventoryItemService, getInventoryService, getInventoryByIdService, getInventorySummaryService, getShoppingListService } = await import('../../src/features/inventory/inventory.service.js'));
});

const ID = '00000000-0000-4000-8000-000000000201';
const USER = '00000000-0000-4000-8000-000000000999';
const item = (expiresInDays: number) => ({ id: ID, name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresInDays });

beforeEach(() => {
  findAllInventoryRepository.mock.resetCalls();
  findInventoryByIdRepository.mock.resetCalls();
});

test('getInventoryService marks an item expiring in -1 days as expired', async () => {
  findAllInventoryRepository.mock.mockImplementation(async () => [item(-1)]);

  assert.equal((await getInventoryService(USER))[0].status, 'expired');
});

test('getInventoryService marks an item expiring in 3 days as soon', async () => {
  findAllInventoryRepository.mock.mockImplementation(async () => [item(3)]);

  assert.equal((await getInventoryService(USER))[0].status, 'soon');
});

test('getInventoryService marks an item expiring in 4 days as ok', async () => {
  findAllInventoryRepository.mock.mockImplementation(async () => [item(4)]);

  assert.equal((await getInventoryService(USER))[0].status, 'ok');
});

test('getInventoryService passes the category to the repository', async () => {
  findAllInventoryRepository.mock.mockImplementation(async () => []);

  await getInventoryService(USER, 'Lácteos');

  assert.deepEqual(findAllInventoryRepository.mock.calls[0].arguments, [USER, 'Lácteos']);
});

test('getInventorySummaryService counts registered, soon and expired items', async () => {
  findAllInventoryRepository.mock.mockImplementation(async () => [item(-1), item(1), item(3), item(10)]);

  assert.deepEqual(await getInventorySummaryService(USER), { registered: 4, expiringSoon: 2, expired: 1 });
});

test('getInventoryByIdService throws 404 for a non-UUID id without calling the repository', async () => {
  await assert.rejects(
    () => getInventoryByIdService(USER, '1'),
    (error: { output?: { statusCode: number; payload: { message: string } } }) =>
      error.output?.statusCode === 404 && error.output.payload.message === 'Inventory item not found',
  );
  assert.equal(findInventoryByIdRepository.mock.callCount(), 0);
});

test('getInventoryByIdService throws 404 when the repository returns undefined', async () => {
  findInventoryByIdRepository.mock.mockImplementation(async () => undefined);

  await assert.rejects(
    () => getInventoryByIdService(USER, ID),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
});

test('getInventoryByIdService returns the item with its status', async () => {
  findInventoryByIdRepository.mock.mockImplementation(async () => item(2));

  assert.deepEqual(await getInventoryByIdService(USER, ID), { ...item(2), status: 'soon' });
});

test('getShoppingListService returns the repository rows unchanged', async () => {
  const rows = [{ id: 'x', name: 'Pan', quantity: '1', reason: 'Se acabó', checked: false }];
  findShoppingListRepository.mock.mockImplementation(async () => rows);

  assert.deepEqual(await getShoppingListService(USER), rows);
});

const dto: CreateInventoryItemDTO = { userId: USER, name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresOn: '2030-01-15' };

test('createInventoryItemService passes the DTO to the repository unchanged', async () => {
  createInventoryItemRepository.mock.resetCalls();
  createInventoryItemRepository.mock.mockImplementation(async () => item(10));

  await createInventoryItemService(dto);

  assert.deepEqual(createInventoryItemRepository.mock.calls[0].arguments, [dto]);
});

test('createInventoryItemService marks an item expiring in 2 days as soon', async () => {
  createInventoryItemRepository.mock.mockImplementation(async () => item(2));

  assert.deepEqual(await createInventoryItemService(dto), { ...item(2), status: 'soon' });
});

test('createInventoryItemService marks an item expiring in -1 days as expired', async () => {
  createInventoryItemRepository.mock.mockImplementation(async () => item(-1));

  assert.equal((await createInventoryItemService(dto)).status, 'expired');
});
