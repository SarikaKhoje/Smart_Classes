import express from 'express';
import {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  createPaymentOrder,
  processPayment,
  recordOfflinePayment
} from '../controllers/feeController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

// View fees (filtered by role inside controller)
router.get('/', getAllFees);
router.get('/:id', getFeeById);

// Payment endpoints (Parents and Students can pay their invoices)
router.post('/:id/order', createPaymentOrder);
router.post('/:id/pay', processPayment);
router.post('/:id/offline', recordOfflinePayment);

// Admin only mutations
router.post('/', authorize('admin'), createFee);
router.put('/:id', authorize('admin'), updateFee);
router.delete('/:id', authorize('admin'), deleteFee);

export default router;
