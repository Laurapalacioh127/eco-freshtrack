import { pool } from '../../db/db';
import { InventoryItemData, ShoppingItem } from './inventory.types';

const INVENTORY_COLUMNS =
  'id, name, category, quantity, (expires_on - CURRENT_DATE)::int AS "expiresInDays"';

export const findAllInventoryRepository = async (
  userId: string,
  category?: string,
): Promise<InventoryItemData[]> => {
  const result = await pool.query<InventoryItemData>(
    `SELECT ${INVENTORY_COLUMNS}
     FROM public.inventory_items
     WHERE user_id = $1 AND ($2::text IS NULL OR category = $2)
     ORDER BY created_at, id`,
    [userId, category ?? null],
  );

  return result.rows;
};

// Filtering by user_id means another user's item is indistinguishable from a missing one.
export const findInventoryByIdRepository = async (
  userId: string,
  id: string,
): Promise<InventoryItemData | undefined> => {
  const result = await pool.query<InventoryItemData>(
    `SELECT ${INVENTORY_COLUMNS} FROM public.inventory_items WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return result.rows[0];
};

export const findShoppingListRepository = async (userId: string): Promise<ShoppingItem[]> => {
  const result = await pool.query<ShoppingItem>(
    `SELECT id, name, quantity, reason, checked
     FROM public.shopping_items
     WHERE user_id = $1
     ORDER BY created_at, id`,
    [userId],
  );

  return result.rows;
};
