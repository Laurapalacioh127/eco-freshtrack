'use client';

import { useId } from 'react';

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const TextAreaField = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
}: TextAreaFieldProps) => {
  const errorId = useId();

  return (
    <label className="flex flex-col gap-1 text-xs font-semibold">
      {label}
      <textarea
        rows={5}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-2xl border-2 bg-cream px-4 py-3 text-sm font-normal outline-none transition focus:bg-white disabled:opacity-60 ${
          error ? 'border-rose focus:border-rose' : 'border-transparent focus:border-brand'
        }`}
      />
      {error && (
        <span id={errorId} role="alert" className="font-normal text-rose-dark">
          {error}
        </span>
      )}
    </label>
  );
};
