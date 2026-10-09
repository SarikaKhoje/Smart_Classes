import bcrypt from 'bcryptjs';
import { createHmac, randomInt } from 'crypto';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

export const generateOtp = () => {
  return randomInt(100000, 1000000).toString();
};

export const hashResetOtp = otp => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured before generating password-reset tokens');
  }
  return createHmac('sha256', process.env.JWT_SECRET).update(otp).digest('hex');
};
