'use client';

import { useId, useState } from 'react';

interface ChipInputProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  disabled?: boolean;
  maxItems?: number;
  maxLength?: number;
  addLabel?: string;
}

export const ChipInput = ({
  label,
  placeholder,
  values,
  onChange,
  error,
  disabled = false,
  maxItems = 30,
  maxLength = 300,
  addLabel = 'Agregar',
}: ChipInputProps) => {
  const errorId = useId();
  const inputId = useId();
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    const duplicate = values.some((existing) => existing.toLowerCase() === value.toLowerCase());
    if (!duplicate && values.length < maxItems) onChange([...values, value]);
    setDraft('');
  };

  const remove = (value: string) => onChange(values.filter((existing) => existing !== value));

  return (
    <div className="flex flex-col gap-1 text-xs font-semibold">
      <label htmlFor={inputId}>{label}</label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          placeholder={placeholder}
          value={draft}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // Keep the surrounding form from submitting.
              e.preventDefault();
              add();
            }
          }}
          className={`min-w-0 flex-1 rounded-2xl border-2 bg-cream px-4 py-3 text-sm font-normal outline-none transition focus:bg-white disabled:opacity-60 ${
            error ? 'border-rose focus:border-rose' : 'border-transparent focus:border-brand'
          }`}
        />
        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {addLabel}
        </button>
      </div>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => (
            <li key={value} className="flex items-center gap-1 rounded-full bg-sun px-3 py-1 text-xs font-semibold">
              {value}
              <button
                type="button"
                aria-label={`Quitar ${value}`}
                onClick={() => remove(value)}
                disabled={disabled}
                className="px-1 disabled:opacity-60"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <span id={errorId} role="alert" className="font-normal text-rose-dark">
          {error}
        </span>
      )}
    </div>
  );
};
