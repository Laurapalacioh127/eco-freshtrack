import { PRODUCT_CATEGORIES } from '../utils/categories';
import { withTransaction } from './db';

const seedId = (number: number): string =>
  `00000000-0000-4000-8000-00000000${String(number).padStart(4, '0')}`;

const range = (first: number, last: number): string[] =>
  Array.from({ length: last - first + 1 }, (_, index) => seedId(first + index));

// Ids of the demo rows that older versions inserted at dev startup.
// Catalog products (0101-0104) and the admin Andrea (0602) are kept on purpose.
export const SEED_ROW_IDS = {
  usersToDelete: [seedId(601)],
  usersToDeleteEmails: ['valentina@correo.com'],
  seededUsers: [seedId(601), seedId(602)],
  inventory: range(201, 207),
  shopping: range(301, 304),
  recipes: range(401, 406),
  donations: range(501, 503),
};

// Idempotent: removes only the known seeded rows, never rows users created.
export const cleanupSeedDataDb = async (): Promise<void> => {
  await withTransaction(async (client) => {
    await client.query(
      'DELETE FROM public.shopping_items WHERE id = ANY($1::uuid[]) AND user_id = ANY($2::uuid[])',
      [SEED_ROW_IDS.shopping, SEED_ROW_IDS.seededUsers],
    );
    await client.query(
      'DELETE FROM public.inventory_items WHERE id = ANY($1::uuid[]) AND user_id = ANY($2::uuid[])',
      [SEED_ROW_IDS.inventory, SEED_ROW_IDS.seededUsers],
    );
    await client.query(
      'DELETE FROM public.donations WHERE id = ANY($1::uuid[]) AND user_id IS NULL',
      [SEED_ROW_IDS.donations],
    );
    // recipe_ingredients and recipe_steps cascade (ON DELETE CASCADE).
    await client.query(
      'DELETE FROM public.recipes WHERE id = ANY($1::uuid[]) AND author_id IS NULL',
      [SEED_ROW_IDS.recipes],
    );
    await client.query('DELETE FROM public.donation_stats WHERE id = 1');
    // Remaining FKs to users are CASCADE (inventory, shopping) or SET NULL (recipes, donations).
    await client.query(
      'DELETE FROM public.users WHERE id = ANY($1::uuid[]) AND email = ANY($2::text[])',
      [SEED_ROW_IDS.usersToDelete, SEED_ROW_IDS.usersToDeleteEmails],
    );
  });
};

// Legacy rows used free-text categories; map anything outside the list to 'Otros'.
export const normalizeLegacyCategoriesDb = async (): Promise<void> => {
  await withTransaction(async (client) => {
    for (const table of ['products', 'inventory_items'] as const) {
      await client.query(
        `UPDATE public.${table} SET category = 'Otros' WHERE NOT (category = ANY($1::text[]))`,
        [PRODUCT_CATEGORIES],
      );
    }
  });
};
