'use client';

import { useState } from 'react';
import { ModerationDecision, useRecipes } from '@/providers/RecipesProvider';
import { useToast } from '@/providers/ToastProvider';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { RecipeQueueItem } from '@/components/RecipeQueueItem/RecipeQueueItem';
import { RecipeReviewPanel } from '@/components/RecipeReviewPanel/RecipeReviewPanel';

const AdminRecipesPage = () => {
  const { recipes, loading, error, moderateRecipe } = useRecipes();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (loading) return <p>Cargando recetas…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Updated live: submissions and other admins' decisions arrive through RecipesProvider.
  const queue = recipes.filter((recipe) => recipe.status === 'pending');
  const selected = queue.find((recipe) => recipe.id === selectedId) ?? queue[0];

  const decide = async (id: string, decision: ModerationDecision) => {
    setBusyId(id);
    try {
      await moderateRecipe(id, decision);
      showToast(decision === 'approved' ? 'Receta aprobada' : 'Receta rechazada', 'success');
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="CALIDAD DE LA COMUNIDAD"
        title="Moderación de recetas"
        subtitle={`${queue.length} recetas esperan revisión nutricional y editorial.`}
      />
      {!selected ? (
        <p className="rounded-2xl bg-brand-soft p-6 text-sm">
          No hay recetas pendientes de revisión. ¡Buen trabajo!
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-white p-3">
            <p className="px-2 text-sm font-semibold">Pendientes {queue.length}</p>
            {queue.map((recipe) => (
              <RecipeQueueItem
                key={recipe.id}
                recipe={recipe}
                selected={recipe.id === selected.id}
                onSelect={() => setSelectedId(recipe.id)}
              />
            ))}
          </aside>
          <RecipeReviewPanel
            key={selected.id}
            recipe={selected}
            busy={busyId === selected.id}
            onApprove={() => decide(selected.id, 'approved')}
            onReject={() => decide(selected.id, 'rejected')}
          />
        </div>
      )}
    </div>
  );
};

export default AdminRecipesPage;
