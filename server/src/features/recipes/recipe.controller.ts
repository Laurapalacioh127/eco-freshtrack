import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { getScopeUserId, getUserFromRequest } from '../../middlewares/authMiddleware';
import { readRequiredText } from '../../utils/readText';
import { MODERATION_STATUSES, ModerationStatus } from './recipe.types';
import {
  getRecipeByIdService,
  getRecipesService,
  moderateRecipeService,
  submitRecipeService,
} from './recipe.service';

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

const MAX_LIST_ITEMS = 30;
const MAX_MINUTES = 24 * 60;
const MAX_SERVINGS = 50;
const DEFAULT_DIFFICULTY = 'Fácil';

const readPositiveInt = (body: Record<string, unknown>, field: string, label: string, max: number): number => {
  const value = body[field];

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > max) {
    throw Boom.badRequest(`El campo "${label}" debe ser un número entero entre 1 y ${max}`);
  }

  return value;
};

const readTextList = (body: Record<string, unknown>, field: string, label: string): string[] => {
  const value = body[field];
  const items = Array.isArray(value)
    ? value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)
    : [];

  if (!Array.isArray(value) || items.length !== value.length || items.length === 0) {
    throw Boom.badRequest(`El campo "${label}" debe tener al menos un elemento de texto`);
  }

  if (items.length > MAX_LIST_ITEMS || items.some((item) => item.length > 300)) {
    throw Boom.badRequest(`El campo "${label}" admite máximo ${MAX_LIST_ITEMS} elementos de 300 caracteres`);
  }

  return items;
};

export const submitRecipeController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const body = (req.body ?? {}) as Record<string, unknown>;

  const recipe = await submitRecipeService({
    authorId: user.id,
    author: user.name,
    title: readRequiredText(body, 'title', 'título', 120),
    minutes: readPositiveInt(body, 'minutes', 'tiempo', MAX_MINUTES),
    servings: readPositiveInt(body, 'servings', 'porciones', MAX_SERVINGS),
    difficulty: body.difficulty === undefined
      ? DEFAULT_DIFFICULTY
      : readRequiredText(body, 'difficulty', 'dificultad', 30),
    ingredients: readTextList(body, 'ingredients', 'ingredientes'),
    steps: readTextList(body, 'steps', 'pasos'),
  });

  res.status(201).json(recipe);
};
