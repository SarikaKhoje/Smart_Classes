import express from 'express';
import { getParentTeacherConversation, sendParentTeacherMessage } from '../controllers/parentTeacherMessageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/children/:studentId', getParentTeacherConversation);
router.post('/children/:studentId', sendParentTeacherMessage);

export default router;
