import { pool } from '../../db/db';
import { Product } from './product.types';

const PRODUCT_COLUMNS = 'id, name, category, shelf_life_days AS "shelfLifeDays", substitutes';

export const findAllProductsRepository = async (category?: string): Promise<Product[]> => {
  const result = await pool.query<Product>(
    `SELECT ${PRODUCT_COLUMNS}
     FROM public.products
     WHERE ($1::text IS NULL OR category = $1)
     ORDER BY created_at, id`,
    [category ?? null],
  );

  return result.rows;
};

export const findProductByIdRepository = async (id: string): Promise<Product | undefined> => {
  const result = await pool.query<Product>(
    `SELECT ${PRODUCT_COLUMNS} FROM public.products WHERE id = $1`,
    [id],
  );

  return result.rows[0];
};
