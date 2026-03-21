import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await getSupabaseAdmin()
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ balance: data?.balance ?? 0 });
}
