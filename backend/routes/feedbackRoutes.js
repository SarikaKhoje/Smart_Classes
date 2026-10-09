import express from 'express';
import {
  createFeedbackForm,
  getStudentFeedbackForms,
  getTeacherFeedbackForms,
  submitFeedback
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);
router.get('/teacher', authorize('teacher', 'admin'), getTeacherFeedbackForms);
router.post('/teacher', authorize('teacher', 'admin'), createFeedbackForm);
router.get('/student', authorize('student', 'admin'), getStudentFeedbackForms);
router.post('/student/:id/responses', authorize('student', 'admin'), submitFeedback);

export default router;
