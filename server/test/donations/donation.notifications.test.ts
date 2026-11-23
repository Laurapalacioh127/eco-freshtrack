import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;

const ID = '00000000-0000-4000-8000-000000000501';
const USER = '00000000-0000-4000-8000-000000000901';
const donation = {
  id: ID, donorName: 'Ana', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy', status: 'pending',
};

const createDonationRepository = mock.fn<AsyncFn>();
const updateDonationStatusRepository = mock.fn<AsyncFn>();
const notifyRoleService = mock.fn<AsyncFn>(async () => undefined);
const notifyDonationOwnerService = mock.fn<AsyncFn>(async () => undefined);

mock.module('../../src/features/notifications/notification.service', {
  namedExports: {
    notifyRoleService,
    notifyRecipeAuthorService: mock.fn(async () => {}),
    notifyDonationOwnerService,
    getNotificationsService: mock.fn(),
    markNotificationAsReadService: mock.fn(),
  },
});
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
    broadcast: mock.fn(async () => undefined),
    REALTIME: {
      donations: { channel: 'donations', created: 'donation-created', statusChanged: 'donation-status-changed' },
    },
  },
});

type Mod = typeof import('../../src/features/donations/donation.service.js');
let createDonationService: Mod['createDonationService'];
let updateDonationStatusService: Mod['updateDonationStatusService'];
before(async () => {
  ({ createDonationService, updateDonationStatusService } = await import('../../src/features/donations/donation.service.js'));
});

const dto = { userId: USER, donorName: 'Ana', zone: 'Cali', items: 'Pan', expiresLabel: 'Vence hoy' };

beforeEach(() => {
  notifyRoleService.mock.resetCalls();
  notifyDonationOwnerService.mock.resetCalls();
  createDonationRepository.mock.mockImplementation(async () => donation);
  updateDonationStatusRepository.mock.mockImplementation(async () => ({ ...donation, status: 'completed' }));
});

test('createDonationService notifies the admins with donor and items', async () => {
  await createDonationService(dto);

  assert.deepEqual(notifyRoleService.mock.calls[0].arguments, [
    'admin', 'donation-created', 'Nueva donación de Ana: Pan',
  ]);
});

test('createDonationService does not notify when the donation has no user', async () => {
  await createDonationService({ ...dto, userId: null });

  assert.equal(notifyRoleService.mock.callCount(), 0);
});

test('createDonationService does not notify when the insert fails', async () => {
  createDonationRepository.mock.mockImplementation(async () => {
    throw new Error('db down');
  });

  await assert.rejects(() => createDonationService(dto));
  assert.equal(notifyRoleService.mock.callCount(), 0);
});

test('updateDonationStatusService notifies the owner with the Spanish status label', async () => {
  await updateDonationStatusService(ID, 'completed');

  assert.deepEqual(notifyDonationOwnerService.mock.calls[0].arguments, [
    ID, 'donation-status-changed', 'Tu donación "Pan" ahora está completada',
  ]);
});

test('updateDonationStatusService throws 404 and does not notify when the donation does not exist', async () => {
  updateDonationStatusRepository.mock.mockImplementation(async () => undefined);

  await assert.rejects(
    () => updateDonationStatusService(ID, 'completed'),
    (error: { output?: { statusCode: number } }) => error.output?.statusCode === 404,
  );
  assert.equal(notifyDonationOwnerService.mock.callCount(), 0);
});
