import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE', true),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
    try {
      const subject = 'Password Reset Request';
      const html = this.getPasswordResetTemplate(resetUrl, resetToken);

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@digitrade.com'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error}`);
      throw error;
    }
  }

  async sendEmailVerificationEmail(email: string, verificationUrl: string) {
    try {
      const subject = 'Email Verification';
      const html = this.getEmailVerificationTemplate(verificationUrl);

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@digitrade.com'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Email verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email verification email: ${error}`);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    try {
      const subject = 'Welcome to DigiTrade';
      const html = this.getWelcomeTemplate(fullName);

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@digitrade.com'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error}`);
      throw error;
    }
  }

  private getPasswordResetTemplate(resetUrl: string, resetToken: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <hr/>
          <small>Or copy this link: ${resetUrl}</small>
        </body>
      </html>
    `;
  }

  private getEmailVerificationTemplate(verificationUrl: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
          <p>If you didn't create this account, please ignore this email.</p>
          <hr/>
          <small>Or copy this link: ${verificationUrl}</small>
        </body>
      </html>
    `;
  }

  private getWelcomeTemplate(fullName: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Welcome to DigiTrade, ${fullName}!</h2>
          <p>Your account has been successfully created. You can now log in and start using our services.</p>
          <p>Features you can use:</p>
          <ul>
            <li>Send money internationally</li>
            <li>Track your transfers</li>
            <li>Manage beneficiaries</li>
            <li>View transaction history</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br/>DigiTrade Team</p>
        </body>
      </html>
    `;
  }
}
