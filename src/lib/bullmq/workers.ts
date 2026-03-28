import { type Job, Worker } from "bullmq";
import { closeBullMQConnection, getBullMQConnection } from "./connection";
import { processAuditJob } from "./processors/audit";
import { processEmailJob } from "./processors/email";
import { processWebhookJob } from "./processors/webhook";
import { QueueName, type QueueNameType } from "./types";

type WorkerConfig = {
  name: QueueNameType;
  processor: (job: Job) => Promise<void>;
  concurrency: number;
};

const WORKER_CONFIGS: WorkerConfig[] = [
  {
    name: QueueName.EMAIL,
    processor: processEmailJob as (job: Job) => Promise<void>,
    concurrency: 5,
  },
  {
    name: QueueName.WEBHOOK_PROCESSING,
    processor: processWebhookJob as (job: Job) => Promise<void>,
    concurrency: 3,
  },
  {
    name: QueueName.AUDIT,
    processor: processAuditJob as (job: Job) => Promise<void>,
    concurrency: 10,
  },
];

const workers: Worker[] = [];

export function startWorkers(): Worker[] {
  const connection = getBullMQConnection();

  for (const config of WORKER_CONFIGS) {
    const worker = new Worker(config.name, config.processor, {
      connection,
      concurrency: config.concurrency,
    });

    worker.on("completed", (job: Job) => {
      console.log(`[Worker:${config.name}] Job ${job.id} completed`);
    });

    worker.on("failed", (job: Job | undefined, err: Error) => {
      console.error(`[Worker:${config.name}] Job ${job?.id ?? "unknown"} failed:`, err.message);
    });

    worker.on("error", (err: Error) => {
      console.error(`[Worker:${config.name}] Worker error:`, err.message);
    });

    workers.push(worker);
    console.log(`[Worker:${config.name}] Started (concurrency: ${config.concurrency})`);
  }

  return workers;
}

export async function stopWorkers(): Promise<void> {
  console.log("[Workers] Shutting down gracefully...");

  await Promise.all(workers.map((w) => w.close()));
  workers.length = 0;

  await closeBullMQConnection();
  console.log("[Workers] All workers stopped");
}
