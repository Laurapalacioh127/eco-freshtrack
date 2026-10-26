import Boom from '@hapi/boom';
import { Recipe } from './recipe.types';
import { findAllRecipesRepository, findRecipeByIdRepository } from './recipe.repository';

export const getRecipesService = async (status?: string): Promise<Recipe[]> => {
  const recipes = await findAllRecipesRepository();
  return status ? recipes.filter((recipe) => recipe.status === status) : recipes;
};

export const getRecipeByIdService = async (id: string): Promise<Recipe> => {
  const recipe = await findRecipeByIdRepository(id);

  if (!recipe) {
    throw Boom.notFound('Recipe not found');
  }

  return recipe;
};