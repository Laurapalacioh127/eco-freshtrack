import { Router } from 'express';
import { requireRole } from '../../middlewares/authMiddleware';
import {
  getRecipeByIdController,
  getRecipesController,
  moderateRecipeController,
} from './recipe.controller';

// authMiddleware is applied where this router is mounted (app.ts).
export const router = Router();

router.get('/', getRecipesController);
router.get('/:id', getRecipeByIdController);
router.patch('/:id/status', requireRole('admin'), moderateRecipeController);
