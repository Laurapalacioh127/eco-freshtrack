import { pool } from '../../db/db';
import { CreateDonationDTO, Donation, DonationStatus, DonationSummary } from './donation.types';

const DONATION_COLUMNS =
  'id, donor_name AS "donorName", zone, items, expires_label AS "expiresLabel", status';

// userId null means "no owner filter" (admin). Otherwise only that user's donations.
export const findAllDonationsRepository = async (
  userId: string | null,
  status?: string,
): Promise<Donation[]> => {
  const result = await pool.query<Donation>(
    `SELECT ${DONATION_COLUMNS}
     FROM public.donations
     WHERE ($1::uuid IS NULL OR user_id = $1)
       AND ($2::text IS NULL OR status = $2)
     ORDER BY created_at, id`,
    [userId, status ?? null],
  );

  return result.rows;
};

export const findDonationByIdRepository = async (
  userId: string | null,
  id: string,
): Promise<Donation | undefined> => {
  const result = await pool.query<Donation>(
    `SELECT ${DONATION_COLUMNS}
     FROM public.donations
     WHERE id = $1 AND ($2::uuid IS NULL OR user_id = $2)`,
    [id, userId],
  );

  return result.rows[0];
};

// userId null means all donations (admin). Otherwise only that user's donations.
export const findDonationSummaryRepository = async (
  userId: string | null,
): Promise<DonationSummary> => {
  const result = await pool.query<DonationSummary>(
    `SELECT COUNT(*)::int AS "totalDonations",
       COUNT(*) FILTER (WHERE status = 'pending')::int AS "pendingDonations",
       COUNT(*) FILTER (WHERE status = 'approved')::int AS "approvedDonations",
       COUNT(*) FILTER (WHERE status = 'completed')::int AS "completedDonations"
     FROM public.donations
     WHERE ($1::uuid IS NULL OR user_id = $1)`,
    [userId],
  );

  return result.rows[0];
};

export const createDonationRepository = async (donation: CreateDonationDTO): Promise<Donation> => {
  const result = await pool.query<Donation>(
    `INSERT INTO public.donations (user_id, donor_name, zone, items, expires_label)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${DONATION_COLUMNS}`,
    [donation.userId, donation.donorName, donation.zone, donation.items, donation.expiresLabel],
  );

  return result.rows[0];
};

export const updateDonationStatusRepository = async (
  id: string,
  status: DonationStatus,
): Promise<Donation | undefined> => {
  const result = await pool.query<Donation>(
    `UPDATE public.donations SET status = $2 WHERE id = $1 RETURNING ${DONATION_COLUMNS}`,
    [id, status],
  );

  return result.rows[0];
};
