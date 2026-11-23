import { Router } from 'express';
import { loginController, refreshController, registerController } from './auth.controller';

// Public on purpose: these routes are how a client gets a token in the first place.
export const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshController);
