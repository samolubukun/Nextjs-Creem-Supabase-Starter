import { Queue } from "bullmq";
import { getBullMQConnection } from "./connection";
import { JOB_OPTIONS, QueueName, type QueueNameType } from "./types";

const queues = new Map<QueueNameType, Queue>();

export function getQueue<T extends QueueNameType>(name: T): Queue {
  if (!queues.has(name)) {
    const connection = getBullMQConnection();
    const queue = new Queue(name, {
      connection,
      defaultJobOptions: JOB_OPTIONS,
    });
    queues.set(name, queue);
  }
  return queues.get(name) as Queue;
}

export async function closeAllQueues(): Promise<void> {
  for (const queue of queues.values()) {
    await queue.close();
  }
  queues.clear();
}

export { QueueName };
