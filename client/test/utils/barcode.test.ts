import { expect, test } from 'vitest';
import { normalizeBarcode } from '@/utils/barcode';

test('strips spaces and dashes', () => {
  expect(normalizeBarcode(' 7702-0010 43276 ')).toBe('7702001043276');
});

test('returns null for non-digits', () => {
  expect(normalizeBarcode('abc')).toBeNull();
});

test('returns null for 7 digits', () => {
  expect(normalizeBarcode('1234567')).toBeNull();
});

test('accepts 8 digits', () => {
  expect(normalizeBarcode('12345678')).toBe('12345678');
});
