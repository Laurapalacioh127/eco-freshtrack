import { NextFunction, Request, Response } from 'express';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import {
  getInventoryByIdService,
  getInventoryService,
  getInventorySummaryService,
  getShoppingListService,
} from './inventory.service';

// Inventory is personal for every role, including admins.
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
