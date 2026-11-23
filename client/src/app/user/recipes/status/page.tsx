'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRecipes } from '@/providers/RecipesProvider';
import type { RecipeStatus } from '@/types';

const COPY: Record<RecipeStatus, { badge: string; badgeClass: string; title: string; detail: string }> = {
  pending: {
    badge: 'En revisión',
    badgeClass: 'bg-sun',
    title: 'Tu receta está en revisión',
    detail: 'Nuestro equipo verificará los ingredientes y la información nutricional. Esta página se actualiza sola.',
  },
  approved: {
    badge: 'Publicada',
    badgeClass: 'bg-brand-soft text-brand-dark',
    title: '¡Tu receta fue aprobada! 🎉',
    detail: 'Ya puedes verla en la comunidad FreshTrack.',
  },
  rejected: {
    badge: 'No aprobada',
    badgeClass: 'bg-rose-soft text-rose-900',
    title: 'Tu receta no fue aprobada',
    detail: 'Revisa los ingredientes y los pasos, y vuelve a intentarlo.',
  },
};

const linkClass =
  'rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-6 py-3 text-sm font-semibold text-white';

// The status comes from RecipesProvider, which applies recipe-reviewed events live.
const RecipeStatusView = () => {
  const id = useSearchParams().get('id');
  const { recipes, loading, error } = useRecipes();

  if (loading) return <p>Cargando el estado de tu receta…</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;

  const recipe = recipes.find((item) => item.id === id);

  if (!recipe) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-3xl font-light">No encontramos esta receta</h1>
        <Link href="/user/recipes" className={linkClass}>
          Ver recetas
        </Link>
      </div>
    );
  }

  const copy = COPY[recipe.status];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${copy.badgeClass}`}>{copy.badge}</span>
      <h1 className="text-4xl font-light">{copy.title}</h1>
      <p className="text-sm font-semibold">&ldquo;{recipe.title}&rdquo;</p>
      <p className="max-w-sm text-sm text-neutral-600">{copy.detail}</p>
      <Link href={recipe.status === 'rejected' ? '/user/recipes/new' : '/user/recipes'} className={linkClass}>
        {recipe.status === 'rejected' ? 'Crear otra receta' : 'Ver recetas'}
      </Link>
    </div>
  );
};

const RecipeStatusPage = () => (
  <Suspense fallback={<p>Cargando el estado de tu receta…</p>}>
    <RecipeStatusView />
  </Suspense>
);

export default RecipeStatusPage;
