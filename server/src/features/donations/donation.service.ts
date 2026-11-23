import Boom from '@hapi/boom';
import { isUuid } from '../../utils/isUuid';
import { Donation, DonationSummary } from './donation.types';
import {
  findAllDonationsRepository,
  findDonationByIdRepository,
  findDonationSummaryRepository,
} from './donation.repository';

export const getDonationsService = async (status?: string): Promise<Donation[]> => {
  return findAllDonationsRepository(status);
};

export const getDonationByIdService = async (id: string): Promise<Donation> => {
  const donation = isUuid(id) ? await findDonationByIdRepository(id) : undefined;

  if (!donation) {
    throw Boom.notFound('Donation not found');
  }

  return donation;
};

export const getDonationSummaryService = async (): Promise<DonationSummary> => {
  return findDonationSummaryRepository();
};
