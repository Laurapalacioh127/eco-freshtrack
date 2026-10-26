'use client';

interface AuthInputProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export const AuthInput = ({ label, type = 'text', placeholder, value, onChange }: AuthInputProps) => (
  <label className="flex flex-col gap-1 text-xs font-semibold">
    {label}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-black/40"
    />
  </label>
);