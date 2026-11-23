export type RecipeStatus = 'pending' | 'approved' | 'rejected';

export interface Recipe {
  id: string;
  title: string;
  author: string;
  minutes: number;
  difficulty: string;
  servings: number;
  ingredientsAvailable: number;
  ingredientsTotal: number;
  status: RecipeStatus;
  ingredients: string[];
  steps: string[];
}

export const MODERATION_STATUSES = ['approved', 'rejected'] as const;

export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export interface CreateRecipeDTO {
  authorId: string;
  author: string;
  title: string;
  minutes: number;
  difficulty: string;
  servings: number;
  ingredients: string[];
  steps: string[];
}
