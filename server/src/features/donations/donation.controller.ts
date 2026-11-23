import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { getScopeUserId, getUserFromRequest } from '../../middlewares/authMiddleware';
import { readRequiredText } from '../../utils/readText';
import { DONATION_STATUSES, DonationStatus } from './donation.types';
import {
  createDonationService,
  getDonationByIdService,
  getDonationsService,
  getDonationSummaryService,
  updateDonationStatusService,
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

export const createDonationController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const body = (req.body ?? {}) as Record<string, unknown>;

  const donation = await createDonationService({
    userId: user.id,
    donorName: user.name,
    zone: readRequiredText(body, 'zone', 'lugar de recogida'),
    items: readRequiredText(body, 'items', 'alimentos'),
    expiresLabel: readRequiredText(body, 'expiresLabel', 'vencimiento'),
  });

  res.status(201).json(donation);
};

const isDonationStatus = (value: unknown): value is DonationStatus =>
  typeof value === 'string' && (DONATION_STATUSES as readonly string[]).includes(value);

export const updateDonationStatusController = async (req: Request, res: Response) => {
  const status: unknown = (req.body as { status?: unknown } | undefined)?.status;

  if (!isDonationStatus(status)) {
    throw Boom.badRequest('El estado debe ser "pending", "approved" o "completed"');
  }

  res.json(await updateDonationStatusService(String(req.params.id), status));
};
