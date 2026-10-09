import express from 'express';
import {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verify2FA,
  enable2FA,
  getMe,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { loginValidation, registerValidation, validateRequest } from '../utils/validators.js';
import createRateLimiter from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/login', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many sign-in attempts. Try again later.' }), loginValidation, validateRequest, login);
router.post('/register', protect, authorize('admin'), registerValidation, validateRequest, register);
router.post('/forgot-password', createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many reset requests. Try again later.' }), forgotPassword);
router.post('/verify-otp', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many code attempts. Try again later.' }), verifyOtp);
router.post('/reset-password', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many password reset attempts. Try again later.' }), resetPassword);
router.post('/verify-2fa', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many verification attempts. Try again later.' }), verify2FA);

// Protected Auth Routes
router.post('/enable-2fa', protect, enable2FA);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
