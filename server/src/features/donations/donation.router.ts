import { Router } from 'express';
import { requireRole } from '../../middlewares/authMiddleware';
import {
  createDonationController,
  getDonationByIdController,
  getDonationsController,
  getDonationSummaryController,
  updateDonationStatusController,
} from './donation.controller';

// authMiddleware is applied where this router is mounted (app.ts).
export const router = Router();

router.get('/', getDonationsController);
router.post('/', requireRole('household'), createDonationController);
router.get('/summary', getDonationSummaryController);
router.get('/:id', getDonationByIdController);
router.patch('/:id/status', requireRole('admin'), updateDonationStatusController);
