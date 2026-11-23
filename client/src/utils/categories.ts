import { PRODUCT_CATEGORIES, type ProductCategory } from '@/types';

export const isProductCategory = (value: string): value is ProductCategory =>
  (PRODUCT_CATEGORIES as readonly string[]).includes(value);

// Maps free text (e.g. from Open Food Facts) to a known category, or '' when unknown.
export const toProductCategory = (raw: string): ProductCategory | '' => {
  const normalized = raw.trim().normalize('NFC').toLowerCase();
  return PRODUCT_CATEGORIES.find((category) => category.normalize('NFC').toLowerCase() === normalized) ?? '';
};
