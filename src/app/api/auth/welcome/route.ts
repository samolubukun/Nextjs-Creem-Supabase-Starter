import { type NextRequest, NextResponse } from "next/server";
import { enqueueEmail, isBullMQConfigured } from "@/lib/bullmq";
import { sendWelcomeEmail } from "@/lib/email-service";
import { logger } from "@/lib/logger";
import { enforceRateLimit, rateLimitPolicies } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isOriginAllowed(request: NextRequest): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return true;

  const allowedOrigin = new URL(appUrl).origin;
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === allowedOrigin;
}

export async function POST(request: NextRequest) {
  try {
    if (!isOriginAllowed(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rateLimit = await enforceRateLimit(request, rateLimitPolicies.welcome);
    if (!rateLimit.ok) {
      return rateLimit.response;
    }

    const { email, firstName } = await request.json();

    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    if (firstName && (typeof firstName !== "string" || firstName.length > 80)) {
      return NextResponse.json({ error: "Invalid firstName" }, { status: 400 });
    }

    const emailData = {
      firstName: typeof firstName === "string" ? firstName : "there",
    };

    if (isBullMQConfigured()) {
      await enqueueEmail({
        type: "welcome",
        email,
        firstName: emailData.firstName,
      });
    } else {
      await sendWelcomeEmail(email, emailData);
    }

    const response = NextResponse.json({ success: true });
    rateLimit.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    logger.error("Welcome email route failed", {
      event: "welcome_email.failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
