import { logger } from "@/lib/logger";
import { isBullMQConfigured } from "./connection";
import { getQueue, QueueName } from "./queues";
import type { AuditLogJobData, EmailJobData, WebhookProcessingJobData } from "./types";

export async function enqueueEmail(data: EmailJobData): Promise<boolean> {
  if (!isBullMQConfigured()) {
    logger.warn("[Queue] BullMQ not configured, email job skipped", {
      type: data.type,
      email: data.email,
    });
    return false;
  }

  const queue = getQueue(QueueName.EMAIL);
  const jobId = `email:${data.type}:${data.email}:${Date.now()}`;
  await queue.add(jobId, data);
  logger.info("[Queue] Email job enqueued", { jobId, type: data.type });
  return true;
}

export async function enqueueWebhookProcessing(data: WebhookProcessingJobData): Promise<boolean> {
  if (!isBullMQConfigured()) {
    logger.warn("[Queue] BullMQ not configured, webhook job skipped", {
      type: data.type,
      webhookId: data.webhookId,
    });
    return false;
  }

  const queue = getQueue(QueueName.WEBHOOK_PROCESSING);
  const jobId = `webhook:${data.type}:${data.webhookId}`;
  await queue.add(jobId, data);
  logger.info("[Queue] Webhook processing job enqueued", {
    jobId,
    type: data.type,
  });
  return true;
}

export async function enqueueAuditLog(data: AuditLogJobData): Promise<boolean> {
  if (!isBullMQConfigured()) {
    return false;
  }

  const queue = getQueue(QueueName.AUDIT);
  const jobId = `audit:${data.userId}:${data.action}:${Date.now()}`;
  await queue.add(jobId, data);
  return true;
}
