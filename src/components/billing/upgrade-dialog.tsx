"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ArrowUp, ArrowDown, Loader2, Rocket, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Plan {
  id: string;
  name: string;
  price: number;
  period?: string;
}

interface UpgradeDialogProps {
  subscriptionId: string;
  currentProductId: string;
  plans: Plan[];
}

export function UpgradeDialog({ subscriptionId, currentProductId, plans }: UpgradeDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentPlan = plans.find((p) => p.id === currentProductId);

  async function handleUpgrade(plan: Plan) {
    setLoading(plan.id);
    setError(null);

    // If it's a one-time payment, we trigger a new checkout instead of a sub upgrade
    if (plan.period === "one-time") {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: plan.id }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error(data.error || "Failed to create checkout");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed");
        setLoading(null);
        return;
      }
    }

    const res = await fetch("/api/subscriptions/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, newProductId: plan.id }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upgrade failed");
      setLoading(null);
      return;
    }

    // Set a special syncing state for 3 seconds to allow webhooks to process
    setLoading("syncing");
    await new Promise((resolve) => setTimeout(resolve, 3500));

    router.replace("/dashboard?sync=success");
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-2 mb-2">
         <Rocket className="size-4 text-primary" />
         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Tiers</p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentProductId;
          const isUpgrade = currentPlan && plan.price > currentPlan.price;

          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-3xl border-2 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all",
                isCurrent 
                   ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                   : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                 <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                    isCurrent ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                 )}>
                    <Zap className="size-5" />
                 </div>
                 <div className="text-left min-w-0 flex-1">
                    <div className="text-xs font-black text-foreground uppercase tracking-tight break-words">{plan.name} Node</div>
                    <div className="text-lg font-black tracking-tighter italic text-muted-foreground">
                       {formatCurrency(plan.price)}<span className="text-[10px] not-italic">/{plan.period || "month"}</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {isCurrent ? (
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary px-4 py-2 rounded-full border border-primary/20 bg-primary/5 w-full sm:w-auto">
                    <Check className="size-3" />
                    Current
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading !== null}
                    className="flex-1 sm:flex-none min-w-[100px] rounded-xl font-black uppercase tracking-widest text-[10px] h-10 gap-2 border-2 hover:bg-primary hover:text-primary-foreground"
                  >
                    {loading === plan.id || loading === "syncing" ? (
                       <Loader2 className="size-3 animate-spin" />
                    ) : isUpgrade ? (
                       <ArrowUp className="size-3 text-success group-hover:text-primary-foreground" />
                    ) : (
                       <ArrowDown className="size-3 text-warning group-hover:text-primary-foreground" />
                    )}
                    {loading === "syncing" ? "Syncing Node" : loading === plan.id ? "Processing" : isUpgrade ? "Upgrade" : "Downgrade"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
         <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl text-destructive text-[10px] font-black uppercase tracking-tight text-center">
            {error}
         </div>
      )}
    </div>
  );
}
