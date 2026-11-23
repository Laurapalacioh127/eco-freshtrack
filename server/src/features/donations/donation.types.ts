export type DonationStatus = 'pending' | 'approved' | 'completed';

export interface Donation {
  id: string;
  donorName: string;
  zone: string;
  items: string;
  expiresLabel: string;
  status: DonationStatus;
}

export interface DonationSummary {
  totalDonations: number;
  pendingDonations: number;
  approvedDonations: number;
  completedDonations: number;
}

export const DONATION_STATUSES = ['pending', 'approved', 'completed'] as const;

export interface CreateDonationDTO {
  userId: string | null;
  donorName: string;
  zone: string;
  items: string;
  expiresLabel: string;
}
