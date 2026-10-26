import { Router } from 'express';
import {
  getProductByIdController,
  getProductsController,
} from './product.controller';

export const router = Router();

router.get('/', getProductsController);
router.get('/:id', getProductByIdController);