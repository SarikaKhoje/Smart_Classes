import express from 'express';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../controllers/userNotificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/', getMyNotifications);
router.put('/read-all', markAllNotificationsRead);
router.put('/:id/read', markNotificationRead);

export default router;
