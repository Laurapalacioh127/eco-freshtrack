'use client';

interface SearchBoxProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchBox = ({ placeholder, value, onChange }: SearchBoxProps) => (
  <input
    type="search"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm outline-none focus:border-black/40"
  />
);