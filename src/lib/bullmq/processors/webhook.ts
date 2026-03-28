import type { Job } from "bullmq";
import { buildCacheKey, deleteCacheKey } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { WebhookProcessingJobData } from "../types";

async function invalidateAdminCache() {
  await Promise.all([
    deleteCacheKey(buildCacheKey("admin", "profiles")),
    deleteCacheKey(buildCacheKey("admin", "credit_transactions")),
    deleteCacheKey(buildCacheKey("admin", "subscriptions")),
    deleteCacheKey(buildCacheKey("admin", "counts")),
  ]);
}

export async function processWebhookJob(job: Job<WebhookProcessingJobData>): Promise<void> {
  const { data } = job;
  const db = getSupabaseAdmin();

  switch (data.type) {
    case "checkout-completed": {
      logger.info("[Worker:Webhook] Processing checkout completion tasks", {
        webhookId: data.webhookId,
        userId: data.userId,
      });

      if (data.licenseKey) {
        const productName = data.productName ?? "Product";
        const { error: licError } = await db.from("licenses").upsert(
          {
            user_id: data.userId,
            creem_license_key: data.licenseKey,
            creem_product_id: data.productId,
            product_name: productName,
            status: "active",
            activated_at: new Date().toISOString(),
          },
          { onConflict: "creem_license_key" },
        );
        if (licError) {
          logger.error("[Worker:Webhook] License upsert failed", {
            userId: data.userId,
            error: licError.message,
          });
        }
      }

      await invalidateAdminCache();
      break;
    }

    default:
      logger.warn("[Worker:Webhook] Unknown webhook job type", {
        data: JSON.stringify(data),
      });
  }
}
