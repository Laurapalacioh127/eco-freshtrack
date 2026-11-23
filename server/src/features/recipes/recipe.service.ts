import Boom from '@hapi/boom';
import { isUuid } from '../../utils/isUuid';
import { ModerationStatus, Recipe } from './recipe.types';
import {
  findAllRecipesRepository,
  findRecipeByIdRepository,
  updateRecipeStatusRepository,
} from './recipe.repository';

// viewerId: null for admins, the user's id for households (approved + own recipes).
export const getRecipesService = async (
  viewerId: string | null,
  status?: string,
): Promise<Recipe[]> => {
  return findAllRecipesRepository(viewerId, status);
};

export const getRecipeByIdService = async (viewerId: string | null, id: string): Promise<Recipe> => {
  const recipe = isUuid(id) ? await findRecipeByIdRepository(viewerId, id) : undefined;

  if (!recipe) {
    throw Boom.notFound('Recipe not found');
  }

  return recipe;
};

export const moderateRecipeService = async (id: string, status: ModerationStatus): Promise<Recipe> => {
  const updated = isUuid(id) ? await updateRecipeStatusRepository(id, status) : false;

  if (!updated) {
    throw Boom.notFound('Recipe not found');
  }

  return getRecipeByIdService(null, id);
};
