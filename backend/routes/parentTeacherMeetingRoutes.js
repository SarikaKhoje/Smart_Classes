import express from 'express';
import {
  bookParentTeacherMeeting,
  cancelParentTeacherMeeting,
  createMeetingAvailability,
  listParentTeacherMeetings
} from '../controllers/parentTeacherMeetingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.post('/availability', createMeetingAvailability);
router.get('/', listParentTeacherMeetings);
router.get('/children/:studentId', listParentTeacherMeetings);
router.post('/:id/book', bookParentTeacherMeeting);
router.put('/:id/cancel', cancelParentTeacherMeeting);

export default router;
