import { pool } from '../../db/db';
import { InventoryItemData, ShoppingItem } from './inventory.types';

const INVENTORY_COLUMNS =
  'id, name, category, quantity, (expires_on - CURRENT_DATE)::int AS "expiresInDays"';

export const findAllInventoryRepository = async (
  category?: string,
): Promise<InventoryItemData[]> => {
  const result = await pool.query<InventoryItemData>(
    `SELECT ${INVENTORY_COLUMNS}
     FROM public.inventory_items
     WHERE ($1::text IS NULL OR category = $1)
     ORDER BY created_at, id`,
    [category ?? null],
  );

  return result.rows;
};

export const findInventoryByIdRepository = async (
  id: string,
): Promise<InventoryItemData | undefined> => {
  const result = await pool.query<InventoryItemData>(
    `SELECT ${INVENTORY_COLUMNS} FROM public.inventory_items WHERE id = $1`,
    [id],
  );

  return result.rows[0];
};

export const findShoppingListRepository = async (): Promise<ShoppingItem[]> => {
  const result = await pool.query<ShoppingItem>(
    `SELECT id, name, quantity, reason, checked
     FROM public.shopping_items
     ORDER BY created_at, id`,
  );

  return result.rows;
};
