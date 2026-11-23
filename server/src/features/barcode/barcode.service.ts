import Boom from '@hapi/boom';
import { fetchOpenFoodFactsProductRepository } from './barcode.repository';
import { OpenFoodFactsProduct, ScannedProduct } from './barcode.types';

const IMAGE_PREFIX = 'https://images.openfoodfacts.org/';

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const pickName = (product: OpenFoodFactsProduct): string =>
  [product.product_name_es, product.product_name, product.generic_name]
    .map(clean)
    .find((value) => value !== '') ?? '';

// Only images hosted by Open Food Facts are exposed, so the client never loads arbitrary URLs.
const pickImageUrl = (product: OpenFoodFactsProduct): string | null => {
  const candidate = clean(product.image_front_url) || clean(product.image_url);

  return candidate.startsWith(IMAGE_PREFIX) ? candidate : null;
};

export const getProductByBarcodeService = async (code: string): Promise<ScannedProduct> => {
  const product = await fetchOpenFoodFactsProductRepository(code);
  const name = product ? pickName(product).slice(0, 120).trim() : '';

  if (!product || name === '') {
    throw Boom.notFound('No encontramos un producto con ese código de barras');
  }

  return {
    code,
    name,
    category: clean(clean(product.categories).split(',')[0]).slice(0, 60),
    imageUrl: pickImageUrl(product),
  };
};
