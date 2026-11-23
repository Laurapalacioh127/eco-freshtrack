import Boom from '@hapi/boom';
import { broadcast, REALTIME } from '../../config/realtime';
import { isUuid } from '../../utils/isUuid';
import { CreateDonationDTO, Donation, DonationStatus, DonationSummary } from './donation.types';
import {
  createDonationRepository,
  findAllDonationsRepository,
  findDonationByIdRepository,
  findDonationSummaryRepository,
  updateDonationStatusRepository,
} from './donation.repository';

// scopeUserId: null for admins (all donations), the user's id for households.
export const getDonationsService = async (
  scopeUserId: string | null,
  status?: string,
): Promise<Donation[]> => {
  return findAllDonationsRepository(scopeUserId, status);
};

export const getDonationByIdService = async (
  scopeUserId: string | null,
  id: string,
): Promise<Donation> => {
  const donation = isUuid(id) ? await findDonationByIdRepository(scopeUserId, id) : undefined;

  if (!donation) {
    throw Boom.notFound('Donation not found');
  }

  return donation;
};

export const getDonationSummaryService = async (
  scopeUserId: string | null,
): Promise<DonationSummary> => {
  return findDonationSummaryRepository(scopeUserId);
};

export const createDonationService = async (donation: CreateDonationDTO): Promise<Donation> => {
  const created = await createDonationRepository(donation);
  // Not awaited on purpose: the broadcast must never delay or fail the request.
  void broadcast(REALTIME.donations.channel, REALTIME.donations.created, created);
  return created;
};

export const updateDonationStatusService = async (
  id: string,
  status: DonationStatus,
): Promise<Donation> => {
  const updated = isUuid(id) ? await updateDonationStatusRepository(id, status) : undefined;

  if (!updated) {
    throw Boom.notFound('Donation not found');
  }

  void broadcast(REALTIME.donations.channel, REALTIME.donations.statusChanged, updated);
  return updated;
};
