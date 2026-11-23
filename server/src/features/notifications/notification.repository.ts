import { pool } from '../../db/db';
import { CreatedNotification, Notification, NotificationType } from './notification.types';

const NOTIFICATION_COLUMNS = 'id, type, message, read, created_at AS "createdAt"';

export const findNotificationsByUserRepository = async (userId: string): Promise<Notification[]> => {
  const result = await pool.query<Notification>(
    `SELECT ${NOTIFICATION_COLUMNS}
     FROM public.notifications
     WHERE user_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT 50`,
    [userId],
  );

  return result.rows;
};

export const markNotificationAsReadRepository = async (
  userId: string,
  id: string,
): Promise<Notification | undefined> => {
  const result = await pool.query<Notification>(
    `UPDATE public.notifications
     SET read = true
     WHERE id = $1 AND user_id = $2
     RETURNING ${NOTIFICATION_COLUMNS}`,
    [id, userId],
  );

  return result.rows[0];
};

export const createNotificationsForRoleRepository = async (
  role: string,
  type: NotificationType,
  message: string,
): Promise<CreatedNotification[]> => {
  const result = await pool.query<CreatedNotification>(
    `INSERT INTO public.notifications (user_id, type, message)
     SELECT id, $2, $3 FROM public.users WHERE role = $1
     RETURNING id, user_id AS "userId"`,
    [role, type, message],
  );

  return result.rows;
};

export const createNotificationForRecipeAuthorRepository = async (
  recipeId: string,
  type: NotificationType,
  message: string,
): Promise<CreatedNotification | undefined> => {
  const result = await pool.query<CreatedNotification>(
    `INSERT INTO public.notifications (user_id, type, message)
     SELECT author_id, $2, $3 FROM public.recipes WHERE id = $1 AND author_id IS NOT NULL
     RETURNING id, user_id AS "userId"`,
    [recipeId, type, message],
  );

  return result.rows[0];
};

export const createNotificationForDonationOwnerRepository = async (
  donationId: string,
  type: NotificationType,
  message: string,
): Promise<CreatedNotification | undefined> => {
  const result = await pool.query<CreatedNotification>(
    `INSERT INTO public.notifications (user_id, type, message)
     SELECT user_id, $2, $3 FROM public.donations WHERE id = $1 AND user_id IS NOT NULL
     RETURNING id, user_id AS "userId"`,
    [donationId, type, message],
  );

  return result.rows[0];
};
