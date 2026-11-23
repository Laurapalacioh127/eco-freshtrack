import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const findAllDonationsRepository = mock.fn<AsyncFn>();
const findDonationByIdRepository = mock.fn<AsyncFn>();
const findDonationSummaryRepository = mock.fn<AsyncFn>();

mock.module('../../src/features/notifications/notification.service', {
  namedExports: {
    notifyRoleService: mock.fn(async () => {}),
    notifyRecipeAuthorService: mock.fn(async () => {}),
    notifyDonationOwnerService: mock.fn(async () => {}),
    getNotificationsService: mock.fn(),
    markNotificationAsReadService: mock.fn(),
  },
});

mock.module('../../src/features/donations/donation.repository', {
  namedExports: { findAllDonationsRepository, findDonationByIdRepository, findDonationSummaryRepository },
});

type Mod = typeof import('../../src/features/donations/donation.service.js');
let getDonationsService: Mod['getDonationsService'];
let getDonationByIdService: Mod['getDonationByIdService'];
let getDonationSummaryService: Mod['getDonationSummaryService'];
before(async () => {
  ({ getDonationsService, getDonationByIdService, getDonationSummaryService } = await import('../../src/features/donations/donation.service.js'));
});

const ID = '00000000-0000-4000-8000-000000000501';
const USER = '00000000-0000-4000-8000-000000000999';

beforeEach(() => {
  findAllDonationsRepository.mock.resetCalls();
  findDonationByIdRepository.mock.resetCalls();
});

test('getDonationsService passes the status to the repository', async () => {
  findAllDonationsRepository.mock.mockImplementation(async () => []);

  await getDonationsService(USER, 'approved');

  assert.deepEqual(findAllDonationsRepository.mock.calls[0].arguments, [USER, 'approved']);
});

test('getDonationSummaryService returns exactly the repository result', async () => {
  const summary = { totalDonations: 5, pendingDonations: 1, approvedDonations: 2, completedDonations: 2 };
  findDonationSummaryRepository.mock.mockImplementation(async () => summary);

  assert.deepEqual(await getDonationSummaryService(USER), summary);
});

test('getDonationByIdService throws 404 for a non-UUID id without calling the repository', async () => {
  await assert.rejects(
    () => getDonationByIdService(USER, 'd1'),
    (error: { output?: { statusCode: number; payload: { message: string } } }) =>
      error.output?.statusCode === 404 && error.output.payload.message === 'Donation not found',
  );
  assert.equal(findDonationByIdRepository.mock.callCount(), 0);
});

test('getDonationByIdService throws 404 when the repository returns undefined', async () => {
  findDonationByIdRepository.mock.mockImplementation(async () => undefined);

  await assert.rejects(
    () => getDonationByIdService(USER, ID),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
});

test('getDonationByIdService returns the donation when it exists', async () => {
  const donation = { id: ID, donorName: 'Ana', zone: 'Sur', items: 'Pan', expiresLabel: 'Hoy', status: 'pending' };
  findDonationByIdRepository.mock.mockImplementation(async () => donation);

  assert.deepEqual(await getDonationByIdService(USER, ID), donation);
});
