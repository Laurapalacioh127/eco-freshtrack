'use client';

import Link from 'next/link';
import { useRecipes } from '@/providers/RecipesProvider';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { FeaturedRecipe } from '@/components/FeaturedRecipe/FeaturedRecipe';
import { RecipeCard } from '@/components/RecipeCard/RecipeCard';

const RecipesPage = () => {
  const { recipes, loading, error } = useRecipes();

  if (loading) return <p>Cargando recetas…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const approved = recipes.filter((recipe) => recipe.status === 'approved');
  const [featured] = approved;

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="COCINA CON LO QUE TIENES"
        title="Recetas para ti"
        subtitle="Ideas inteligentes basadas en tu inventario."
        action={
          <Link
            href="/user/recipes/new"
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold"
          >
            + Crear mi receta
          </Link>
        }
      />
      {approved.length === 0 && (
        <EmptyState
          title="Aún no hay recetas publicadas"
          description="Crea la primera y compártela con la comunidad."
          actionHref="/user/recipes/new"
          actionLabel="+ Crear mi receta"
        />
      )}
      {featured && <FeaturedRecipe recipe={featured} />}
      <div className="grid gap-4 md:grid-cols-3">
        {approved.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default RecipesPage;