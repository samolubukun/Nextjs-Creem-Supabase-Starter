export const QueueName = {
  EMAIL: "email",
  WEBHOOK_PROCESSING: "webhook-processing",
  AUDIT: "audit",
} as const;

export type QueueNameType = (typeof QueueName)[keyof typeof QueueName];

export type WelcomeEmailJobData = {
  type: "welcome";
  email: string;
  firstName: string;
};

export type PaymentConfirmationEmailJobData = {
  type: "payment-confirmation";
  email: string;
  firstName: string;
  planName: string;
  amount: string;
};

export type EmailJobData = WelcomeEmailJobData | PaymentConfirmationEmailJobData;

export type WebhookProcessingJobData = {
  type: "checkout-completed";
  webhookId: string;
  userId: string;
  productId: string;
  productName: string;
  email: string;
  firstName: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  subscriptionId?: string;
  licenseKey?: string;
};

export type AuditLogJobData = {
  userId: string;
  action: string;
  metadata?: string;
};

export type JobDataMap = {
  [QueueName.EMAIL]: EmailJobData;
  [QueueName.WEBHOOK_PROCESSING]: WebhookProcessingJobData;
  [QueueName.AUDIT]: AuditLogJobData;
};

export const JOB_OPTIONS = {
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 2000,
  },
};
