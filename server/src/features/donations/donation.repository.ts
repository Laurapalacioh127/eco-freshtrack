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

// Rescue stats are community-wide; only the pending count is scoped to the user.
export const findDonationSummaryRepository = async (
  userId: string | null,
): Promise<DonationSummary> => {
  const result = await pool.query<DonationSummary>(
    `WITH pending AS (
       SELECT COUNT(*)::int AS n
       FROM public.donations
       WHERE status = 'pending' AND ($1::uuid IS NULL OR user_id = $1)
     )
     SELECT COALESCE(s.kg_rescued, 0)::float8 AS "kgRescued",
       COALESCE(s.daily_goal_percent, 0) AS "dailyGoalPercent",
       COALESCE(s.families, 0) AS families,
       COALESCE(s.deliveries, 0) AS deliveries,
       pending.n AS "pendingDonations"
     FROM pending
     LEFT JOIN public.donation_stats s ON s.id = 1`,
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
