import { expect, test } from 'vitest';
import { buildFeed } from '@/utils/feed';
import { buildRecipeInput, parseSteps } from '@/utils/recipeForm';
import { hasId, upsertById } from '@/utils/upsertById';
import type { Donation } from '@/types';

test('upsertById appends an item with a new id', () => {
  expect(upsertById([{ id: 'a', n: 1 }], { id: 'b', n: 2 })).toEqual([{ id: 'a', n: 1 }, { id: 'b', n: 2 }]);
});

test('upsertById replaces an item with an existing id in place', () => {
  expect(upsertById([{ id: 'a', n: 1 }, { id: 'b', n: 2 }], { id: 'a', n: 3 })).toEqual([
    { id: 'a', n: 3 },
    { id: 'b', n: 2 },
  ]);
});

test('hasId rejects payloads without a string id', () => {
  expect(hasId({ id: 1 })).toBe(false);
});

test('parseSteps keeps one step per line and drops typed numbering', () => {
  expect(parseSteps('1. Lavar\n\n2) Cortar\nServir')).toEqual(['Lavar', 'Cortar', 'Servir']);
});

test('buildRecipeInput reads the leading number from free-text time and servings', () => {
  const result = buildRecipeInput({
    title: ' Sopa ', ingredients: ['Papa'], steps: '1. Hervir', minutes: '20 minutos', servings: '2 personas',
  });

  expect(result).toEqual({
    ok: true,
    input: { title: 'Sopa', minutes: 20, servings: 2, ingredients: ['Papa'], steps: ['Hervir'] },
  });
});

test('buildRecipeInput asks for at least one ingredient', () => {
  const result = buildRecipeInput({ title: 'Sopa', ingredients: [], steps: 'Hervir', minutes: '20', servings: '2' });

  expect(result).toEqual({ ok: false, message: 'Elige al menos un ingrediente' });
});

test('buildFeed shows the newest pending donation first', () => {
  const base = { donorName: 'Ana', zone: 'Cali', expiresLabel: 'Hoy', status: 'pending' } as const;
  const donations: Donation[] = [
    { ...base, id: 'old', items: 'Pan' },
    { ...base, id: 'new', items: 'Leche' },
  ];

  expect(buildFeed(donations, [])[0].id).toBe('donation-new');
});
