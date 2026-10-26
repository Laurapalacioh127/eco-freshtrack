import { Recipe } from './recipe.types';
import { recipesMock } from './data.mock';

export const findAllRecipesRepository = async (): Promise<Recipe[]> => {
  return recipesMock;
};

export const findRecipeByIdRepository = async (id: string): Promise<Recipe | undefined> => {
  return recipesMock.find((recipe) => recipe.id === id);
};