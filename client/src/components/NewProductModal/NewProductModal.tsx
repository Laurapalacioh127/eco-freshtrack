'use client';

import { useState } from 'react';
import { useProducts } from '@/providers/ProductsProvider';
import { useToast } from '@/providers/ToastProvider';
import { buildProductInput, type ProductFormErrors } from '@/utils/productForm';
import type { ProductCategory } from '@/types';
import { AuthInput } from '@/components/AuthInput/AuthInput';
import { CategorySelect } from '@/components/CategorySelect/CategorySelect';
import { ChipInput } from '@/components/ChipInput/ChipInput';

export const NewProductModal = ({ onClose }: { onClose: () => void }) => {
  const { createProduct } = useProducts();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [shelfLife, setShelfLife] = useState('');
  const [substitutes, setSubstitutes] = useState<string[]>([]);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: keyof ProductFormErrors) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = buildProductInput({ name, category, shelfLifeDays: shelfLife, substitutes });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await createProduct(result.input);
      showToast('Producto agregado al catálogo', 'success');
      onClose();
    } catch (err) {
      showToast((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-product-title"
        onSubmit={handleSubmit}
        noValidate
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 id="new-product-title" className="text-2xl font-light">
          Nuevo producto maestro
        </h2>
        <p className="text-sm text-neutral-600">Agrega un alimento al catálogo central.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <AuthInput
            label="Nombre"
            placeholder="Nombre del producto"
            value={name}
            onChange={(value) => {
              setName(value);
              clearError('name');
            }}
            error={errors.name}
            disabled={submitting}
          />
          <CategorySelect
            value={category}
            onChange={(value) => {
              setCategory(value);
              clearError('category');
            }}
            error={errors.category}
            disabled={submitting}
          />
          <AuthInput
            label="Días de vida útil"
            placeholder="Ej. 7"
            value={shelfLife}
            onChange={(value) => {
              setShelfLife(value);
              clearError('shelfLifeDays');
            }}
            error={errors.shelfLifeDays}
            disabled={submitting}
          />
        </div>
        <ChipInput
          label="Sustitutos"
          placeholder="Ej. Yogur griego"
          values={substitutes}
          onChange={setSubstitutes}
          disabled={submitting}
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => onClose()}
            disabled={submitting}
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
