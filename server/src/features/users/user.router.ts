import { Router } from 'express';
import { getUserByIdController, getUsersController } from './user.controller';

export const router = Router();

router.get('/', getUsersController);
router.get('/:id', getUserByIdController);