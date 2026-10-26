import type { Recipe } from '@/types';

export const FeaturedRecipe = ({ recipe }: { recipe: Recipe }) => (
  <section className="rounded-3xl bg-sun p-8">
    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">Rescate del día</span>
    <h2 className="mt-4 max-w-md text-3xl font-light">{recipe.title}</h2>
    <p className="mt-2 text-sm">
      Una receta fresca, simple y lista en {recipe.minutes} minutos.
    </p>
  </section>
);