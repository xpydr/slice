import { Resend } from 'resend';
import dotenv from 'dotenv';
import { serverLogger } from '../lib/logger';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Send email verification code to user
 * @param email Recipient email address
 * @param code 6-digit verification code
 */
export async function sendVerificationCode(email: string, code: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    serverLogger.warn('RESEND_API_KEY not set, skipping email send', { email });
    // In development, log the code instead
    if (process.env.NODE_ENV !== 'production') {
      serverLogger.info('Verification code (dev mode)', { email, code });
    }
    return;
  }

  const startTime = Date.now();
  try {
    serverLogger.trackEvent('send_verification_email_attempt', { email });
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
              <h1 style="color: #2563eb; margin-top: 0;">Verify Your Email</h1>
              <p style="font-size: 16px; margin-bottom: 30px;">Please enter the following verification code to verify your email address:</p>
              <div style="background-color: #ffffff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">This code will expire in 15 minutes.</p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">If you didn't request this code, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    });
    const duration = Date.now() - startTime;
    serverLogger.trackEvent('send_verification_email_success', { email, duration });
  } catch (error) {
    serverLogger.trackError('send_verification_email_failed', error instanceof Error ? error : new Error('Unknown error'), { email });
    throw new Error('Failed to send verification email');
  }
}
