import { Router } from 'express';
import { requireRole } from '../../middlewares/authMiddleware';
import { getMeController, getUserByIdController, getUsersController } from './user.controller';

// authMiddleware is applied where this router is mounted (app.ts).
export const router = Router();

// Declared before '/:id' so 'me' is not captured as an id.
router.get('/me', getMeController);
router.get('/', requireRole('admin'), getUsersController);
router.get('/:id', requireRole('admin'), getUserByIdController);
