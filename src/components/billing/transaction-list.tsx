"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, ArrowLeft, ArrowRight, Zap, Clock } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  displayAmount: string;
  status: string;
  created_at: string;
  description: string;
  planType: string;
}

export function TransactionList() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page, searchParams]);

  async function fetchTransactions() {
    setLoading(true);
    const res = await fetch(`/api/transactions?page=${page}`);
    const data = await res.json();
    setTransactions(data.transactions ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-primary">Scanning Ledger...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 px-8">
        <Clock className="size-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
        <p className="text-sm font-black uppercase tracking-tight text-muted-foreground">No transactions recorded in the system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b bg-background dark:bg-secondary/50">
              <th className="px-8 py-4">Transaction Descriptor</th>
              <th className="px-8 py-4 text-right">Amount</th>
              <th className="px-8 py-4">Plan Type</th>
              <th className="px-8 py-4">Time Entry</th>
              <th className="px-8 py-4">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => (
              <tr key={tx.id} className="group hover:bg-secondary/20 transition-colors">
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <Zap className="size-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tight text-foreground">{tx.description || (tx.amount > 0 ? "Resource Induction" : "System Expenditure")}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={cn(
                    "text-lg font-black tracking-tighter", 
                    (tx.amount > 0 || tx.amount === -1) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                       {tx.amount > 0 ? "+" : ""}{tx.displayAmount}
                    </span>
                </td>
                <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">
                  <span className="px-3 py-1 bg-secondary rounded-full border border-border text-foreground">
                    {tx.planType}
                  </span>
                </td>
                <td className="px-8 py-6 text-xs font-medium text-muted-foreground uppercase tracking-tighter">
                  {tx?.created_at ? new Date(tx.created_at).toLocaleString() : "Syncing..."}
                </td>
                <td className="px-8 py-6">
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                      tx.status === "completed"
                        ? "bg-transparent text-emerald-600 border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                        : tx.status === "pending"
                          ? "bg-transparent text-amber-600 border-amber-600 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                          : "bg-secondary text-muted-foreground border-border"
                    )}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-border bg-card">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-6 space-y-4 hover:bg-secondary active:bg-secondary/80 transition-colors">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3">
                <div className="size-8 mt-0.5 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Zap className="size-4" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descriptor</p>
                  <p className="text-xs font-black uppercase leading-tight tracking-tight text-foreground">
                    {tx.description || (tx.amount > 0 ? "Resource Induction" : "System Expenditure")}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</p>
                <p className={cn(
                  "text-lg font-black tracking-tighter leading-none", 
                  (tx.amount > 0 || tx.amount === -1) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {tx.amount > 0 ? "+" : ""}{tx.displayAmount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">State</p>
                  <span
                    className={cn(
                      "inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                      tx.status === "completed"
                        ? "bg-transparent text-emerald-600 border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                        : tx.status === "pending"
                          ? "bg-transparent text-amber-600 border-amber-600 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                          : "bg-secondary text-muted-foreground border-border"
                    )}
                  >
                    {tx.status}
                  </span>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Plan</p>
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-secondary rounded-full border border-border text-foreground">
                    {tx.planType}
                  </span>
               </div>
            </div>
            <div className="pt-2 text-right">
               <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  {tx?.created_at ? new Date(tx.created_at).toLocaleString() : "Syncing..."}
               </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-8 border-t border-border bg-background dark:bg-secondary/30">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Page {page}</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-xl font-black uppercase tracking-tighter text-[10px] h-9 border-2"
          >
            <ArrowLeft className="size-3 mr-2" /> Previous Log
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={transactions.length < 20}
            className="rounded-xl font-black uppercase tracking-tighter text-[10px] h-9 border-2"
          >
            Next Log <ArrowRight className="size-3 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
