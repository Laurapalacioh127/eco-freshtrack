import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const createDonationRepository = mock.fn<AsyncFn>();
const updateDonationStatusRepository = mock.fn<AsyncFn>();
const broadcast = mock.fn<AsyncFn>(async () => undefined);

mock.module('../../src/features/donations/donation.repository', {
  namedExports: {
    createDonationRepository,
    updateDonationStatusRepository,
    findAllDonationsRepository: mock.fn(),
    findDonationByIdRepository: mock.fn(),
    findDonationSummaryRepository: mock.fn(),
  },
});
mock.module('../../src/config/realtime', {
  namedExports: {
    broadcast,
    REALTIME: {
      donations: { channel: 'donations', created: 'donation-created', statusChanged: 'donation-status-changed' },
      recipes: { channel: 'recipes', submitted: 'recipe-submitted', reviewed: 'recipe-reviewed' },
    },
  },
});

type Mod = typeof import('../../src/features/donations/donation.service.js');
let createDonationService: Mod['createDonationService'];
let updateDonationStatusService: Mod['updateDonationStatusService'];
before(async () => {
  ({ createDonationService, updateDonationStatusService } = await import('../../src/features/donations/donation.service.js'));
});

const ID = '00000000-0000-4000-8000-000000000501';
const donation = {
  id: ID, donorName: 'Hogar', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy', status: 'pending',
};
const dto = { userId: '00000000-0000-4000-8000-000000000901', donorName: 'Hogar', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy' };

beforeEach(() => {
  createDonationRepository.mock.resetCalls();
  updateDonationStatusRepository.mock.resetCalls();
  broadcast.mock.resetCalls();
});

test('createDonationService broadcasts donation-created with the created donation', async () => {
  createDonationRepository.mock.mockImplementation(async () => donation);

  const created = await createDonationService(dto);

  assert.deepEqual(created, donation);
  assert.deepEqual(broadcast.mock.calls[0].arguments, ['donations', 'donation-created', donation]);
});

test('createDonationService does not broadcast when the insert fails', async () => {
  createDonationRepository.mock.mockImplementation(async () => {
    throw new Error('db down');
  });

  await assert.rejects(() => createDonationService(dto));
  assert.equal(broadcast.mock.callCount(), 0);
});

test('updateDonationStatusService broadcasts donation-status-changed with the updated donation', async () => {
  const approved = { ...donation, status: 'approved' };
  updateDonationStatusRepository.mock.mockImplementation(async () => approved);

  await updateDonationStatusService(ID, 'approved');

  assert.deepEqual(updateDonationStatusRepository.mock.calls[0].arguments, [ID, 'approved']);
  assert.deepEqual(broadcast.mock.calls[0].arguments, ['donations', 'donation-status-changed', approved]);
});

test('updateDonationStatusService throws 404 and does not broadcast when the donation does not exist', async () => {
  updateDonationStatusRepository.mock.mockImplementation(async () => undefined);

  await assert.rejects(
    () => updateDonationStatusService(ID, 'approved'),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
  assert.equal(broadcast.mock.callCount(), 0);
});

test('updateDonationStatusService throws 404 for a non-UUID id without touching the database', async () => {
  await assert.rejects(
    () => updateDonationStatusService('d1', 'approved'),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
  assert.equal(updateDonationStatusRepository.mock.callCount(), 0);
  assert.equal(broadcast.mock.callCount(), 0);
});
