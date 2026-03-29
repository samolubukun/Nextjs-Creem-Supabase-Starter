import { type NextRequest, NextResponse } from "next/server";
import { isUnlimited } from "@/app/api/credits/helpers";
import { logger } from "@/lib/logger";
import { enforceRateLimit, rateLimitPolicies } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

function parseMessages(payload: unknown): ChatMessage[] {
  if (!payload || typeof payload !== "object") return [];

  const maybeMessages = (payload as { messages?: unknown }).messages;
  if (!Array.isArray(maybeMessages)) return [];

  return maybeMessages
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const role = (message as { role?: unknown }).role;
      const content = (message as { content?: unknown }).content;

      if (
        (role === "user" || role === "assistant" || role === "system") &&
        typeof content === "string" &&
        content.trim().length > 0
      ) {
        return { role, content };
      }

      return null;
    })
    .filter((message): message is ChatMessage => message !== null);
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit(req, rateLimitPolicies.chat, user.id);
  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  const db = getSupabaseAdmin();

  // 1. Credit Check
  const { data: wallet } = await db
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: "No credits record found" }, { status: 404 });
  }

  if (!isUnlimited(wallet.balance) && wallet.balance <= 0) {
    return NextResponse.json(
      { error: "Insufficient credits. Please upgrade your plan." },
      { status: 402 },
    );
  }

  const payload = await req.json();
  const messages = parseMessages(payload);

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "messages must contain at least one valid message" },
      { status: 400 },
    );
  }

  const provider = process.env.LLM_PROVIDER || "gemini";
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AI Assistant is not configured. Please add LLM_API_KEY to your environment." },
      { status: 500 },
    );
  }

  try {
    let content = "";

    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-1.5-flash"}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          }),
        },
      );

      const data = await response.json();
      content =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    } else if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      content = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
    } else if (provider === "anthropic") {
      const systemMessages = messages.filter((m) => m.role === "system");
      const nonSystemMessages = messages.filter((m) => m.role !== "system");

      const body: Record<string, unknown> = {
        model: model || "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: nonSystemMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      if (systemMessages.length > 0) {
        body.system = systemMessages.map((m) => m.content).join("\n");
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      content = data.content?.[0]?.text || "I couldn't generate a response.";
    } else {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    // 2. Silent Credit Deduction (1 credit per response)
    if (!isUnlimited(wallet.balance)) {
      const { error: spendErr } = await db.rpc("spend_credits", {
        p_user_id: user.id,
        p_amount: 1,
        p_reason: "AI assistant response",
      });

      if (spendErr) {
        logger.error("AI credit deduction failed", {
          event: "chat.credit_deduction_failed",
          userId: user.id,
          error: spendErr.message,
        });
      }
    }

    const response = NextResponse.json({ content });
    rateLimit.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    logger.error("AI assistant request failed", {
      event: "chat.request_failed",
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Failed to communicate with AI provider" }, { status: 500 });
  }
}
