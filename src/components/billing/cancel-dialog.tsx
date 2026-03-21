"use client";

import * as React from 'react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CancelDialogProps {
  subscriptionId: string;
  currentPeriodEnd?: string;
}

export function CancelDialog({ subscriptionId, currentPeriodEnd }: CancelDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"scheduled" | "immediate">("scheduled");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/subscriptions/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, mode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Cancel failed");
      setLoading(false);
      return;
    }

    router.refresh();
    setOpen(false);
    setLoading(false);
  }

  if (!open) {
    return (
      <div className="flex justify-center w-full pt-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => setOpen(true)}
          className="w-full max-w-xs h-12 rounded-xl border-dashed border-2 border-destructive-soft/30 text-destructive-soft bg-destructive-soft/5 hover:bg-destructive-soft/10 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          Cancel Subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border-2 border-destructive-soft/20 bg-destructive-soft/5 p-8 space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center gap-4">
         <div className="size-10 rounded-xl bg-destructive-soft text-white flex items-center justify-center shadow-lg">
            <AlertTriangle className="size-5" />
         </div>
         <div className="text-left">
            <p className="text-sm font-black uppercase tracking-tight text-foreground">Cancel Subscription?</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground opacity-70">Confirm your cancellation request</p>
         </div>
      </div>

      <div className="space-y-3">
        <label 
          className={cn(
            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group",
            mode === "scheduled" ? "border-destructive-soft bg-white shadow-md" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
          )}
          onClick={() => setMode("scheduled")}
        >
          <div className="flex items-center gap-3">
             <div className={cn("size-4 rounded-full border-2 flex items-center justify-center transition-all", mode === "scheduled" ? "border-destructive-soft bg-destructive-soft" : "border-slate-300")}>
                {mode === "scheduled" && <div className="size-1.5 rounded-full bg-white" />}
             </div>
             <span className="text-xs font-black uppercase tracking-tight text-foreground">End of Billing Cycle</span>
          </div>
          {currentPeriodEnd && (
             <span className="text-[10px] font-bold text-muted-foreground">{new Date(currentPeriodEnd).toLocaleDateString()}</span>
          )}
        </label>
        
        <label 
          className={cn(
            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group",
            mode === "immediate" ? "border-destructive-soft bg-white shadow-md" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
          )}
          onClick={() => setMode("immediate")}
        >
          <div className="flex items-center gap-3">
             <div className={cn("size-4 rounded-full border-2 flex items-center justify-center transition-all", mode === "immediate" ? "border-destructive-soft bg-destructive-soft" : "border-slate-300")}>
                {mode === "immediate" && <div className="size-1.5 rounded-full bg-white" />}
             </div>
             <span className="text-xs font-black uppercase tracking-tight text-foreground">Immediate Cancellation</span>
          </div>
          <span className="text-[10px] font-bold text-destructive-soft uppercase">Notice</span>
        </label>
      </div>

      {error && (
         <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-tight text-center">
            {error}
         </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 h-12 bg-destructive-soft text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-destructive-soft/90 shadow-lg shadow-destructive-soft/20"
        >
          {loading ? "Processing..." : "Confirm Cancellation"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="flex-1 h-12 text-muted-foreground font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-100"
        >
          Keep Subscription
        </Button>
      </div>
    </div>
  );
}
