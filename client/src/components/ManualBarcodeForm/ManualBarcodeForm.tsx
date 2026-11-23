'use client';

import { useState } from 'react';
import { normalizeBarcode } from '@/utils/barcode';

interface ManualBarcodeFormProps {
  onSubmit: (code: string) => void;
}

export const ManualBarcodeForm = ({ onSubmit }: ManualBarcodeFormProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeBarcode(value);
    if (!code) {
      setError('Ingresa un código de 8 a 14 dígitos');
      return;
    }
    setError(null);
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-sm flex-col gap-2">
      <label htmlFor="barcode-input" className="text-sm font-semibold">
        Código de barras
      </label>
      <div className="flex gap-2">
        <input
          id="barcode-input"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="7701234567890"
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-ink"
        />
        <button
          type="submit"
          className="rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-5 py-2.5 text-sm font-semibold"
        >
          Buscar producto
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
};
