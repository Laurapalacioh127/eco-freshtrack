import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const findAllUsersRepository = mock.fn<AsyncFn>();
const findUserByIdRepository = mock.fn<AsyncFn>();

mock.module('../../src/features/users/user.repository', {
  namedExports: { findAllUsersRepository, findUserByIdRepository },
});

type Mod = typeof import('../../src/features/users/user.service.js');
let getUsersService: Mod['getUsersService'];
let getUserByIdService: Mod['getUserByIdService'];
before(async () => {
  ({ getUsersService, getUserByIdService } = await import('../../src/features/users/user.service.js'));
});

const ID = '00000000-0000-4000-8000-000000000601';

beforeEach(() => {
  findAllUsersRepository.mock.resetCalls();
  findUserByIdRepository.mock.resetCalls();
});

test('getUsersService passes the role to the repository', async () => {
  findAllUsersRepository.mock.mockImplementation(async () => []);

  await getUsersService('admin');

  assert.deepEqual(findAllUsersRepository.mock.calls[0].arguments, ['admin']);
});

test('getUserByIdService throws 404 for a non-UUID id without calling the repository', async () => {
  await assert.rejects(
    () => getUserByIdService('u1'),
    (error: { output?: { statusCode: number; payload: { message: string } } }) =>
      error.output?.statusCode === 404 && error.output.payload.message === 'User not found',
  );
  assert.equal(findUserByIdRepository.mock.callCount(), 0);
});

test('getUserByIdService throws 404 when the repository returns undefined', async () => {
  findUserByIdRepository.mock.mockImplementation(async () => undefined);

  await assert.rejects(
    () => getUserByIdService(ID),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
});

test('getUserByIdService returns the user when it exists', async () => {
  const user = { id: ID, name: 'Ana', email: 'a@x.co', role: 'household', points: 10, kgSaved: 2.4 };
  findUserByIdRepository.mock.mockImplementation(async () => user);

  assert.deepEqual(await getUserByIdService(ID), user);
});
