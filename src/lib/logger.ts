import pino from "pino";

type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

const betterStackToken = process.env.BETTERSTACK_SOURCE_TOKEN;
const betterStackHost = process.env.BETTERSTACK_INGESTING_HOST;

const baseLogger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  redact: {
    paths: [
      "authorization",
      "headers.authorization",
      "apiKey",
      "token",
      "secret",
      "password",
      "email",
    ],
    censor: "[Redacted]",
  },
});

function getIngestUrl() {
  if (!betterStackHost) return null;
  return betterStackHost.startsWith("http") ? betterStackHost : `https://${betterStackHost}`;
}

async function sendToBetterStack(level: LogLevel, message: string, meta: LogMeta) {
  const endpoint = getIngestUrl();
  if (!endpoint || !betterStackToken) return;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${betterStackToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dt: new Date().toISOString(),
        level,
        message,
        ...meta,
      }),
      cache: "no-store",
    });
  } catch {
    // Intentionally swallowed: logging must never break requests.
  }
}

function log(level: LogLevel, message: string, meta: LogMeta = {}) {
  if (level === "info") {
    baseLogger.info(meta, message);
  } else if (level === "warn") {
    baseLogger.warn(meta, message);
  } else {
    baseLogger.error(meta, message);
  }

  void sendToBetterStack(level, message, meta);
}

export const logger = {
  info: (message: string, meta?: LogMeta) => log("info", message, meta),
  warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
  error: (message: string, meta?: LogMeta) => log("error", message, meta),
};
