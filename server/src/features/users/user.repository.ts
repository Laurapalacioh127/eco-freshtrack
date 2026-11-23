import { pool } from '../../db/db';
import { User } from './user.types';

const USER_COLUMNS = 'id, name, email, role, points, kg_saved::float8 AS "kgSaved"';

export const findAllUsersRepository = async (role?: string): Promise<User[]> => {
  const result = await pool.query<User>(
    `SELECT ${USER_COLUMNS}
     FROM public.users
     WHERE ($1::text IS NULL OR role = $1)
     ORDER BY created_at, id`,
    [role ?? null],
  );

  return result.rows;
};

export const findUserByIdRepository = async (id: string): Promise<User | undefined> => {
  const result = await pool.query<User>(
    `SELECT ${USER_COLUMNS} FROM public.users WHERE id = $1`,
    [id],
  );

  return result.rows[0];
};
