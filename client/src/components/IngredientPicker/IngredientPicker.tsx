'use client';

interface IngredientPickerProps {
  options: string[];
  selected: string[];
  onToggle: (name: string) => void;
  error?: string;
  disabled?: boolean;
}

export const IngredientPicker = ({ options, selected, onToggle, error, disabled = false }: IngredientPickerProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-semibold">Ingredientes de tu inventario</p>
    {options.length === 0 ? (
      <p className="text-xs text-neutral-600">
        Agrega alimentos a tu inventario para elegirlos como ingredientes.
      </p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
              selected.includes(option) ? 'bg-brand text-white' : 'bg-white'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    )}
    {error && (
      <p role="alert" className="text-xs text-rose-dark">
        {error}
      </p>
    )}
  </div>
);
