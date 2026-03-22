import { createClient } from "@supabase/supabase-js";
import {
  CreditCard,
  DollarSign,
  Key,
  Layers,
  MessageSquare,
  ShoppingBag,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { formatCurrency } from "@/lib/currency";
import { createSupabaseServer } from "@/lib/supabase/server";

type AdminSubscription = {
  status: string | null;
  product_name: string | null;
  seats: number | null;
};

type AdminProfileRow = {
  id: string;
  email?: string;
  created_at?: string;
  total_spent_cents?: number;
  user_metadata?: { full_name?: string };
  subscriptions?: AdminSubscription[];
};

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function AdminCRMPage() {
  const authSupabase = await createSupabaseServer();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  // Redirect if not admin
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim());

  if (!user || !user.email || !adminEmails.includes(user.email)) {
    redirect("/dashboard");
  }

  // Fetch all users from Auth directly (more reliable than profiles)
  const {
    data: { users },
    error: authError,
  } = await supabaseAdmin.auth.admin.listUsers();

  // Fetch profiles to get total_spent_cents
  const { data: profileRecords } = await supabaseAdmin
    .from("profiles")
    .select("id, total_spent_cents");

  // Fetch all credit transactions to calculate legacy revenue (fallback)
  const { data: allTransactions } = await supabaseAdmin
    .from("credit_transactions")
    .select("user_id, description");

  const profiles = (users || []).map((u) => {
    const profile = profileRecords?.find((p) => p.id === u.id);
    let spent = profile?.total_spent_cents || 0;

    // Fallback logic to match dashboard/page.tsx
    if (spent === 0 && allTransactions) {
      const userTxs = allTransactions.filter((tx) => tx.user_id === u.id);
      spent = userTxs.reduce((sum, tx) => {
        const match = (tx.description || "").match(/\[PRICE:(\d+)\]/);
        return sum + (match ? parseInt(match[1], 10) : 0);
      }, 0);
    }

    return {
      ...u,
      total_spent_cents: spent,
    };
  });

  // Fetch subscriptions
  const { data: subscriptions } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id, status, product_name, seats, current_period_end");

  // Fetch other stats
  const { count: activeLicenses } = await supabaseAdmin
    .from("licenses")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalPurchases } = await supabaseAdmin
    .from("purchases")
    .select("*", { count: "exact", head: true });

  const { count: totalChats } = await supabaseAdmin
    .from("chats")
    .select("*", { count: "exact", head: true });

  if (authError) {
    console.error("Error fetching users:", authError);
  }

  const profilesWithSubs = profiles?.map((p) => ({
    ...p,
    subscriptions: subscriptions?.filter((s) => s.user_id === p.id) || [],
  }));

  const usersCount = profiles?.length || 0;

  const activeSubs =
    subscriptions?.filter((s) => s.status === "active" || s.status === "trialing") || [];
  const activeSubsCount = activeSubs.length;
  const activeSeatsCount = activeSubs.reduce((acc, sub) => acc + (sub.seats || 1), 0);

  const totalRevenueCents = profiles.reduce((acc, p) => acc + (p.total_spent_cents || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Platform Analytics & User Management
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-6 bg-foreground border border-border rounded-3xl shadow-sm space-y-2 text-background col-span-2 transition-colors">
          <DollarSign className="size-6 text-primary" />
          <p className="text-sm font-black uppercase tracking-widest opacity-60">Total Revenue</p>
          <p className="text-4xl font-black">{formatCurrency(totalRevenueCents)}</p>
        </div>

        {/* Total Users */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-2">
          <Users className="size-6 text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Total Users
          </p>
          <p className="text-3xl font-black text-foreground">{usersCount}</p>
        </div>

        {/* Active Subscriptions */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-2">
          <CreditCard className="size-6 text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Active Subs
          </p>
          <p className="text-3xl font-black text-foreground">{activeSubsCount}</p>
        </div>

        {/* Active Seats */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-2">
          <Layers className="size-6 text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            B2B Seats
          </p>
          <p className="text-3xl font-black text-foreground">{activeSeatsCount}</p>
        </div>

        {/* Active Licenses */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-2">
          <Key className="size-6 text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Active Licenses
          </p>
          <p className="text-3xl font-black text-foreground">{activeLicenses || 0}</p>
        </div>

        {/* One-Time Purchases */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-2">
          <ShoppingBag className="size-6 text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            LTD Purchases
          </p>
          <p className="text-3xl font-black text-foreground">{totalPurchases || 0}</p>
        </div>

        {/* Total AI Chats */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-2">
          <MessageSquare className="size-6 text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            AI Conversations
          </p>
          <p className="text-3xl font-black text-foreground">{totalChats || 0}</p>
        </div>
      </div>

      <div className="bg-card border text-sm border-border rounded-3xl shadow-sm overflow-hidden text-foreground">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                User
              </th>
              <th className="p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                Joined
              </th>
              <th className="p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                Subscription
              </th>
              <th className="p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                Seats
              </th>
              <th className="p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">
                Spent
              </th>
              <th className="p-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">
                Options
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profilesWithSubs?.map((profile: AdminProfileRow) => {
              const activeSub = profile.subscriptions?.find(
                (s: AdminSubscription) => s.status === "active" || s.status === "trialing",
              );
              return (
                <tr key={profile.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {profile.user_metadata?.full_name || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {profile.created_at
                      ? new Date(String(profile.created_at)).toLocaleDateString()
                      : "Unknown"}
                  </td>
                  <td className="p-4">
                    {activeSub ? (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                        {activeSub.product_name}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-full border border-border">
                        No active subs
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs font-mono text-foreground">
                    {activeSub?.seats || "-"}
                  </td>
                  <td className="p-4 text-right font-black text-foreground">
                    {formatCurrency(profile.total_spent_cents || 0)}
                  </td>
                  <td className="p-4 text-center">
                    <DeleteUserButton
                      userId={profile.id}
                      userName={profile.user_metadata?.full_name || profile.email || "Guest"}
                    />
                  </td>
                </tr>
              );
            })}
            {(!profilesWithSubs || profilesWithSubs.length === 0) && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground font-bold text-sm">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
