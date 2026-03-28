import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

let connection: IORedis | null = null;

export function getBullMQConnection(): IORedis {
  if (!REDIS_URL) {
    throw new Error(
      "REDIS_URL environment variable is required for BullMQ. " +
        "BullMQ needs a standard Redis connection (not Upstash HTTP). " +
        "Set REDIS_URL=redis://localhost:6379 or your Redis instance URL.",
    );
  }

  if (!connection) {
    connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    connection.on("error", (err) => {
      console.error("[BullMQ] Redis connection error:", err.message);
    });

    connection.on("connect", () => {
      console.log("[BullMQ] Redis connected");
    });
  }

  return connection;
}

export function isBullMQConfigured(): boolean {
  return Boolean(REDIS_URL);
}

export async function closeBullMQConnection(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
