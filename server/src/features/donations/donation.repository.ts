import { pool } from '../../db/db';
import { Donation, DonationSummary } from './donation.types';

const DONATION_COLUMNS =
  'id, donor_name AS "donorName", zone, items, expires_label AS "expiresLabel", status';

export const findAllDonationsRepository = async (status?: string): Promise<Donation[]> => {
  const result = await pool.query<Donation>(
    `SELECT ${DONATION_COLUMNS}
     FROM public.donations
     WHERE ($1::text IS NULL OR status = $1)
     ORDER BY created_at, id`,
    [status ?? null],
  );

  return result.rows;
};

export const findDonationByIdRepository = async (id: string): Promise<Donation | undefined> => {
  const result = await pool.query<Donation>(
    `SELECT ${DONATION_COLUMNS} FROM public.donations WHERE id = $1`,
    [id],
  );

  return result.rows[0];
};

export const findDonationSummaryRepository = async (): Promise<DonationSummary> => {
  const result = await pool.query<DonationSummary>(
    `WITH pending AS (
       SELECT COUNT(*)::int AS n FROM public.donations WHERE status = 'pending'
     )
     SELECT COALESCE(s.kg_rescued, 0)::float8 AS "kgRescued",
       COALESCE(s.daily_goal_percent, 0) AS "dailyGoalPercent",
       COALESCE(s.families, 0) AS families,
       COALESCE(s.deliveries, 0) AS deliveries,
       pending.n AS "pendingDonations"
     FROM pending
     LEFT JOIN public.donation_stats s ON s.id = 1`,
  );

  return result.rows[0];
};
