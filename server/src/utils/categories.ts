import Boom from '@hapi/boom';

export const PRODUCT_CATEGORIES = [
  'Frutas',
  'Verduras',
  'Lácteos',
  'Carnes',
  'Panadería',
  'Granos',
  'Bebidas',
  'Congelados',
  'Otros',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

const findCategory = (value: unknown): ProductCategory | undefined => {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().normalize('NFC');

  return PRODUCT_CATEGORIES.find((category) => category === normalized);
};

export const isProductCategory = (value: unknown): value is ProductCategory =>
  findCategory(value) !== undefined;

// Returns the canonical list value or throws 400 (message shown to the user).
export const readCategory = (
  body: Record<string, unknown>,
  field: string,
  label: string,
): ProductCategory => {
  const category = findCategory(body[field]);

  if (!category) {
    throw Boom.badRequest(`El campo "${label}" debe ser una de: ${PRODUCT_CATEGORIES.join(', ')}`);
  }

  return category;
};
