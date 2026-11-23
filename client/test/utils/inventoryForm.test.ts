import { expect, test } from 'vitest';
import { buildInventoryItemInput } from '@/utils/inventoryForm';

const valid = { name: 'Leche', category: 'Lácteos', quantity: '1 L', expiresOn: '2030-01-15' };

test('returns an error for each of the four blank fields', () => {
  const result = buildInventoryItemInput({ name: '', category: ' ', quantity: '', expiresOn: '' });

  expect(result).toEqual({
    ok: false,
    errors: {
      name: 'Escribe el nombre del alimento',
      category: 'Indica la categoría',
      quantity: 'Indica la cantidad',
      expiresOn: 'Elige la fecha de vencimiento',
    },
  });
});

test('asks for the expiry date when it is empty', () => {
  const result = buildInventoryItemInput({ ...valid, expiresOn: '' });

  expect(result).toEqual({ ok: false, errors: { expiresOn: 'Elige la fecha de vencimiento' } });
});

test('returns the trimmed input for padded valid values', () => {
  const result = buildInventoryItemInput({ name: '  Leche ', category: ' Lácteos', quantity: '1 L  ', expiresOn: '2030-01-15' });

  expect(result).toEqual({ ok: true, input: valid });
});

test('rejects a name longer than 120 characters', () => {
  const result = buildInventoryItemInput({ ...valid, name: 'a'.repeat(121) });

  expect(result).toEqual({ ok: false, errors: { name: 'Máximo 120 caracteres' } });
});
