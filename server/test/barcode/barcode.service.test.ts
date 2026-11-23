import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
import Boom from '@hapi/boom';

type AsyncFn = (...args: unknown[]) => Promise<unknown>;
const fetchOpenFoodFactsProductRepository = mock.fn<AsyncFn>();

mock.module('../../src/features/barcode/barcode.repository', {
  namedExports: { fetchOpenFoodFactsProductRepository },
});

let getProductByBarcodeService: (code: string) => Promise<unknown>;
before(async () => {
  ({ getProductByBarcodeService } = await import('../../src/features/barcode/barcode.service.js'));
});

beforeEach(() => fetchOpenFoodFactsProductRepository.mock.resetCalls());

const CODE = '7702001043276';
const IMG = 'https://images.openfoodfacts.org/images/products/front.jpg';

const rejectsWith = async (status: number): Promise<void> => {
  await assert.rejects(getProductByBarcodeService(CODE), (err: unknown) => {
    assert.ok(Boom.isBoom(err));
    assert.equal(err.output.statusCode, status);
    return true;
  });
};

test('maps a full Open Food Facts product', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => ({
    product_name_es: 'Leche entera',
    product_name: 'Whole milk',
    categories: 'Lácteos, Leches',
    image_front_url: IMG,
  }));

  assert.deepEqual(await getProductByBarcodeService(CODE), {
    code: CODE,
    name: 'Leche entera',
    category: 'Lácteos',
    imageUrl: IMG,
  });
});

test('defaults category to empty and imageUrl to null', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => ({ product_name: 'Arroz' }));

  assert.deepEqual(await getProductByBarcodeService(CODE), { code: CODE, name: 'Arroz', category: '', imageUrl: null });
});

test('drops images not hosted by Open Food Facts', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => ({
    product_name: 'Arroz',
    image_url: 'http://evil.example/x.jpg',
  }));

  const result = (await getProductByBarcodeService(CODE)) as { imageUrl: string | null };
  assert.equal(result.imageUrl, null);
});

test('cuts the name to 120 characters', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => ({ product_name: 'a'.repeat(200) }));

  const result = (await getProductByBarcodeService(CODE)) as { name: string };
  assert.equal(result.name.length, 120);
});

test('throws 404 when the repository returns null', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => null);

  await rejectsWith(404);
});

test('throws 404 when the name is blank', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => ({ product_name: '  ' }));

  await rejectsWith(404);
});

test('propagates a gateway timeout from the repository', async () => {
  fetchOpenFoodFactsProductRepository.mock.mockImplementation(async () => {
    throw Boom.gatewayTimeout('slow');
  });

  await rejectsWith(504);
});
