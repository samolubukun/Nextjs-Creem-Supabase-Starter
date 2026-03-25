import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { logger } from "@/lib/logger";
import { enforceRateLimit, rateLimitPolicies } from "@/lib/rate-limit";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit(request, rateLimitPolicies.checkout, user.id);
  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  const { productId, discountCode } = await request.json();

  try {
    const checkout = await creem.checkouts.create({
      productId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      discountCode: discountCode || undefined,
      metadata: {
        user_id: user.id,
      },
    });

    const response = NextResponse.json({ url: checkout.checkoutUrl });
    rateLimit.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    logger.error("Checkout creation failed", {
      event: "checkout.create_failed",
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 400 });
  }
}
