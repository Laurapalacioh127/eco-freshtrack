import Boom from '@hapi/boom';
import { isUuid } from '../../utils/isUuid';
import { Donation, DonationSummary } from './donation.types';
import {
  findAllDonationsRepository,
  findDonationByIdRepository,
  findDonationSummaryRepository,
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
