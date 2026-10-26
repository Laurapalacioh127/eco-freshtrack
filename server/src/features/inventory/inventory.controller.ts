import { NextFunction, Request, Response } from 'express';
import {
  getInventoryByIdService,
  getInventoryService,
  getInventorySummaryService,
  getShoppingListService,
} from './inventory.service';

export const getInventoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    res.json(await getInventoryService(category));
  } catch (error) {
    next(error);
  }
};

export const getInventoryByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getInventoryByIdService(String(req.params.id)));
  } catch (error) {
    next(error);
  }
};

export const getInventorySummaryController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getInventorySummaryService());
  } catch (error) {
    next(error);
  }
};

export const getShoppingListController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getShoppingListService());
  } catch (error) {
    next(error);
  }
};