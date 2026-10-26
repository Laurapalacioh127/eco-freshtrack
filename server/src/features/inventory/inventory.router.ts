import { Router } from 'express';
import {
  getInventoryByIdController,
  getInventoryController,
  getInventorySummaryController,
  getShoppingListController,
} from './inventory.controller';

export const router = Router();

router.get('/', getInventoryController);
router.get('/summary', getInventorySummaryController);
router.get('/shopping-list', getShoppingListController);
router.get('/:id', getInventoryByIdController);