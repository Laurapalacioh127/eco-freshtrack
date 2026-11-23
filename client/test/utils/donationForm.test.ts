import { expect, test } from 'vitest';
import { buildDonationInput } from '@/utils/donationForm';
import type { InventoryItem } from '@/types';

const item = (name: string, quantity: string, expiresInDays: number): InventoryItem => ({
  id: name, name, category: 'Frutas', quantity, expiresInDays, status: 'ok',
});
const base = { picked: [], named: [], zone: 'Cali', donorName: '', requireDonorName: false };

test('lists picked items as "Name (qty)" then named ones and uses the earliest expiry', () => {
  const result = buildDonationInput({ ...base, picked: [item('Pan', '2', 3), item('Leche', '1 L', 1)], named: ['Arroz'] });

  expect(result).toEqual({
    ok: true,
    input: { zone: 'Cali', items: 'Pan (2), Leche (1 L), Arroz', expiresLabel: 'Vence mañana' },
  });
});

test('omits expiresLabel when only named items are given', () => {
  const result = buildDonationInput({ ...base, named: ['Arroz'] });

  expect(result).toEqual({ ok: true, input: { zone: 'Cali', items: 'Arroz' } });
});

test('requires at least one food', () => {
  expect(buildDonationInput(base)).toEqual({ ok: false, errors: { items: 'Elige o escribe al menos un alimento' } });
});

test('rejects a list longer than 300 characters', () => {
  const result = buildDonationInput({ ...base, named: ['a'.repeat(301)] });

  expect(result).toEqual({ ok: false, errors: { items: 'La lista de alimentos supera 300 caracteres' } });
});

test('requires the pickup place', () => {
  const result = buildDonationInput({ ...base, named: ['Arroz'], zone: '  ' });

  expect(result).toEqual({ ok: false, errors: { zone: 'Indica el lugar de recogida' } });
});

test('requires the donor name when requireDonorName is set', () => {
  const result = buildDonationInput({ ...base, named: ['Arroz'], requireDonorName: true });

  expect(result).toEqual({ ok: false, errors: { donorName: 'Escribe el nombre del donante' } });
});

test('includes the trimmed donor name when requireDonorName is set', () => {
  const result = buildDonationInput({ ...base, named: ['Arroz'], requireDonorName: true, donorName: ' Ana ' });

  expect(result).toEqual({ ok: true, input: { zone: 'Cali', items: 'Arroz', donorName: 'Ana' } });
});
