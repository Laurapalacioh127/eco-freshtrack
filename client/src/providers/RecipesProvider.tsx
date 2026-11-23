'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { ApiError, useAxios } from './AxiosProvider';
import { useAuth } from './AuthProvider';
import type { Recipe } from '@/types';
import { REALTIME, subscribeToBroadcast } from '@/utils/realtime';
import { hasId, upsertById } from '@/utils/upsertById';

export interface SubmitRecipeInput {
  title: string;
  minutes: number;
  servings: number;
  ingredients: string[];
  steps: string[];
}

export type ModerationDecision = 'approved' | 'rejected';

interface RecipesContextType {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  submitRecipe: (input: SubmitRecipeInput) => Promise<Recipe>;
  moderateRecipe: (id: string, status: ModerationDecision) => Promise<Recipe>;
}

const RecipesContext = createContext<RecipesContextType | null>(null);

export const RecipesProvider = ({ children }: { children: ReactNode }) => {
  const axios = useAxios();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Households only see approved recipes plus their own. The public broadcast
    // carries every recipe, so they re-read it through the scoped API: a 404 means
    // it is not visible to them (anymore) and it is removed from the list.
    const applyRecipe = async (payload: unknown) => {
      if (!hasId(payload)) return;

      if (isAdmin) {
        setRecipes((prev) => upsertById(prev, payload as Recipe));
        return;
      }

      try {
        const res = await axios.get<Recipe>(`/api/recipes/${payload.id}`);
        setRecipes((prev) => upsertById(prev, res.data));
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setRecipes((prev) => prev.filter((recipe) => recipe.id !== payload.id));
        }
      }
    };

    const unsubscribe = subscribeToBroadcast(REALTIME.recipes.channel, {
      [REALTIME.recipes.submitted]: applyRecipe,
      [REALTIME.recipes.reviewed]: applyRecipe,
    });

    const onInit = async () => {
      try {
        const res = await axios.get<Recipe[]>('/api/recipes');
        // Merge instead of replace: an event may have arrived before the response.
        setRecipes((prev) => res.data.reduce(upsertById, prev));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    onInit();

    return unsubscribe;
  }, [axios, isAdmin]);

  const submitRecipe = useCallback(
    async (input: SubmitRecipeInput) => {
      const res = await axios.post<Recipe>('/api/recipes', input);
      setRecipes((prev) => upsertById(prev, res.data));
      return res.data;
    },
    [axios],
  );

  const moderateRecipe = useCallback(
    async (id: string, status: ModerationDecision) => {
      const res = await axios.patch<Recipe>(`/api/recipes/${id}/status`, { status });
      setRecipes((prev) => upsertById(prev, res.data));
      return res.data;
    },
    [axios],
  );

  return (
    <RecipesContext.Provider value={{ recipes, loading, error, submitRecipe, moderateRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error('useRecipes must be used within RecipesProvider');
  return ctx;
};
