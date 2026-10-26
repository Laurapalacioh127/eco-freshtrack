import { Router } from 'express';
import { getRecipeByIdController, getRecipesController } from './recipe.controller';

export const router = Router();

router.get('/', getRecipesController);
router.get('/:id', getRecipeByIdController);