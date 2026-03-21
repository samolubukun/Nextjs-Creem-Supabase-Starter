"use client";

import * as React from "react";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  productId: string;
  popular?: boolean;
}

export function PricingCard({ plan, discountCode }: { plan: PricingPlan; discountCode?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: plan.productId, discountCode }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error === "Unauthorized") {
      window.location.href = "/login";
    }
    setLoading(false);
  }

  return (
    <Card 
      className={cn(
        "flex flex-col h-full border-2 transition-all hover:scale-[1.02] rounded-[2.5rem] overflow-hidden shadow-2xl",
        plan.popular 
          ? "bg-primary text-primary-foreground border-primary shadow-primary/20" 
          : "bg-card border-border shadow-sm"
      )}
    >
      <CardHeader className="p-10 pb-6">
        {plan.popular && (
          <span className="self-start px-4 py-1.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
            Most Popular
          </span>
        )}
        <CardTitle className={cn("text-3xl font-black uppercase tracking-tighter", plan.popular ? "text-white" : "text-foreground")}>
          {plan.name}
        </CardTitle>
        <div className="flex items-baseline gap-1 mt-6">
          <span className={cn("text-5xl font-black tracking-tighter", plan.popular ? "text-white" : "text-foreground")}>{plan.price}</span>
          <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-60", plan.popular ? "text-white" : "text-muted-foreground")}>
            /{plan.period}
          </span>
        </div>
        <CardDescription className={cn("mt-6 text-sm font-medium leading-relaxed", plan.popular ? "text-white/80" : "text-muted-foreground")}>
          {plan.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-10 pb-10 flex-1">
        <ul className="space-y-4">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-4 text-xs font-black uppercase tracking-tight">
              <div className={cn("rounded-lg p-1 mt-0.5 shrink-0 transition-colors", plan.popular ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                 <Check className="size-3" strokeWidth={4} />
              </div>
              <span className={cn("leading-tight", plan.popular ? "text-white" : "text-foreground/80")}>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="p-10 pt-0">
        <Button 
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          size="lg"
          className={cn(
            "w-full h-16 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg",
            plan.popular 
              ? "bg-white text-primary hover:bg-white/90 shadow-white/10" 
              : "bg-foreground text-background hover:bg-foreground/90 shadow-foreground/10"
          )}
        >
          {loading ? "Syncing Node..." : "Initiate Protocol"}
        </Button>
      </CardFooter>
    </Card>
  );
}
