import { NextFunction, Request, Response } from 'express';
import { getScopeUserId } from '../../middlewares/authMiddleware';
import {
  getDonationByIdService,
  getDonationsService,
  getDonationSummaryService,
} from './donation.service';

export const getDonationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    res.json(await getDonationsService(getScopeUserId(req), status));
  } catch (error) {
    next(error);
  }
};

export const getDonationByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getDonationByIdService(getScopeUserId(req), String(req.params.id)));
  } catch (error) {
    next(error);
  }
};

export const getDonationSummaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getDonationSummaryService(getScopeUserId(req)));
  } catch (error) {
    next(error);
  }
};
