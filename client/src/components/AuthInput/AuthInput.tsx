'use client';

import { useId } from 'react';

interface AuthInputProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
}

export const AuthInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoComplete,
  error,
  disabled = false,
}: AuthInputProps) => {
  const errorId = useId();

  return (
    <label className="flex flex-col gap-1 text-xs font-semibold">
      {label}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-2xl border-2 bg-cream px-4 py-3 text-sm font-normal outline-none transition focus:bg-white disabled:opacity-60 ${
          error ? 'border-rose focus:border-rose' : 'border-transparent focus:border-brand'
        }`}
      />
      {error && (
        <span id={errorId} className="font-normal text-rose-dark">
          {error}
        </span>
      )}
    </label>
  );
};
