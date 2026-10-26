'use client';

import { useState } from 'react';
import type { Recipe } from '@/types';
import { TextAreaField } from '@/components/TextAreaField/TextAreaField';

interface RecipeReviewPanelProps {
  recipe: Recipe;
  onApprove: () => void;
  onReject: () => void;
}

export const RecipeReviewPanel = ({ recipe, onApprove, onReject }: RecipeReviewPanelProps) => {
  const [notes, setNotes] = useState('');

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6">
      <span className="w-fit rounded-full bg-sun px-3 py-1 text-xs font-semibold">
        {recipe.minutes} minutos · {recipe.difficulty}
      </span>
      <div>
        <h2 className="text-3xl font-light">{recipe.title}</h2>
        <p className="text-sm text-neutral-600">por {recipe.author}</p>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-brand-soft p-4 text-sm">
        <div>
          <p className="font-semibold">Verificación nutricional</p>
          <p className="text-xs text-neutral-600">Ingredientes y porciones coherentes</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">Aprobada</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-cream p-4">
          <p className="text-sm font-semibold">Ingredientes</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-cream p-4">
          <p className="text-sm font-semibold">Preparación</p>
          <ol className="mt-2 list-decimal pl-5 text-sm">
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <TextAreaField
        label="Observaciones requeridas"
        placeholder="Explica los cambios que debe hacer la autora…"
        value={notes}
        onChange={setNotes}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onApprove()}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Aprobar receta ✓
        </button>
        <button
          type="button"
          onClick={() => onReject()}
          className="rounded-full bg-rose-soft px-5 py-2.5 text-sm font-semibold text-rose-900"
        >
          Rechazar con observaciones
        </button>
      </div>
    </section>
  );
};