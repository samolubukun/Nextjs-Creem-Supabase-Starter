"use client";

import * as React from 'react';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";

interface Subscription {
  status: string;
  product_name: string;
  current_period_end: string;
  creem_customer_id: string;
}

export function SubscriptionCard({ subscription }: { subscription: Subscription | null }) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    const res = await fetch("/api/billing-portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  }

  if (!subscription) {
    return (
      <Card className="border-none shadow-sm h-full bg-white">
        <CardHeader className="p-8">
           <CardTitle className="text-xl">System Status</CardTitle>
           <CardDescription>No active subscription detected.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <Button asChild className="w-full h-14 rounded-2xl font-black uppercase tracking-tight">
             <a href="/pricing">Establish System Plan →</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-success/5 text-success border-success/20",
    cancelled: "bg-destructive/5 text-destructive border-destructive/20",
    paused: "bg-warning/5 text-warning border-warning/20",
    expired: "bg-slate-100 text-slate-400 border-slate-200",
  };

  return (
    <Card className="border-none shadow-sm h-full bg-white overflow-hidden">
      <div className={cn("h-1.5 w-full", subscription.status === "active" ? "bg-success" : "bg-warning")} />
      <CardHeader className="p-8">
        <CardTitle className="text-xl">Subscription Logistics</CardTitle>
        <CardDescription>Managed via Creem billing infrastructure.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Configuration</span>
          <span className="text-sm font-black uppercase tracking-tight text-foreground italic">{subscription.product_name}</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational State</span>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border",
              statusColors[subscription.status] || statusColors.expired
            )}
          >
            {subscription.status}
          </span>
        </div>
        {subscription.current_period_end && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#ffbe98] border border-[#ffbe98]/20 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Next Payment Date</span>
            <span className="text-lg font-black text-black">
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          </div>
        )}

        <Button
          onClick={handleManageBilling}
          disabled={loading}
          variant="outline"
          className="w-full h-14 rounded-2xl font-black uppercase tracking-tight mt-4 gap-2 border-2"
        >
          {loading ? (
             <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
             <ExternalLink className="size-4" />
          )}
          {loading ? "Decrypting Portal..." : "Secure Billing Portal"}
        </Button>
      </CardContent>
    </Card>
  );
}
