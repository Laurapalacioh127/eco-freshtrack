import type { CreateDonationInput } from '@/providers/DonationsProvider';
import type { InventoryItem } from '@/types';
import { formatExpiry } from '@/utils/format';

export const MAX_ITEMS_LENGTH = 300;

export interface DonationFormValues {
  picked: InventoryItem[];
  named: string[];
  zone: string;
  donorName: string;
  requireDonorName: boolean;
}

export type DonationFormErrors = Partial<Record<'items' | 'zone' | 'donorName', string>>;

export type DonationFormResult =
  | { ok: true; input: CreateDonationInput }
  | { ok: false; errors: DonationFormErrors };

export const buildDonationInput = (values: DonationFormValues): DonationFormResult => {
  const zone = values.zone.trim();
  const donorName = values.donorName.trim();
  const items = [...values.picked.map((item) => `${item.name} (${item.quantity})`), ...values.named].join(', ');
  const errors: DonationFormErrors = {};

  if (values.picked.length === 0 && values.named.length === 0) {
    errors.items = 'Elige o escribe al menos un alimento';
  } else if (items.length > MAX_ITEMS_LENGTH) {
    errors.items = 'La lista de alimentos supera 300 caracteres';
  }
  if (!zone) errors.zone = 'Indica el lugar de recogida';
  if (values.requireDonorName && !donorName) errors.donorName = 'Escribe el nombre del donante';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const input: CreateDonationInput = { zone, items };
  if (values.picked.length > 0) {
    input.expiresLabel = formatExpiry(Math.min(...values.picked.map((item) => item.expiresInDays)));
  }
  if (values.requireDonorName) input.donorName = donorName;

  return { ok: true, input };
};
