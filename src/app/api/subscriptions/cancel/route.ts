import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { logger } from "@/lib/logger";
import { enforceRateLimit, rateLimitPolicies } from "@/lib/rate-limit";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateCancelRequest } from "../validators";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit(
    request,
    rateLimitPolicies.subscriptionMutation,
    user.id,
  );
  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  const body = await request.json();
  const validation = validateCancelRequest(body);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { subscriptionId, mode } = validation.data;

  try {
    const result = await creem.subscriptions.cancel(subscriptionId, {
      mode,
      onExecute: mode === "scheduled" ? "cancel" : undefined,
    });
    const response = NextResponse.json({ success: true, subscription: result });
    rateLimit.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    logger.error("Subscription cancel failed", {
      event: "subscription.cancel_failed",
      userId: user.id,
      subscriptionId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    const message = error instanceof Error ? error.message : "Cancel failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
