import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: '127.0.0.1',
      port: 1025, 
      secure: false
    });
  }

  async sendWelcomeEmail(email, name, tempPassword) {
    const subject = 'Welcome to EMS';
    const passwordBlock = tempPassword
      ? `<p>Your temporary password is: <strong>${tempPassword}</strong></p>
         <p>Please log in and change it immediately.</p>`
      : '';
    const html = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining  GreatTeam!. We pleased to see you here</p>
      <p>You can now login to access your dashboard and manage your profile.</p>
      ${passwordBlock}
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, nameOrToken, maybeToken) {
    const name = maybeToken ? nameOrToken : null;
    const resetToken = maybeToken || nameOrToken;
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>Hello ${name || 'there'},</p>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordChangeNotification(email, name) {
    const subject = 'Password Changed Successfully';
    const html = `
      <h1>Password Changed</h1>
      <p>Hello ${name || 'there'},</p>
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
