import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await sendWelcomeEmail(email, {
      firstName: firstName || "there",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Welcome API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
