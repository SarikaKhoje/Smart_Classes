import express from 'express';
import {
  markAttendance,
  getAttendance,
  getMyStudents,
  createHomework,
  getHomeworkList,
  updateHomework,
  deleteHomework,
  createTest,
  getTests,
  updateTest,
  recordStudentTestMarks
} from '../controllers/teacherController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);
router.use(authorize('teacher', 'admin'));

// Attendance
router.post('/attendance/mark', markAttendance);
router.get('/attendance', getAttendance);
router.get('/my-students', getMyStudents);

// Homework
router.post('/homework', createHomework);
router.get('/homework', getHomeworkList);
router.put('/homework/:id', updateHomework);
router.delete('/homework/:id', deleteHomework);

// Tests & Quizzes
router.post('/tests', createTest);
router.get('/tests', getTests);
router.put('/tests/:id', updateTest);
router.post('/tests/:id/marks', recordStudentTestMarks);

export default router;
