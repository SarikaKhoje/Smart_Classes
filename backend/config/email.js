import nodemailer from 'nodemailer';

const createEmailTransport = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Password reset email is not configured. Set EMAIL_USER and EMAIL_PASS.');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export default createEmailTransport;
