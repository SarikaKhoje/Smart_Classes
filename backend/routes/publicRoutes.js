import express from 'express';
import { createAdmissionEnquiry, getPublicCourses, getPublicTeachers } from '../controllers/publicController.js';
import createRateLimiter from '../middleware/rateLimit.js';

const router = express.Router();
router.get('/courses', getPublicCourses);
router.get('/teachers', getPublicTeachers);
router.post('/admission-enquiries', createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many admission enquiries were submitted from this connection. Try again later.'
}), createAdmissionEnquiry);

export default router;
