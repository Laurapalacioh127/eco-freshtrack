'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AddInventoryItemInput } from '@/providers/InventoryProvider';
import { buildInventoryItemInput, type InventoryFormErrors, type InventoryFormValues } from '@/utils/inventoryForm';
import { AuthInput } from '@/components/AuthInput/AuthInput';

interface InventoryItemFormProps {
  submitting: boolean;
  initialValues?: Partial<InventoryFormValues>;
  onSubmit: (input: AddInventoryItemInput) => void | Promise<void>;
}

export const InventoryItemForm = ({ submitting, initialValues, onSubmit }: InventoryItemFormProps) => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [quantity, setQuantity] = useState(initialValues?.quantity ?? '');
  const [expiresOn, setExpiresOn] = useState(initialValues?.expiresOn ?? '');
  const [errors, setErrors] = useState<InventoryFormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = buildInventoryItemInput({ name, category, quantity, expiresOn });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit(result.input);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-md flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm"
    >
      <AuthInput
        label="Nombre del alimento"
        placeholder="Yogur natural"
        value={name}
        onChange={setName}
        error={errors.name}
      />
      <AuthInput
        label="Categoría"
        placeholder="Lácteos"
        value={category}
        onChange={setCategory}
        error={errors.category}
      />
      <AuthInput
        label="Cantidad"
        placeholder="350 g"
        value={quantity}
        onChange={setQuantity}
        error={errors.quantity}
      />
      <AuthInput
        label="Fecha de vencimiento"
        type="date"
        placeholder=""
        value={expiresOn}
        onChange={setExpiresOn}
        error={errors.expiresOn}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Guardando…' : 'Guardar en inventario ✓'}
        </button>
        <Link
          href="/user/scan"
          className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
};
