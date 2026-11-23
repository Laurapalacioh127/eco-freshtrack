import type { SubmitRecipeInput } from '@/providers/RecipesProvider';

export interface RecipeFormValues {
  title: string;
  ingredients: string[];
  steps: string;
  minutes: string;
  servings: string;
}

export type RecipeFormResult = { ok: true; input: SubmitRecipeInput } | { ok: false; message: string };

// Accepts free text such as "20 minutos" or "2 personas" and keeps the leading number.
const parseCount = (value: string): number => {
  const match = value.trim().match(/^\d+/);
  return match ? Number(match[0]) : NaN;
};

// One step per line; drops numbering such as "1." or "2)" that users type by habit.
export const parseSteps = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.replace(/^\s*\d+\s*[.)-]?\s*/, '').trim())
    .filter(Boolean);

export const buildRecipeInput = (values: RecipeFormValues): RecipeFormResult => {
  const title = values.title.trim();
  const steps = parseSteps(values.steps);
  const minutes = parseCount(values.minutes);
  const servings = parseCount(values.servings);

  if (!title) return { ok: false, message: 'Escribe el título de la receta' };
  if (values.ingredients.length === 0) return { ok: false, message: 'Elige al menos un ingrediente' };
  if (steps.length === 0) return { ok: false, message: 'Escribe al menos un paso de preparación' };
  if (!Number.isInteger(minutes) || minutes < 1) return { ok: false, message: 'Indica el tiempo en minutos' };
  if (!Number.isInteger(servings) || servings < 1) return { ok: false, message: 'Indica el número de porciones' };

  return { ok: true, input: { title, minutes, servings, ingredients: values.ingredients, steps } };
};
