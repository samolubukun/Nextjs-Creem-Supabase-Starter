import type { Job } from "bullmq";
import { logger } from "@/lib/logger";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AuditLogJobData } from "../types";

export async function processAuditJob(job: Job<AuditLogJobData>): Promise<void> {
  const { data } = job;
  const db = getSupabaseAdmin();

  logger.info("[Worker:Audit] Recording audit log", {
    userId: data.userId,
    action: data.action,
  });

  const { error } = await db.from("audit_logs").insert({
    user_id: data.userId,
    action: data.action,
    metadata: data.metadata,
  });

  if (error) {
    throw new Error(`Audit log insert failed: ${error.message}`);
  }
}
