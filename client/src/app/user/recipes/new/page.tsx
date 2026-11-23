'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/providers/RecipesProvider';
import { useToast } from '@/providers/ToastProvider';
import { buildRecipeInput, type RecipeFormErrors } from '@/utils/recipeForm';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { PhotoDropzone } from '@/components/PhotoDropzone/PhotoDropzone';
import { AuthInput } from '@/components/AuthInput/AuthInput';
import { ChipInput } from '@/components/ChipInput/ChipInput';
import { TextAreaField } from '@/components/TextAreaField/TextAreaField';

const NewRecipePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [steps, setSteps] = useState('');
  const [minutes, setMinutes] = useState('');
  const [servings, setServings] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<RecipeFormErrors>({});
  const { submitRecipe } = useRecipes();
  const { showToast } = useToast();

  const clearError = (field: keyof RecipeFormErrors) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = buildRecipeInput({ title, ingredients: selected, steps, minutes, servings });

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});

    setSubmitting(true);
    try {
      const recipe = await submitRecipe(result.input);
      showToast('Receta enviada a revisión', 'success');
      router.push(`/user/recipes/status?id=${recipe.id}`);
    } catch (err) {
      showToast((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-xl flex-col gap-5">
      <PageHeader
        eyebrow="COMPARTE CON LA COMUNIDAD"
        title="Crear receta"
        subtitle="Convierte tus ingredientes en una idea que inspire."
      />
      <PhotoDropzone />
      <AuthInput
        label="Título de la receta"
        placeholder="Ej. Ensalada fresca de aprovechamiento"
        value={title}
        onChange={(value) => {
          setTitle(value);
          clearError('title');
        }}
        error={errors.title}
        disabled={submitting}
      />
      <ChipInput
        label="Ingredientes"
        placeholder="Ej. 2 tomates"
        values={selected}
        onChange={(values) => {
          setSelected(values);
          clearError('ingredients');
        }}
        error={errors.ingredients}
        disabled={submitting}
      />
      <TextAreaField
        label="Pasos de preparación"
        placeholder="1. Lava y corta los ingredientes…"
        value={steps}
        onChange={(value) => {
          setSteps(value);
          clearError('steps');
        }}
        error={errors.steps}
        disabled={submitting}
      />
      <div className="grid grid-cols-2 gap-4">
        <AuthInput
          label="Tiempo"
          placeholder="20 minutos"
          value={minutes}
          onChange={(value) => {
            setMinutes(value);
            clearError('minutes');
          }}
          error={errors.minutes}
          disabled={submitting}
        />
        <AuthInput
          label="Porciones"
          placeholder="2 personas"
          value={servings}
          onChange={(value) => {
            setServings(value);
            clearError('servings');
          }}
          error={errors.servings}
          disabled={submitting}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-full bg-brand shadow-glow-brand transition hover:-translate-y-0.5 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Enviando…' : 'Publicar receta en la comunidad →'}
      </button>
    </form>
  );
};

export default NewRecipePage;