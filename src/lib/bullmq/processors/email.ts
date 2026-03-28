import type { Job } from "bullmq";
import { sendPaymentConfirmationEmail, sendWelcomeEmail } from "@/lib/email-service";
import { logger } from "@/lib/logger";
import type { EmailJobData } from "../types";

export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { data } = job;

  switch (data.type) {
    case "welcome": {
      logger.info("[Worker:Email] Processing welcome email", {
        email: data.email,
      });
      const result = await sendWelcomeEmail(data.email, {
        firstName: data.firstName,
      });
      if (!result.success) {
        throw new Error(`Welcome email failed: ${result.error}`);
      }
      break;
    }

    case "payment-confirmation": {
      logger.info("[Worker:Email] Processing payment confirmation email", {
        email: data.email,
        planName: data.planName,
      });
      const result = await sendPaymentConfirmationEmail(data.email, {
        firstName: data.firstName,
        planName: data.planName,
        amount: data.amount,
      });
      if (!result.success) {
        throw new Error(`Payment confirmation email failed: ${result.error}`);
      }
      break;
    }

    default:
      logger.warn("[Worker:Email] Unknown email job type", {
        data: JSON.stringify(data),
      });
  }
}
