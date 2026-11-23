import { Request, Response } from 'express';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import { getNotificationsService, markNotificationAsReadService } from './notification.service';

export const getNotificationsController = async (req: Request, res: Response) => {
  res.json(await getNotificationsService(getUserFromRequest(req).id));
};

export const markNotificationAsReadController = async (req: Request, res: Response) => {
  res.json(await markNotificationAsReadService(getUserFromRequest(req).id, String(req.params.id)));
};
