import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import { getProductByBarcodeService } from './barcode.service';

const BARCODE_PATTERN = /^\d{8,14}$/;

export const getProductByBarcodeController = async (req: Request, res: Response): Promise<void> => {
  const code = String(req.params.code).trim();

  if (!BARCODE_PATTERN.test(code)) {
    throw Boom.badRequest('El código de barras debe tener entre 8 y 14 dígitos');
  }

  res.json(await getProductByBarcodeService(code));
};
