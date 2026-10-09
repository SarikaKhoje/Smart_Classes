import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getAuditLogs,
  getDashboardStats,
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  linkStudentToParent,
  unlinkStudentFromParent,
  linkStudentToTeacher,
  unlinkStudentFromTeacher
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { createCourse, deleteCourse, getCourses, updateCourse } from '../controllers/courseController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// User CRUD
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);
router.get('/audit-logs', getAuditLogs);
router.post('/parents/:parentId/children', linkStudentToParent);
router.delete('/parents/:parentId/children/:studentId', unlinkStudentFromParent);
router.post('/teachers/:teacherId/students', linkStudentToTeacher);
router.delete('/teachers/:teacherId/students/:studentId', unlinkStudentFromTeacher);

// Dashboard Statistics & Announcements
router.get('/dashboard-stats', getDashboardStats);
router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

export default router;
