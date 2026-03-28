import { startWorkers, stopWorkers } from "@/lib/bullmq/workers";

async function main() {
  console.log("[WorkerProcess] Starting BullMQ workers...");

  try {
    const workers = startWorkers();
    console.log(`[WorkerProcess] ${workers.length} workers started`);

    const shutdown = async (signal: string) => {
      console.log(`[WorkerProcess] Received ${signal}, shutting down...`);
      await stopWorkers();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[WorkerProcess] Failed to start workers:", error);
    process.exit(1);
  }
}

main();
