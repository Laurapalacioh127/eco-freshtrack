import { Router } from 'express';
import {
  getDonationByIdController,
  getDonationsController,
  getDonationSummaryController,
} from './donation.controller';

export const router = Router();

router.get('/', getDonationsController);
router.get('/summary', getDonationSummaryController);
router.get('/:id', getDonationByIdController);