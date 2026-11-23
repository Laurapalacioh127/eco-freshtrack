import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isProductCategory, PRODUCT_CATEGORIES, readCategory } from '../../src/utils/categories';

test('PRODUCT_CATEGORIES is the agreed list of nine categories', () => {
  assert.deepEqual(
    [...PRODUCT_CATEGORIES],
    ['Frutas', 'Verduras', 'Lácteos', 'Carnes', 'Panadería', 'Granos', 'Bebidas', 'Congelados', 'Otros'],
  );
});

test('isProductCategory accepts Lácteos', () => {
  assert.equal(isProductCategory('Lácteos'), true);
});

test('isProductCategory rejects Enlatados', () => {
  assert.equal(isProductCategory('Enlatados'), false);
});

test('isProductCategory accepts a value with surrounding spaces', () => {
  assert.equal(isProductCategory('  Frutas '), true);
});

test('isProductCategory accepts a decomposed (NFD) accent', () => {
  assert.equal(isProductCategory('Lácteos'), true);
});

test('isProductCategory rejects a non-string value', () => {
  assert.equal(isProductCategory(5), false);
});

test('readCategory returns the canonical value for a decomposed accent', () => {
  assert.equal(readCategory({ category: ' Lácteos ' }, 'category', 'categoría'), 'Lácteos');
});

test('readCategory throws 400 with the list message when the field is missing', () => {
  assert.throws(
    () => readCategory({}, 'category', 'categoría'),
    (error: { output?: { statusCode: number; payload: { message: string } } }) =>
      error.output?.statusCode === 400 &&
      error.output.payload.message ===
        'El campo "categoría" debe ser una de: Frutas, Verduras, Lácteos, Carnes, Panadería, Granos, Bebidas, Congelados, Otros',
  );
});
