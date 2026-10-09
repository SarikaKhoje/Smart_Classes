import express from 'express';
import { getAdmissionEnquiries, updateAdmissionEnquiry } from '../controllers/publicController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/', getAdmissionEnquiries);
router.put('/:id', updateAdmissionEnquiry);

export default router;
