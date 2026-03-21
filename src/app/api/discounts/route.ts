import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateDiscountCreate } from "./helpers";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateDiscountCreate(body);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await creem.discounts.create(validation.data);
    return NextResponse.json({ success: true, discount: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discount creation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "code parameter required" }, { status: 400 });
  }

  try {
    const result = await creem.discounts.get(undefined, code);
    return NextResponse.json({ discount: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discount not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
