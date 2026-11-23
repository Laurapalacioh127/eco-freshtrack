import { expect, test } from 'vitest';
import { buildRecipeInput, parseSteps } from '@/utils/recipeForm';

const empty = { title: '', ingredients: [], steps: '', minutes: '', servings: '' };

test('collects every error when the form is empty', () => {
  expect(buildRecipeInput(empty)).toEqual({
    ok: false,
    errors: {
      title: 'Escribe el título de la receta',
      ingredients: 'Elige al menos un ingrediente',
      steps: 'Escribe al menos un paso de preparación',
      minutes: 'Indica el tiempo en minutos',
      servings: 'Indica el número de porciones',
    },
  });
});

test('returns the parsed input for valid values', () => {
  const result = buildRecipeInput({
    title: 'Sopa', ingredients: ['Papa'], steps: '1. Hervir\n2) Servir', minutes: '20 minutos', servings: '2 personas',
  });

  expect(result).toEqual({
    ok: true,
    input: { title: 'Sopa', minutes: 20, servings: 2, ingredients: ['Papa'], steps: ['Hervir', 'Servir'] },
  });
});

test('flags non-numeric minutes', () => {
  const result = buildRecipeInput({ title: 'Sopa', ingredients: ['Papa'], steps: 'Hervir', minutes: 'rápido', servings: '2' });

  expect(result).toEqual({ ok: false, errors: { minutes: 'Indica el tiempo en minutos' } });
});

test('rejects zero servings', () => {
  const result = buildRecipeInput({ title: 'Sopa', ingredients: ['Papa'], steps: 'Hervir', minutes: '5', servings: '0' });

  expect(result).toEqual({ ok: false, errors: { servings: 'Indica el número de porciones' } });
});

test('parseSteps drops blank lines', () => {
  expect(parseSteps('Hervir\n\n  \nServir')).toEqual(['Hervir', 'Servir']);
});
