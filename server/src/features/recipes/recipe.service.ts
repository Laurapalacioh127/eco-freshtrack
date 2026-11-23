import Boom from '@hapi/boom';
import { isUuid } from '../../utils/isUuid';
import { Recipe } from './recipe.types';
import { findAllRecipesRepository, findRecipeByIdRepository } from './recipe.repository';

export const getRecipesService = async (status?: string): Promise<Recipe[]> => {
  return findAllRecipesRepository(status);
};

export const getRecipeByIdService = async (id: string): Promise<Recipe> => {
  const recipe = isUuid(id) ? await findRecipeByIdRepository(id) : undefined;

  if (!recipe) {
    throw Boom.notFound('Recipe not found');
  }

  return recipe;
};
