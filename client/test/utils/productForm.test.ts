import { expect, test } from 'vitest';
import { buildProductInput } from '@/utils/productForm';

const valid = { name: ' Kiwi ', category: 'Frutas', shelfLifeDays: '10', substitutes: ['Fresa'] };
const DAYS_MESSAGE = 'La vida útil debe ser un número entero de días mayor que 0';

test('returns the trimmed input for valid values', () => {
  expect(buildProductInput(valid)).toEqual({
    ok: true,
    input: { name: 'Kiwi', category: 'Frutas', shelfLifeDays: 10, substitutes: ['Fresa'] },
  });
});

test('collects the three errors for an empty form', () => {
  expect(buildProductInput({ name: '', category: '', shelfLifeDays: '', substitutes: [] })).toEqual({
    ok: false,
    errors: {
      name: 'Escribe el nombre del producto',
      category: 'Elige una categoría',
      shelfLifeDays: DAYS_MESSAGE,
    },
  });
});

test('rejects zero shelf life days', () => {
  expect(buildProductInput({ ...valid, shelfLifeDays: '0' })).toEqual({ ok: false, errors: { shelfLifeDays: DAYS_MESSAGE } });
});

test('rejects a decimal shelf life', () => {
  expect(buildProductInput({ ...valid, shelfLifeDays: '2.5' })).toEqual({ ok: false, errors: { shelfLifeDays: DAYS_MESSAGE } });
});

test('rejects a category outside the list', () => {
  expect(buildProductInput({ ...valid, category: 'Enlatados' })).toEqual({
    ok: false,
    errors: { category: 'Elige una categoría' },
  });
});
