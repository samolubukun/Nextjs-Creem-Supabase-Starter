"use client";

import * as React from "react";
import { Key, ShieldCheck, ExternalLink, Box } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LicenseCardProps {
  license: any;
}

export function LicenseCard({ license }: LicenseCardProps) {
  return (
    <div className="p-6 md:p-8 bg-card border border-border rounded-[2.5rem] shadow-sm flex flex-col items-center">
      <div className="size-16 rounded-3xl bg-secondary border border-border flex items-center justify-center text-primary mb-6 shadow-inner transition-transform hover:scale-105">
        <Key className="size-8" />
      </div>
      
      <div className="text-center space-y-2 mb-8 w-full">
        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">{license?.product_name || "Enterprise Node"}</h3>
        <div className="flex items-center justify-center gap-2">
           <div className="size-2 rounded-full bg-success" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status: Operational</p>
        </div>
      </div>

      <div className="w-full space-y-4">
         <div className="p-5 bg-secondary/50 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Instance Key</p>
               <ShieldCheck className="size-3 text-success" />
            </div>
            <p className="font-mono text-xs font-bold tracking-tight truncate text-foreground opacity-90">{license?.creem_license_key || license?.license_key || "----"}</p>
         </div>

         <div className="p-5 bg-secondary/50 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Provisioning Date</p>
               <Box className="size-3 text-primary" />
            </div>
            <p className="font-black text-xs uppercase text-foreground">
               {license?.created_at ? new Date(license.created_at).toLocaleDateString() : "Pending Registration"}
            </p>
         </div>
         
         <div className="pt-2">
            <Button variant="outline" className="w-full h-11 rounded-xl border-2 font-black uppercase tracking-tight text-[10px] gap-2 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary">
               <ExternalLink className="size-3" /> System Integration
            </Button>
         </div>
      </div>
    </div>
  );
}
