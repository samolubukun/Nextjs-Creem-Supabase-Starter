import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email-service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_REQUESTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const requestLog = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

function isOriginAllowed(request: Request): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return true;

  const allowedOrigin = new URL(appUrl).origin;
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === allowedOrigin;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const previous = requestLog.get(ip) ?? [];
  const recent = previous.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    if (!isOriginAllowed(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { email, firstName } = await request.json();

    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    if (firstName && (typeof firstName !== "string" || firstName.length > 80)) {
      return NextResponse.json({ error: "Invalid firstName" }, { status: 400 });
    }

    await sendWelcomeEmail(email, {
      firstName: typeof firstName === "string" ? firstName : "there",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Welcome API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
