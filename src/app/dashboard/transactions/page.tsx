import { redirect } from "next/navigation";
import { TransactionList } from "@/components/billing/transaction-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="space-y-10">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">
          Ledger Overview
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-foreground">
          Financial History
        </h1>
        <p className="text-muted-foreground font-medium mt-4">
          Transparent tracking of all system resources.
        </p>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="p-8 border-b border-border bg-background">
          <CardTitle className="text-xl text-foreground">Transaction Ledger</CardTitle>
          <CardDescription>Detailed history of acquisitions and subscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionList />
        </CardContent>
      </Card>
    </div>
  );
}
