import { NextFunction, Request, Response } from 'express';
import { getUserByIdService, getUsersService } from './user.service';

export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    res.json(await getUsersService(role));
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getUserByIdService(String(req.params.id)));
  } catch (error) {
    next(error);
  }
};