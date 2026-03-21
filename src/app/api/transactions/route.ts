import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatTransaction } from "./helpers";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  try {
    // Determine if we should use admin or regular client based on RLS
    // The schema says user_id = auth.uid() is allowed for select, so regular client works.
    const { data: transactions, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const formatted = (transactions || []).map((tx: any) =>
      formatTransaction({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        status: "completed", // Internal logs are considered completed
        created_at: tx.created_at,
        description: tx.description || "",
      }),
    );

    return NextResponse.json({ transactions: formatted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch transactions";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
