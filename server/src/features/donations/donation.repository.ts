import { Donation, DonationSummaryData } from './donation.types';
import { donationsMock, donationSummaryMock } from './data.mock';

export const findAllDonationsRepository = async (): Promise<Donation[]> => {
  return donationsMock;
};

export const findDonationByIdRepository = async (id: string): Promise<Donation | undefined> => {
  return donationsMock.find((donation) => donation.id === id);
};

export const findDonationSummaryRepository = async (): Promise<DonationSummaryData> => {
  return donationSummaryMock;
};