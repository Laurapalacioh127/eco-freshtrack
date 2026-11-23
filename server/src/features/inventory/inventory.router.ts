import { Router } from 'express';
import {
  createInventoryItemController,
  getInventoryByIdController,
  getInventoryController,
  getInventorySummaryController,
  getShoppingListController,
} from './inventory.controller';

export const router = Router();

router.get('/', getInventoryController);
router.post('/', createInventoryItemController);
router.get('/summary', getInventorySummaryController);
router.get('/shopping-list', getShoppingListController);
router.get('/:id', getInventoryByIdController);