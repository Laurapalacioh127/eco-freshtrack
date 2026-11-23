import { NextFunction, Request, Response } from 'express';
import Boom from '@hapi/boom';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import { readRequiredText } from '../../utils/readText';
import {
  createInventoryItemService,
  getInventoryByIdService,
  getInventoryService,
  getInventorySummaryService,
  getShoppingListService,
} from './inventory.service';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// The UTC round-trip rejects dates that Date would silently roll over (2026-02-30).
const readIsoDate = (body: Record<string, unknown>, field: string, label: string): string => {
  const value = body[field];
  const invalid = Boom.badRequest(`El campo "${label}" debe ser una fecha válida (AAAA-MM-DD)`);

  if (typeof value !== 'string') throw invalid;

  const trimmed = value.trim();

  if (!ISO_DATE_PATTERN.test(trimmed)) throw invalid;

  const parsed = new Date(`${trimmed}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== trimmed) throw invalid;

  return trimmed;
};

// Inventory is personal for every role, including admins.
export const createInventoryItemController = async (req: Request, res: Response) => {
  const { id: userId } = getUserFromRequest(req);
  const body = (req.body ?? {}) as Record<string, unknown>;

  const item = await createInventoryItemService({
    userId,
    name: readRequiredText(body, 'name', 'nombre', 120),
    category: readRequiredText(body, 'category', 'categoría', 60),
    quantity: readRequiredText(body, 'quantity', 'cantidad', 40),
    expiresOn: readIsoDate(body, 'expiresOn', 'fecha de vencimiento'),
  });

  res.status(201).json(item);
};

export const getInventoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = getUserFromRequest(req);
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    res.json(await getInventoryService(userId, category));
  } catch (error) {
    next(error);
  }
};

export const getInventoryByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = getUserFromRequest(req);
    res.json(await getInventoryByIdService(userId, String(req.params.id)));
  } catch (error) {
    next(error);
  }
};

export const getInventorySummaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = getUserFromRequest(req);
    res.json(await getInventorySummaryService(userId));
  } catch (error) {
    next(error);
  }
};

export const getShoppingListController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = getUserFromRequest(req);
    res.json(await getShoppingListService(userId));
  } catch (error) {
    next(error);
  }
};
