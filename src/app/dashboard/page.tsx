import {
  Activity,
  AlertTriangle,
  Box,
  CreditCard,
  ExternalLink,
  History,
  Key,
  Layout,
  Rocket,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isUnlimited } from "@/app/api/credits/helpers";
import type { RawTransaction } from "@/app/api/transactions/helpers";
import { formatTransaction } from "@/app/api/transactions/helpers";
import { CancelDialog } from "@/components/billing/cancel-dialog";
import { CheckoutSync } from "@/components/billing/checkout-sync";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { AlertBanner } from "@/components/shared/alert-banner";
import { SeatManager } from "@/components/teams/seat-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/credits-config";
import { formatCurrency } from "@/lib/currency";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type DashboardProfile = {
  total_spent_cents?: number | null;
};

type DashboardCreditTransaction = {
  id: string;
  amount: number;
  description?: string | null;
  created_at: string;
  type: string;
  status?: string;
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getSupabaseAdmin();

  // Fetch all dashboard data in parallel
  const [subResult, creditsResult, dbResult, licensesResult, eventsResult, txResult] =
    await Promise.all([
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      db.from("credits").select("balance").eq("user_id", user.id).maybeSingle(),
      db.from("profiles").select("total_spent_cents").eq("id", user.id).maybeSingle(),
      db
        .from("licenses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      db
        .from("billing_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      db
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const subscription = subResult.data;
  const credits = creditsResult.data;
  const profile = dbResult.data as DashboardProfile | null;
  const licenses = licensesResult.data ?? [];
  const billingEvents = eventsResult.data ?? [];
  const creditTransactions = (txResult.data ?? []) as DashboardCreditTransaction[];

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  // 1. Start with the profile's dedicated tracking column
  let totalSpentCents = profile?.total_spent_cents || 0;

  // 2. Fallback: If the column is 0, scan credit_transactions metadata for legacy data sync
  if (totalSpentCents === 0 && creditTransactions.length > 0) {
    totalSpentCents = creditTransactions.reduce((sum: number, tx) => {
      const match = (tx.description || "").match(/\[PRICE:(\d+)\]/);
      return sum + (match ? parseInt(match[1], 10) : 0);
    }, 0);
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-12 md:pb-20">
      <Suspense>
        <CheckoutSync />
      </Suspense>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 border-b pb-6 md:pb-8 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start w-full md:w-auto">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 md:mb-2 block">
            Account Dashboard
          </span>
          <h1 className="text-2xl md:text-6xl font-black tracking-tighter uppercase leading-none whitespace-nowrap bg-gradient-to-b from-foreground via-foreground/90 via-80% to-primary/60 bg-clip-text text-transparent">
            Command Center
          </h1>

          {/* Mobile Active Node Status */}
          <div className="mt-4 md:hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full border border-success/20">
              <div className="size-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-success">
                Active Node
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Active Node Status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full border border-success/20">
            <div className="size-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-success">
              Active Node
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <AlertBanner events={billingEvents} />

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Credit Balance */}
        <Card className="border border-border shadow-sm bg-card overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Zap className="size-5 md:size-6" />
              </div>
              <TrendingUp className="size-4 text-success" />
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-60">
              Credit Balance
            </p>
            <h3
              className={cn(
                "font-black tracking-tighter uppercase leading-none text-foreground",
                isUnlimited(credits?.balance ?? 0)
                  ? "text-2xl lg:text-3xl"
                  : "text-2xl md:text-4xl",
              )}
            >
              {isUnlimited(credits?.balance ?? 0)
                ? "Unlimited"
                : (credits?.balance ?? 0).toLocaleString()}
            </h3>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className="border border-border shadow-sm bg-card overflow-hidden text-primary">
          <CardContent className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div
                className={cn(
                  "size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner",
                  isActive ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground",
                )}
              >
                <Rocket className="size-5 md:size-6" />
              </div>
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-60">
              Subscription
            </p>
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">
              {subscription?.status ?? "Offline"}
            </h3>
          </CardContent>
        </Card>

        {/* Licenses */}
        <Card className="border border-border shadow-sm bg-card overflow-hidden text-foreground">
          <CardContent className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                <Key className="size-5 md:size-6" />
              </div>
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-60">
              Active Licenses
            </p>
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none">
              {licenses.length}
            </h3>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="border border-border shadow-sm bg-card overflow-hidden text-foreground">
          <CardContent className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-foreground text-background flex items-center justify-center shadow-inner transition-colors">
                <CreditCard className="size-5 md:size-6" />
              </div>
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-60">
              Total Spent
            </p>
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none">
              {formatCurrency(totalSpentCents)}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* SYSTEM CONTROL TOTAL REDESIGN */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Layout className="size-5 text-primary" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Account Management</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: Operating Level Selection */}
          <Card className="border border-border shadow-xl bg-card overflow-hidden">
            <CardHeader className="p-6 md:p-8 bg-secondary border-b border-border">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                  <Box className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Subscription Plans</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-black tracking-widest text-primary">
                    Manage your service tier
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {isActive ? (
                <UpgradeDialog
                  subscriptionId={subscription?.creem_subscription_id || ""}
                  currentProductId={subscription?.creem_product_id || ""}
                  plans={PLANS}
                />
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="size-10 text-warning mx-auto mb-4" />
                  <p className="text-sm font-black uppercase tracking-tight text-muted-foreground mb-6">
                    No active subscription detected.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-tight"
                  >
                    <Link href="/pricing">Start Subscription</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: Logistics & Administration */}
          <div className="space-y-8">
            {/* Team Allocation */}
            <Card className="border border-border shadow-xl bg-card">
              <CardHeader className="p-6 md:p-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-foreground text-background flex items-center justify-center shadow-lg transition-colors">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Team Management</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                      Manage user seats and access
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0">
                {isActive && subscription?.creem_subscription_id ? (
                  <SeatManager
                    subscriptionId={subscription.creem_subscription_id}
                    currentSeats={subscription.seats || 1}
                  />
                ) : (
                  <div className="p-6 bg-secondary rounded-[2rem] border-2 border-dashed border-border text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Locked until subscription starts
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Administrative Actions */}
            <Card className="border border-border shadow-xl bg-card">
              <CardHeader className="p-6 md:p-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border">
                    <Settings className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Billing & Settings</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                      Manage your billing preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <form action="/api/billing-portal" method="POST" className="h-full">
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-2 font-black uppercase tracking-tight text-[10px] gap-2"
                    >
                      <ExternalLink className="size-4" /> Secure Billing Portal
                    </Button>
                  </form>
                  <div className="h-14 flex items-center px-6 bg-primary rounded-2xl border border-primary/20 shadow-sm">
                    <div className="flex-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-foreground/60">
                        Next Payment Date
                      </p>
                      <p className="text-lg font-black uppercase italic text-primary-foreground">
                        {subscription?.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                {isActive && subscription?.creem_subscription_id && (
                  <div className="pt-6 border-t border-border flex justify-center">
                    <CancelDialog
                      subscriptionId={subscription.creem_subscription_id}
                      currentPeriodEnd={subscription.current_period_end}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <History className="size-5 text-primary" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
            Transaction History
          </h2>
        </div>
        <Card className="border border-border shadow-sm bg-card overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4">
              {creditTransactions.slice(0, 8).map((rawTx) => {
                const tx = formatTransaction({
                  ...rawTx,
                  description: rawTx.description ?? undefined,
                  status: rawTx.status || "completed",
                } as RawTransaction);
                return (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 rounded-[2rem] bg-background border border-border transition-all hover:bg-card hover:shadow-lg hover:border-primary/20 group gap-4 md:gap-6"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 w-full">
                      <div
                        className={cn(
                          "size-10 sm:size-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 shrink-0",
                          tx.amount > 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {tx.amount > 0 ? (
                          <Zap className="size-5 sm:size-6" />
                        ) : (
                          <Activity className="size-5 sm:size-6" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-black uppercase tracking-tight leading-tight break-words text-foreground">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase opacity-60">
                            {tx?.created_at
                              ? new Date(tx.created_at).toLocaleDateString()
                              : "Pending"}
                          </p>
                          <span className="px-2 py-0.5 bg-background rounded-full text-[8px] font-black uppercase tracking-tighter text-muted-foreground border border-border">
                            {tx.planType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-lg sm:text-xl font-black tracking-tighter self-end sm:self-center shrink-0",
                        isUnlimited(tx.amount) || tx.amount > 0
                          ? "text-success"
                          : "text-destructive",
                      )}
                    >
                      {isUnlimited(tx.amount)
                        ? "Unlimited"
                        : `${tx.amount > 0 ? "+" : ""}${tx.amount} Credits`}
                    </span>
                  </div>
                );
              })}
              {creditTransactions.length === 0 && (
                <div className="text-center py-20 bg-secondary rounded-[3rem] border-2 border-dashed border-border">
                  <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                    No history recorded
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
