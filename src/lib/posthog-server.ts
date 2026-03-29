import { PostHog } from "posthog-node";
import { logger } from "@/lib/logger";

let client: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new PostHog(apiKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return client;
}

export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  const ph = getPostHogServer();
  if (!ph) return;

  try {
    ph.capture({
      distinctId,
      event,
      properties,
    });
  } catch (err) {
    logger.warn("[PostHog] Failed to capture server event", {
      event,
      error: String(err),
    });
  }
}

export async function shutdownPostHog() {
  if (client) {
    await client.shutdown();
    client = null;
  }
}
