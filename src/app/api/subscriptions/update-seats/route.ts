import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateSeatUpdate } from "../validators";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateSeatUpdate(body);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { subscriptionId, units } = validation.data;

  try {
    const result = await creem.subscriptions.update(subscriptionId, {
      items: [{ units }],
    });
    return NextResponse.json({ success: true, subscription: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seat update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
