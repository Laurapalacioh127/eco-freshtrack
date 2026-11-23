import type { AddInventoryItemInput } from '@/providers/InventoryProvider';
import { isProductCategory } from '@/utils/categories';

export interface InventoryFormValues {
  name: string;
  category: string;
  quantity: string;
  expiresOn: string;
}

export type InventoryFormErrors = Partial<Record<keyof InventoryFormValues, string>>;

export type InventoryFormResult =
  | { ok: true; input: AddInventoryItemInput }
  | { ok: false; errors: InventoryFormErrors };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const buildInventoryItemInput = (values: InventoryFormValues): InventoryFormResult => {
  const name = values.name.trim();
  const category = values.category.trim();
  const quantity = values.quantity.trim();
  const expiresOn = values.expiresOn.trim();
  const errors: InventoryFormErrors = {};

  if (!name) errors.name = 'Escribe el nombre del alimento';
  else if (name.length > 120) errors.name = 'Máximo 120 caracteres';

  if (!isProductCategory(category)) errors.category = 'Elige una categoría';

  if (!quantity) errors.quantity = 'Indica la cantidad';
  else if (quantity.length > 40) errors.quantity = 'Máximo 40 caracteres';

  if (!DATE_PATTERN.test(expiresOn)) errors.expiresOn = 'Elige la fecha de vencimiento';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, input: { name, category, quantity, expiresOn } };
};
