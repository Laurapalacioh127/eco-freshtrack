import { pool } from '../../db/db';
import { Recipe } from './recipe.types';

const RECIPE_SELECT = `
  WITH ing AS (
    SELECT recipe_id, json_agg(name ORDER BY position) AS ingredients
    FROM public.recipe_ingredients GROUP BY recipe_id
  ), st AS (
    SELECT recipe_id, json_agg(description ORDER BY position) AS steps
    FROM public.recipe_steps GROUP BY recipe_id
  )
  SELECT r.id, r.title, r.author, r.minutes, r.difficulty, r.servings,
    r.ingredients_available AS "ingredientsAvailable",
    r.ingredients_total AS "ingredientsTotal",
    r.status,
    COALESCE(ing.ingredients, '[]'::json) AS ingredients,
    COALESCE(st.steps, '[]'::json) AS steps
  FROM public.recipes r
  LEFT JOIN ing ON ing.recipe_id = r.id
  LEFT JOIN st ON st.recipe_id = r.id`;

export const findAllRecipesRepository = async (status?: string): Promise<Recipe[]> => {
  const result = await pool.query<Recipe>(
    `${RECIPE_SELECT}
     WHERE ($1::text IS NULL OR r.status = $1)
     ORDER BY r.created_at, r.id`,
    [status ?? null],
  );

  return result.rows;
};

export const findRecipeByIdRepository = async (id: string): Promise<Recipe | undefined> => {
  const result = await pool.query<Recipe>(`${RECIPE_SELECT} WHERE r.id = $1`, [id]);

  return result.rows[0];
};
