import { NextFunction, Request, Response } from 'express';
import { getProductByIdService, getProductsService } from './product.service';

export const getProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    res.json(await getProductByIdService(String(req.params.id)));
  } catch (error) {
    next(error);
  }
};