import { Router } from 'express';
import { getProductByBarcodeController } from './barcode.controller';

export const router = Router();

router.get('/:code', getProductByBarcodeController);
