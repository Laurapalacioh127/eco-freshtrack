import Boom from '@hapi/boom';
import { Donation, DonationSummary } from './donation.types';
import {
  findAllDonationsRepository,
  findDonationByIdRepository,
  findDonationSummaryRepository,
} from './donation.repository';

export const getDonationsService = async (status?: string): Promise<Donation[]> => {
  const donations = await findAllDonationsRepository();
  return status ? donations.filter((donation) => donation.status === status) : donations;
};

export const getDonationByIdService = async (id: string): Promise<Donation> => {
  const donation = await findDonationByIdRepository(id);

  if (!donation) {
    throw Boom.notFound('Donation not found');
  }

  return donation;
};

export const getDonationSummaryService = async (): Promise<DonationSummary> => {
  const summary = await findDonationSummaryRepository();
  const donations = await findAllDonationsRepository();

  return {
    ...summary,
    pendingDonations: donations.filter((donation) => donation.status === 'pending').length,
  };
};