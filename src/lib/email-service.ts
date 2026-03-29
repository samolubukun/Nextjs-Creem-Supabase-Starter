import { render } from "@react-email/components";
import React from "react";
import { Resend } from "resend";
import {
  PaymentConfirmationEmail,
  type PaymentConfirmationEmailProps,
} from "@/emails/templates/payment-confirmation";
import { WelcomeEmail, type WelcomeEmailProps } from "@/emails/templates/welcome";

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "SAASXCREEM <system@saasxcreem.com>";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === "development") {
        console.warn("RESEND_API_KEY is missing. Emails will only be logged.");
        return new Resend("re_dummy_key");
      }
      throw new Error("RESEND_API_KEY environment variable is not configured");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendWelcomeEmail(to: string, props: WelcomeEmailProps) {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "development") {
    console.log("--- [DEV] Welcome Email to", to, props);
    return { success: true, dummy: true };
  }

  const resend = getResendClient();
  const html = await render(React.createElement(WelcomeEmail, props));
  const text = await render(React.createElement(WelcomeEmail, props), { plainText: true });

  const { data, error } = await resend.emails.send(
    {
      from: EMAIL_FROM,
      to: [to],
      subject: "System Activated! Welcome to SAASXCREEM",
      html,
      text,
    },
    { idempotencyKey: `welcome/${to}` },
  );

  if (error) {
    console.error("[EmailService] Failed to send welcome email:", error);
    return { success: false, error: error.message };
  }

  console.log(`[EmailService] Welcome email sent to ${to}, id: ${data?.id}`);
  return { success: true, emailId: data?.id };
}

export async function sendPaymentConfirmationEmail(
  to: string,
  props: PaymentConfirmationEmailProps,
) {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "development") {
    console.log("--- [DEV] Payment Email to", to, props);
    return { success: true, dummy: true };
  }

  const resend = getResendClient();
  const html = await render(React.createElement(PaymentConfirmationEmail, props));
  const text = await render(React.createElement(PaymentConfirmationEmail, props), {
    plainText: true,
  });

  const { data, error } = await resend.emails.send(
    {
      from: EMAIL_FROM,
      to: [to],
      subject: `Payment Successful! ${props.planName} Plan Active`,
      html,
      text,
    },
    { idempotencyKey: `payment-confirmation/${to}/${props.planName}` },
  );

  if (error) {
    console.error("[EmailService] Failed to send payment email:", error);
    return { success: false, error: error.message };
  }

  return { success: true, emailId: data?.id };
}
