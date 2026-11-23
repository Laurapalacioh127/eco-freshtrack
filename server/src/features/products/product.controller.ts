import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { readCategory } from '../../utils/categories';
import { createProductService, getProductByIdService, getProductsService } from './product.service';

const MAX_TEXT_LENGTH = 100;
const MAX_SUBSTITUTES = 20;

const readText = (value: unknown, label: string): string => {
  const text = typeof value === 'string' ? value.trim() : '';

  if (!text || text.length > MAX_TEXT_LENGTH) {
    throw Boom.badRequest(`${label} es obligatorio (máximo ${MAX_TEXT_LENGTH} caracteres)`);
  }

  return text;
};

export const createProductController = async (req: Request, res: Response) => {
  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<string, unknown>;
  const name = readText(body.name, 'El nombre');
  const category = readCategory(body, 'category', 'categoría');
  const { shelfLifeDays } = body;

  if (typeof shelfLifeDays !== 'number' || !Number.isInteger(shelfLifeDays) || shelfLifeDays <= 0) {
    throw Boom.badRequest('La vida útil debe ser un número entero de días mayor que 0');
  }

  const rawSubstitutes = body.substitutes ?? [];
  if (
    !Array.isArray(rawSubstitutes) ||
    rawSubstitutes.length > MAX_SUBSTITUTES ||
    !rawSubstitutes.every((item) => typeof item === 'string' && item.trim() && item.length <= MAX_TEXT_LENGTH)
  ) {
    throw Boom.badRequest('Los sustitutos deben ser una lista de textos');
  }
  const substitutes = (rawSubstitutes as string[]).map((item) => item.trim());

  res.status(201).json(await createProductService({ name, category, shelfLifeDays, substitutes }));
};

export const getProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category =
      typeof req.query.category === 'string' ? req.query.category : undefined;
    res.json(await getProductsService(category));
  } catch (error) {
    next(error);
  }
};

export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.json(await getProductByIdService(String(req.params.id)));
  } catch (error) {
    next(error);
  }
};