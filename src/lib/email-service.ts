import { Resend } from 'resend';
import { render } from '@react-email/components';
import React from 'react';
import { WelcomeEmail, WelcomeEmailProps } from '@/emails/templates/welcome';
import { PaymentConfirmationEmail, PaymentConfirmationEmailProps } from '@/emails/templates/payment-confirmation';

const EMAIL_FROM = 'SAASXCREEM <system@saasxcreem.com>';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // In development, we might not have a key, so we just log
      if (process.env.NODE_ENV === 'development') {
        console.warn('RESEND_API_KEY is missing. Emails will only be logged.');
        return new Resend('re_dummy_key'); // Dummy key for local development
      }
      throw new Error('RESEND_API_KEY environment variable is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendWelcomeEmail(to: string, props: WelcomeEmailProps) {
  try {
    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'development') {
      console.log('--- [DEV] Welcome Email to', to, props);
      return { success: true, dummy: true };
    }

    const resend = getResendClient();
    const html = await render(React.createElement(WelcomeEmail, props));

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: 'System Activated! Welcome to SAASXCREEM 🚀',
      html,
    });

    if (error) {
      console.error('[EmailService] Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EmailService] Welcome email sent to ${to}, id: ${data?.id}`);
    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error('[EmailService] Error sending welcome email:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendPaymentConfirmationEmail(to: string, props: PaymentConfirmationEmailProps) {
  try {
    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'development') {
      console.log('--- [DEV] Payment Email to', to, props);
      return { success: true, dummy: true };
    }

    const resend = getResendClient();
    const html = await render(React.createElement(PaymentConfirmationEmail, props));

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: `Payment Successful! ${props.planName} Plan Active ✅`,
      html,
    });

    if (error) {
      console.error('[EmailService] Failed to send payment email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error('[EmailService] Error sending payment email:', err);
    return { success: false, error: String(err) };
  }
}
