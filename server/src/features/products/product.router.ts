import { Router } from 'express';
import { requireRole } from '../../middlewares/authMiddleware';
import {
  createProductController,
  getProductByIdController,
  getProductsController,
} from './product.controller';

// authMiddleware is applied where this router is mounted (app.ts). Every signed-in
// user can read the catalog; only admins can change it.
export const router = Router();

router.get('/', getProductsController);
router.get('/:id', getProductByIdController);
router.post('/', requireRole('admin'), createProductController);
