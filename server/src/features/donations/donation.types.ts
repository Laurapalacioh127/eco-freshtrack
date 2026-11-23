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
  kgRescued: number;
  dailyGoalPercent: number;
  families: number;
  deliveries: number;
  pendingDonations: number;
}

export type DonationSummaryData = Omit<DonationSummary, 'pendingDonations'>;

export const DONATION_STATUSES = ['pending', 'approved', 'completed'] as const;

export interface CreateDonationDTO {
  userId: string;
  donorName: string;
  zone: string;
  items: string;
  expiresLabel: string;
}
