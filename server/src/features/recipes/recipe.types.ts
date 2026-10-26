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