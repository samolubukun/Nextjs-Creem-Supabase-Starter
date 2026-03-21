import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isUnlimited } from "@/app/api/credits/helpers";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  if (wallet.balance === 0) {
    return NextResponse.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
  }

  const { messages } = await req.json();
  const provider = process.env.LLM_PROVIDER || "gemini";
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiKey) {
    return NextResponse.json({ error: "AI Assistant is not configured. Please add LLM_API_KEY to your environment." }, { status: 500 });
  }

  try {
    let content = "";

    if (provider === "gemini") {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }))
        })
      });

      const data = await response.json();
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    } else if (provider === "openai" || provider === "anthropic") {
      const baseUrl = provider === "openai" ? "https://api.openai.com/v1" : "https://api.anthropic.com/v1";
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          ...(provider === "anthropic" && { "x-api-key": apiKey, "anthropic-version": "2023-06-01" })
        },
        body: JSON.stringify({
          model: model || (provider === "openai" ? "gpt-4o-mini" : "claude-3-haiku-20240307"),
          messages: messages.map((m: any) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      content = data.choices?.[0]?.message?.content || data.content?.[0]?.text || "I couldn't generate a response.";
    } else {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    // 2. Silent Credit Deduction (1 credit per response)
    if (!isUnlimited(wallet.balance)) {
      await db
        .from("credits")
        .update({ 
          balance: wallet.balance - 1,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json({ error: "Failed to communicate with AI provider" }, { status: 500 });
  }
}
