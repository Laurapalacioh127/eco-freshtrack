import { NextFunction, Request, Response } from 'express';
import { getRecipeByIdService, getRecipesService } from './recipe.service';

export const getRecipesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    res.json(await getRecipesService(status));
  } catch (error) {
    next(error);
  }
};

export const getRecipeByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getRecipeByIdService(String(req.params.id)));
  } catch (error) {
    next(error);
  }
};