import Boom from '@hapi/boom';
import { broadcast, REALTIME } from '../../config/realtime';
import { isUuid } from '../../utils/isUuid';
import { CreateRecipeDTO, ModerationStatus, Recipe } from './recipe.types';
import {
  createRecipeRepository,
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

export const submitRecipeService = async (recipe: CreateRecipeDTO): Promise<Recipe> => {
  const id = await createRecipeRepository(recipe);
  const created = await getRecipeByIdService(null, id);
  // Not awaited on purpose: the broadcast must never delay or fail the request.
  void broadcast(REALTIME.recipes.channel, REALTIME.recipes.submitted, created);
  return created;
};

export const moderateRecipeService = async (id: string, status: ModerationStatus): Promise<Recipe> => {
  const updated = isUuid(id) ? await updateRecipeStatusRepository(id, status) : false;

  if (!updated) {
    throw Boom.notFound('Recipe not found');
  }

  const reviewed = await getRecipeByIdService(null, id);
  void broadcast(REALTIME.recipes.channel, REALTIME.recipes.reviewed, reviewed);
  return reviewed;
};
