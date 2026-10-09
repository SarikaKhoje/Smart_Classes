import express from 'express';
import { getTeacherCheckIns, recordStudentCheckIn } from '../controllers/checkInController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect, authorize('teacher', 'admin'));
router.get('/', getTeacherCheckIns);
router.post('/', recordStudentCheckIn);

export default router;
