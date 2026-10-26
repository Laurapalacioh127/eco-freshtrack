'use client';

import { useState } from 'react';
import type { Recipe } from '@/types';

export const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const [open, setOpen] = useState(false);
  const percent = Math.round((recipe.ingredientsAvailable / recipe.ingredientsTotal) * 100);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-5">
      <p className="text-xs text-neutral-500">
        {recipe.minutes} min · {recipe.servings} personas · {recipe.difficulty}
      </p>
      <h3 className="text-lg font-medium">{recipe.title}</h3>
      <div>
        <div className="h-1.5 rounded-full bg-black/10">
          <div className="h-1.5 rounded-full bg-brand" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-1 text-xs text-neutral-600">
          {recipe.ingredientsAvailable} de {recipe.ingredientsTotal} ingredientes disponibles
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-fit rounded-full border border-black/10 px-4 py-1.5 text-sm font-semibold"
      >
        {open ? 'Ocultar receta' : 'Ver receta'}
      </button>
      {open && (
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <p className="font-semibold">Ingredientes</p>
            <ul className="list-disc pl-5">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold">Preparación</p>
            <ol className="list-decimal pl-5">
              {recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
};