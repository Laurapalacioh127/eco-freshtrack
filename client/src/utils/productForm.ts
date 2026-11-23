import type { CreateProductInput } from '@/providers/ProductsProvider';
import { isProductCategory } from '@/utils/categories';

export interface ProductFormValues {
  name: string;
  category: string;
  shelfLifeDays: string;
  substitutes: string[];
}

export type ProductFormErrors = Partial<Record<'name' | 'category' | 'shelfLifeDays', string>>;

export type ProductFormResult =
  | { ok: true; input: CreateProductInput }
  | { ok: false; errors: ProductFormErrors };

export const buildProductInput = (values: ProductFormValues): ProductFormResult => {
  const name = values.name.trim();
  const days = values.shelfLifeDays.trim();
  const errors: ProductFormErrors = {};

  if (!name) errors.name = 'Escribe el nombre del producto';
  if (!isProductCategory(values.category)) errors.category = 'Elige una categoría';
  if (!/^\d+$/.test(days) || Number(days) < 1) {
    errors.shelfLifeDays = 'La vida útil debe ser un número entero de días mayor que 0';
  }

  if (Object.keys(errors).length > 0 || !isProductCategory(values.category)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: { name, category: values.category, shelfLifeDays: Number(days), substitutes: values.substitutes },
  };
};
