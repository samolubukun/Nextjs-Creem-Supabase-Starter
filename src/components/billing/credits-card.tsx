"use client";

import { Zap } from "lucide-react";
import { isUnlimited } from "@/app/api/credits/helpers";

interface CreditsCardProps {
  balance: number;
}

export function CreditsCard({ balance }: CreditsCardProps) {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="p-6 bg-secondary border border-border rounded-[2.5rem] flex-1 w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <Zap className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Resource Balance
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-foreground">
                {isUnlimited(balance) ? "Unlimited" : balance.toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-4 border-b border-border">
              <span>System Activity</span>
              <span className="text-primary">Last 24 Hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
