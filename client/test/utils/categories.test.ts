import { expect, test } from 'vitest';
import { toProductCategory } from '@/utils/categories';

test('toProductCategory keeps an exact category', () => {
  expect(toProductCategory('Lácteos')).toBe('Lácteos');
});

test('toProductCategory matches case-insensitively and trims', () => {
  expect(toProductCategory('  frutas ')).toBe('Frutas');
});

test('toProductCategory matches a decomposed accent', () => {
  expect(toProductCategory('Lácteos')).toBe('Lácteos');
});

test('toProductCategory returns an empty string for an unknown value', () => {
  expect(toProductCategory('Plant-based foods')).toBe('');
});
