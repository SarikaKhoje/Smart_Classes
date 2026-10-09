import createEmailTransport from '../config/email.js';

export const sendOtpEmail = async (email, otp) => {
  const transporter = createEmailTransport();
  const mailOptions = {
    from: `"Kashvi SmartClass" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Kashvi SmartClass - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Kashvi SmartClass</h2>
        <p>Hello,</p>
        <p>You have requested a one-time password (OTP) to reset your account password. Use the following 6-digit code to proceed:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1e1b4b; background: #e0e7ff; padding: 10px 24px; border-radius: 6px;">${otp}</span>
        </div>
        <p>This OTP will expire in 10 minutes. If you did not make this request, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">Kashvi SmartClass Learning Management System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
