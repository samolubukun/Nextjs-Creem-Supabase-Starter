"use client";

import * as React from 'react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeatManagerProps {
  subscriptionId: string;
  currentSeats: number;
}

export function SeatManager({ subscriptionId, currentSeats }: SeatManagerProps) {
  const [seats, setSeats] = useState(currentSeats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate() {
    if (seats === currentSeats || seats <= 0) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/subscriptions/update-seats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, units: seats }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Update failed");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-4 p-6 bg-secondary/30 rounded-[2rem] border-2 border-border/50">
      <div className="flex items-center gap-2 mb-2">
         <Users className="size-4 text-primary" />
         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Team Allocation</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center bg-card rounded-2xl border-2 p-1 border-border shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSeats(Math.max(1, seats - 1))}
            className="size-10 rounded-xl text-primary hover:bg-primary/5"
          >
            <Minus className="size-4" />
          </Button>
          <span className="text-xl font-black text-foreground min-w-[3rem] text-center italic">
            {seats}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSeats(seats + 1)}
            className="size-10 rounded-xl text-primary hover:bg-primary/5"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {seats !== currentSeats && (
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 h-12 rounded-xl font-black uppercase tracking-tight shadow-md"
          >
            {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            {loading ? "Processing..." : "Sync Seats"}
          </Button>
        )}
      </div>

      {error && <p className="text-destructive text-[10px] font-black uppercase tracking-tight text-center mt-2">{error}</p>}
      
      {seats !== currentSeats && (
         <p className="text-[10px] font-black uppercase tracking-widest text-primary text-center">
            Note: Billing will be adjusted pro-rata
         </p>
      )}
    </div>
  );
}
