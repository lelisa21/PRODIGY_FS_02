import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.isEnabled = false;
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    // Check if email should be disabled
    if (process.env.DISABLE_EMAILS === 'true') {
      logger.info('Email service is disabled by DISABLE_EMAILS flag');
      this.isEnabled = false;
      return;
    }

    const hasValidConfig = this.hasValidEmailConfig();
    
    if (!hasValidConfig) {
      logger.warn('Email service disabled - missing EMAIL_USER or EMAIL_PASS');
      this.isEnabled = false;
      return;
    }

    if (process.env.NODE_ENV === 'production') {
      const host = process.env.EMAIL_HOST;
      if (!host || host === '127.0.0.1') {
        logger.warn('Email service disabled - invalid EMAIL_HOST for production');
        this.isEnabled = false;
        return;
      }
    }

    try {
      const host = process.env.EMAIL_HOST;
      const port = Number(process.env.EMAIL_PORT || 587);
      const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

      const auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
      };

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });

      this.isEnabled = true;
      logger.info(`Email service initialized with ${host}:${port}`);
    } catch (error) {
      logger.error('Failed to initialize email service:', error.message);
      this.isEnabled = false;
    }
  }

  hasValidEmailConfig() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    return emailUser && emailPass;
  }

  async sendWelcomeEmail(email, name, tempPassword) {
    if (!this.isEnabled) {
      logger.info(`[SKIP] Welcome email would be sent to ${email}`);
      return { success: true, skipped: true, message: 'Email service disabled' };
    }

    const subject = 'Welcome to GreatTeam!';
    const passwordBlock = tempPassword
      ? `<p>Your temporary password is: <strong>${tempPassword}</strong></p>
         <p>Please log in and change it immediately.</p>`
      : '';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Welcome ${name}!</h2>
        <p>Thank you for joining GreatTeam! We're pleased to see you here.</p>
        <p>You can now login to access your dashboard and manage your profile.</p>
        ${passwordBlock}
        <hr style="margin: 20px 0; border-color: #eee;" />
        <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, nameOrToken, maybeToken) {
    if (!this.isEnabled) {
      logger.info(`[SKIP] Password reset email would be sent to ${email}`);
      return { success: true, skipped: true };
    }

    const name = maybeToken ? nameOrToken : null;
    const resetToken = maybeToken || nameOrToken;
    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.PUBLIC_URL ||
      'http://localhost:5173';
    const baseUrl = frontendUrl.replace(/\/+$/, '');
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Password Reset</h2>
        <p>Hello ${name || 'there'},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px;">This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 20px 0; border-color: #eee;" />
        <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordChangeNotification(email, name) {
    if (!this.isEnabled) {
      logger.info(`[SKIP] Password change notification would be sent to ${email}`);
      return { success: true, skipped: true };
    }

    const subject = 'Password Changed Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">Password Changed</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
        <hr style="margin: 20px 0; border-color: #eee;" />
        <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendEmail(to, subject, html) {
    if (!this.isEnabled) {
      return { success: true, skipped: true };
    }

    try {
      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
      if (!fromEmail) {
        logger.error('No FROM email address configured');
        return { success: false, error: 'No FROM email configured' };
      }

      const mailOptions = {
        from: `"GreatTeam EMS System" <${fromEmail}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email send error:', error.message);
      // Don't throw - just return error object
      return { success: false, error: error.message };
    }
  }
  isEmailEnabled() {
    return this.isEnabled;
  }
}

export default new EmailService();
