import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to EMS';
    const html = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining our Employee Management System.</p>
      <p>You can now login to access your dashboard and manage your profile.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordChangeNotification(email) {
    const subject = 'Password Changed Successfully';
    const html = `
      <h1>Password Changed</h1>
      <p>Your password has been changed successfully.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"EMS System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }
}

export default new EmailService();
