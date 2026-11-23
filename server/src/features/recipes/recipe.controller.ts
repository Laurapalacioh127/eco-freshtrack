import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { getScopeUserId } from '../../middlewares/authMiddleware';
import { MODERATION_STATUSES, ModerationStatus } from './recipe.types';
import { getRecipeByIdService, getRecipesService, moderateRecipeService } from './recipe.service';

export const getRecipesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    res.json(await getRecipesService(getScopeUserId(req), status));
  } catch (error) {
    next(error);
  }
};

export const getRecipeByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getRecipeByIdService(getScopeUserId(req), String(req.params.id)));
  } catch (error) {
    next(error);
  }
};

const isModerationStatus = (value: unknown): value is ModerationStatus =>
  typeof value === 'string' && (MODERATION_STATUSES as readonly string[]).includes(value);

export const moderateRecipeController = async (req: Request, res: Response) => {
  const status: unknown = (req.body as { status?: unknown } | undefined)?.status;

  if (!isModerationStatus(status)) {
    throw Boom.badRequest('El estado debe ser "approved" o "rejected"');
  }

  res.json(await moderateRecipeService(String(req.params.id), status));
};
