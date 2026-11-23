import { Router } from 'express';
import { getNotificationsController, markNotificationAsReadController } from './notification.controller';

export const router = Router();

router.get('/', getNotificationsController);
router.patch('/:id/read', markNotificationAsReadController);
