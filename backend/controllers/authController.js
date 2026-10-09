import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { hashPassword, comparePassword, generateOtp, hashResetOtp } from '../utils/passwordUtils.js';
import { generateUniqueId } from '../utils/generateId.js';
import { sendOtpEmail } from '../utils/emailService.js';
import { createTotpProvisioningUri, generateTotpSecret, verifyTotpCode } from '../utils/totp.js';

// Helper to generate JWT Token
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters before issuing authentication tokens');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact Administrator.' });
    }

    // Role check if provided
    if (role && user.role !== role) {
      return res.status(401).json({ success: false, message: `Access denied. Account role is '${user.role}' not '${role}'` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if 2FA is required (Admin 2FA)
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: user._id,
        email: user.email,
        message: 'Two-Factor Authentication required'
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        uniqueId: user.uniqueId,
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class,
        subject: user.subject,
        children: user.children,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, subject, assignedClasses, rollNumber, className, parentEmail } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const uniqueId = generateUniqueId(role);

    const user = await User.create({
      uniqueId,
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      subject: subject || '',
      assignedClasses: assignedClasses || [],
      rollNumber: rollNumber || '',
      class: className || '',
      parentEmail: parentEmail || ''
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        uniqueId: user.uniqueId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || email.length > 254) {
      return res.status(400).json({ success: false, message: 'A valid email address is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account exists, a reset code will be sent to its email address' });
    }

    const otp = generateOtp();
    user.passwordResetToken = hashResetOtp(otp);
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save({ validateBeforeSave: false });

    try {
      await sendOtpEmail(user.email, otp);
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists, a reset code will be sent to its email address'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (typeof email !== 'string' || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'A valid email and six-digit reset code are required' });
    }
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      passwordResetToken: hashResetOtp(otp),
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (typeof email !== 'string' || typeof otp !== 'string' || !/^\d{6}$/.test(otp) ||
        typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: 'Provide a valid email, six-digit code, and password of 8 to 128 characters' });
    }
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      passwordResetToken: hashResetOtp(otp),
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA OTP
// @route   POST /api/auth/verify-2fa
// @access  Public
export const verify2FA = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!mongoose.isValidObjectId(userId) || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'User ID and six-digit authenticator code are required' });
    }

    const user = await User.findById(userId);
    if (!user || !user.isActive || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'Invalid or unavailable authenticator challenge' });
    }

    const verifiedStep = verifyTotpCode(user.twoFactorSecret, otp, {
      afterStep: user.twoFactorLastVerifiedStep ?? -1
    });
    if (verifiedStep === null) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 2FA code' });
    }

    user.twoFactorLastVerifiedStep = verifiedStep;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        uniqueId: user.uniqueId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enable 2FA
// @route   POST /api/auth/enable-2fa
// @access  Private
export const enable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (req.body.otp !== undefined && (typeof req.body.otp !== 'string' || !/^\d{6}$/.test(req.body.otp))) {
      return res.status(400).json({ success: false, message: 'Authenticator code must be six digits' });
    }
    if (req.body.otp !== undefined) {
      const verifiedStep = user.twoFactorPendingSecret &&
        user.twoFactorPendingExpires > Date.now()
        ? verifyTotpCode(user.twoFactorPendingSecret, req.body.otp)
        : null;
      if (verifiedStep === null) {
        return res.status(400).json({ success: false, message: 'A valid pending authenticator code is required to enable 2FA' });
      }
      user.twoFactorSecret = user.twoFactorPendingSecret;
      user.twoFactorPendingSecret = undefined;
      user.twoFactorPendingExpires = undefined;
      user.twoFactorLastVerifiedStep = verifiedStep;
      user.twoFactorEnabled = true;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ success: true, message: 'Two-Factor Authentication enabled' });
    }

    const secret = generateTotpSecret();
    user.twoFactorPendingSecret = secret;
    user.twoFactorPendingExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: 'Scan the URI with an authenticator app, then submit the current six-digit code to enable 2FA.',
      secret,
      otpauthUrl: createTotpProvisioningUri(secret, user.email),
      expiresAt: user.twoFactorPendingExpires
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
