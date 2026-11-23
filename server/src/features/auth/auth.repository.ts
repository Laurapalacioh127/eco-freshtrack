import { pool } from '../../db/db';
import { AuthUser, CreateProfileData } from './auth.types';

const PROFILE_COLUMNS = 'id, email, name, role';

export const findProfileByIdRepository = async (id: string): Promise<AuthUser | undefined> => {
  const result = await pool.query<AuthUser>(
    `SELECT ${PROFILE_COLUMNS} FROM public.users WHERE id = $1`,
    [id],
  );

  return result.rows[0];
};

// Self-registration always creates a household profile; admins are promoted manually.
export const createProfileRepository = async ({
  id,
  email,
  name,
}: CreateProfileData): Promise<AuthUser> => {
  const result = await pool.query<AuthUser>(
    `INSERT INTO public.users (id, email, name, role)
     VALUES ($1, $2, $3, 'household')
     RETURNING ${PROFILE_COLUMNS}`,
    [id, email, name],
  );

  return result.rows[0];
};
