'use client';

import { useId } from 'react';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/types';

interface CategorySelectProps {
  label?: string;
  value: ProductCategory | '';
  onChange: (value: ProductCategory | '') => void;
  error?: string;
  disabled?: boolean;
}

export const CategorySelect = ({ label = 'Categoría', value, onChange, error, disabled = false }: CategorySelectProps) => {
  const errorId = useId();

  return (
    <label className="flex flex-col gap-1 text-xs font-semibold">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ProductCategory | '')}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-2xl border-2 bg-cream px-4 py-3 text-sm font-normal outline-none transition focus:bg-white disabled:opacity-60 ${
          error ? 'border-rose focus:border-rose' : 'border-transparent focus:border-brand'
        }`}
      >
        <option value="">Selecciona una categoría</option>
        {PRODUCT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} role="alert" className="font-normal text-rose-dark">
          {error}
        </span>
      )}
    </label>
  );
};
