"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { SCALE_IN } from "@/lib/animations";

interface CommandCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  animate?: boolean;
}

export function CommandCard({ 
  children, 
  className, 
  glow = false, 
  animate = true,
  ...props 
}: CommandCardProps) {
  if (animate) {
    return (
      <motion.div
        variants={SCALE_IN}
        initial="initial"
        animate="animate"
        className={cn(
          "rounded-[2rem] bg-slate-950 border border-white/10 overflow-hidden relative group",
          glow && "shadow-[0_0_50px_-12px_rgba(var(--primary),0.15)]",
          className
        )}
        {...props}
      >
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        <Card className="bg-transparent border-none shadow-none h-full">
          <CardContent className="p-0 h-full">
            {children}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[2rem] bg-slate-950 border border-white/10 overflow-hidden relative group",
        glow && "shadow-[0_0_50px_-12px_rgba(var(--primary),0.15)]",
        className
      )}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      <Card className="bg-transparent border-none shadow-none h-full">
        <CardContent className="p-0 h-full">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

export function CommandSectionHeader({ 
  title, 
  subtitle, 
  className 
}: { 
  title: string; 
  subtitle?: string; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-2 mb-8", className)}>
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{title}</h4>
      {subtitle && <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">{subtitle}</p>}
    </div>
  );
}
