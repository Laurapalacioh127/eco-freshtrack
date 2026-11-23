'use client';

import { useState } from 'react';
import type { CreateDonationInput } from '@/providers/DonationsProvider';
import type { InventoryItem } from '@/types';
import { buildDonationInput, type DonationFormErrors } from '@/utils/donationForm';
import { AuthInput } from '@/components/AuthInput/AuthInput';
import { ChipInput } from '@/components/ChipInput/ChipInput';
import { DonationItemRow } from '@/components/DonationItemRow/DonationItemRow';

interface DonationFormProps {
  inventoryItems?: InventoryItem[];
  requireDonorName?: boolean;
  submitting: boolean;
  onSubmit: (input: CreateDonationInput) => void | Promise<void>;
  onCancel: () => void;
}

export const DonationForm = ({
  inventoryItems = [],
  requireDonorName = false,
  submitting,
  onSubmit,
  onCancel,
}: DonationFormProps) => {
  const [donorName, setDonorName] = useState('');
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [named, setNamed] = useState<string[]>([]);
  const [zone, setZone] = useState('');
  const [errors, setErrors] = useState<DonationFormErrors>({});

  const donable = inventoryItems
    .filter((item) => item.status !== 'expired')
    .sort((a, b) => a.expiresInDays - b.expiresInDays);

  const clearError = (field: keyof DonationFormErrors) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const togglePicked = (id: string) => {
    clearError('items');
    setPickedIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = buildDonationInput({
      picked: donable.filter((item) => pickedIds.includes(item.id)),
      named,
      zone,
      donorName,
      requireDonorName,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit(result.input);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {requireDonorName && (
        <AuthInput
          label="Nombre del donante"
          placeholder="Ej. Panadería La Esperanza"
          value={donorName}
          onChange={(value) => {
            setDonorName(value);
            clearError('donorName');
          }}
          error={errors.donorName}
          disabled={submitting}
        />
      )}

      {donable.length > 0 && (
        <fieldset className="flex flex-col gap-3 rounded-2xl bg-sun/40 p-4" disabled={submitting}>
          <legend className="px-1 text-xs font-semibold">Tus alimentos</legend>
          {donable.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={pickedIds.includes(item.id)}
                onChange={() => togglePicked(item.id)}
                aria-label={`Donar ${item.name}`}
              />
              <div className="flex-1">
                <DonationItemRow item={item} />
              </div>
            </label>
          ))}
        </fieldset>
      )}

      <ChipInput
        label="Otros alimentos"
        placeholder="Ej. 2 kg de arroz"
        values={named}
        onChange={(values) => {
          setNamed(values);
          clearError('items');
        }}
        error={errors.items}
        disabled={submitting}
      />

      <AuthInput
        label="Lugar de recogida"
        placeholder="Calle 8 #34-20, Cali"
        value={zone}
        onChange={(value) => {
          setZone(value);
          clearError('zone');
        }}
        error={errors.zone}
        disabled={submitting}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Registrando…' : 'Confirmar donación ♡'}
        </button>
        <button
          type="button"
          onClick={() => onCancel()}
          disabled={submitting}
          className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
