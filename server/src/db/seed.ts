import { PoolClient } from 'pg';
import { withTransaction } from './db';
import { usersMock } from '../features/users/data.mock';
import { productsMock } from '../features/products/data.mock';
import { inventoryMock, shoppingListMock } from '../features/inventory/data.mock';
import { recipesMock } from '../features/recipes/data.mock';
import { donationsMock, donationSummaryMock } from '../features/donations/data.mock';

const ALLOWED_TABLES = [
  'users',
  'products',
  'recipes',
  'inventory_items',
  'shopping_items',
  'donations',
  'donation_stats',
] as const;

type AllowedTable = (typeof ALLOWED_TABLES)[number];

const buildIds = (base: number, mockIds: string[]): Record<string, string> =>
  Object.fromEntries(
    mockIds.map((mockId, index) => [
      mockId,
      `00000000-0000-4000-8000-00000000${String(base + index + 1).padStart(4, '0')}`,
    ]),
  );

export const SEED_IDS = {
  users: buildIds(600, usersMock.map((user) => user.id)),
  products: buildIds(100, productsMock.map((product) => product.id)),
  inventory: buildIds(200, inventoryMock.map((item) => item.id)),
  shopping: buildIds(300, shoppingListMock.map((item) => item.id)),
  recipes: buildIds(400, recipesMock.map((recipe) => recipe.id)),
  donations: buildIds(500, donationsMock.map((donation) => donation.id)),
};

const isTableEmpty = async (client: PoolClient, table: AllowedTable): Promise<boolean> => {
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error('Table not allowed');
  }

  const result = await client.query<{ present: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM public.${table}) AS present`,
  );

  return !result.rows[0].present;
};

export const seedDb = async (): Promise<void> => {
  await withTransaction(async (client) => {
    if (await isTableEmpty(client, 'users')) {
      for (const user of usersMock) {
        await client.query(
          `INSERT INTO public.users (id, name, email, role, points, kg_saved)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [SEED_IDS.users[user.id], user.name, user.email, user.role, user.points, user.kgSaved],
        );
      }
    }

    if (await isTableEmpty(client, 'products')) {
      for (const product of productsMock) {
        await client.query(
          `INSERT INTO public.products (id, name, category, shelf_life_days, substitutes)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [
            SEED_IDS.products[product.id],
            product.name,
            product.category,
            product.shelfLifeDays,
            product.substitutes,
          ],
        );
      }
    }

    if (await isTableEmpty(client, 'recipes')) {
      for (const recipe of recipesMock) {
        const recipeId = SEED_IDS.recipes[recipe.id];
        await client.query(
          `INSERT INTO public.recipes
             (id, author, title, minutes, difficulty, servings, ingredients_available, ingredients_total, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT DO NOTHING`,
          [
            recipeId,
            recipe.author,
            recipe.title,
            recipe.minutes,
            recipe.difficulty,
            recipe.servings,
            recipe.ingredientsAvailable,
            recipe.ingredientsTotal,
            recipe.status,
          ],
        );

        for (const [position, name] of recipe.ingredients.entries()) {
          await client.query(
            `INSERT INTO public.recipe_ingredients (recipe_id, position, name)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [recipeId, position, name],
          );
        }

        for (const [position, description] of recipe.steps.entries()) {
          await client.query(
            `INSERT INTO public.recipe_steps (recipe_id, position, description)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [recipeId, position, description],
          );
        }
      }
    }

    const ownerId = SEED_IDS.users.u1;

    if (await isTableEmpty(client, 'inventory_items')) {
      for (const item of inventoryMock) {
        await client.query(
          `INSERT INTO public.inventory_items (id, user_id, name, category, quantity, expires_on)
           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE + $6::int)
           ON CONFLICT DO NOTHING`,
          [
            SEED_IDS.inventory[item.id],
            ownerId,
            item.name,
            item.category,
            item.quantity,
            item.expiresInDays,
          ],
        );
      }
    }

    if (await isTableEmpty(client, 'shopping_items')) {
      for (const item of shoppingListMock) {
        await client.query(
          `INSERT INTO public.shopping_items (id, user_id, name, quantity, reason, checked)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [SEED_IDS.shopping[item.id], ownerId, item.name, item.quantity, item.reason, item.checked],
        );
      }
    }

    if (await isTableEmpty(client, 'donations')) {
      for (const donation of donationsMock) {
        await client.query(
          `INSERT INTO public.donations (id, donor_name, zone, items, expires_label, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [
            SEED_IDS.donations[donation.id],
            donation.donorName,
            donation.zone,
            donation.items,
            donation.expiresLabel,
            donation.status,
          ],
        );
      }
    }

    if (await isTableEmpty(client, 'donation_stats')) {
      await client.query(
        `INSERT INTO public.donation_stats (id, kg_rescued, daily_goal_percent, families, deliveries)
         VALUES (1, $1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [
          donationSummaryMock.kgRescued,
          donationSummaryMock.dailyGoalPercent,
          donationSummaryMock.families,
          donationSummaryMock.deliveries,
        ],
      );
    }
  });
};
