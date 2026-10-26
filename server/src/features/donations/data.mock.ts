import { Donation, DonationSummaryData } from './donation.types';

export const donationsMock: Donation[] = [
  { id: 'd1', donorName: 'Camila Martínez', zone: 'San Fernando, Cali', items: '3 enlatados y 2 verduras', expiresLabel: 'Mañana', status: 'pending' },
  { id: 'd2', donorName: 'Juan Pablo Ortiz', zone: 'El Peñón, Cali', items: '4 productos de despensa', expiresLabel: 'En 3 días', status: 'approved' },
  { id: 'd3', donorName: 'Laura Restrepo', zone: 'Granada, Cali', items: 'Pan, frutas y lácteos', expiresLabel: 'En 4 días', status: 'completed' },
];

export const donationSummaryMock: DonationSummaryData = {
  kgRescued: 48.6,
  dailyGoalPercent: 81,
  families: 24,
  deliveries: 7,
};