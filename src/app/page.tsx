"use client";

import * as React from 'react';
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Bell, 
  CreditCard, 
  Database, 
  Rocket, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Globe,
  Lock,
  BarChart3,
  Cpu,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { LandingHeader } from "@/components/layout/landing-header";
import { LandingFooter } from "@/components/layout/landing-footer";
import { 
  FADE_IN_UP, 
  SCALE_IN, 
  LOGO_FLOAT, 
  BAR_FILL,
  STAGGER_CONTAINER 
} from "@/lib/animations";
import { CommandCard, CommandSectionHeader } from "@/components/shared/command-card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section — Centered Typography */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Background Logo Elements — [MAINTENANCE] Feel free to remove this entire div if you don't want the floating background logos */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {/* Next.js Logo */}
            <motion.div
              variants={LOGO_FLOAT}
              initial="initial"
              animate="animate"
              custom={{ y: [50, 30, 50], duration: 4 }}
              className="absolute top-[8%] left-[2%] md:left-[8%] w-16 md:w-32"
            >
              <img src="/Next.js.png" alt="" className="w-full h-auto opacity-80" style={{ filter: "var(--logo-invert)" }} />
            </motion.div>

            {/* Creem Logo (Center) */}
            <motion.div
              variants={LOGO_FLOAT}
              initial="initial"
              animate="animate"
              custom={{ y: [-50, -30, -50], duration: 6, delay: 0.2 }}
              className="absolute top-[4%] md:top-[6%] left-1/2 -translate-x-1/2 w-16 md:w-32 lg:w-40"
            >
              <img src="/creem.png" alt="" className="w-full h-auto" style={{ filter: "var(--logo-invert)" }} />
            </motion.div>

            {/* Supabase Logo (Right) */}
            <motion.div
              variants={LOGO_FLOAT}
              initial="initial"
              animate="animate"
              custom={{ y: [-20, 0, -20], duration: 5, delay: 0.4 }}
              className="absolute top-[12%] right-[2%] md:right-[10%] w-14 md:w-36 blur-[0.5px]"
            >
              <img src="/supabase.png" alt="" className="w-full h-auto opacity-90" />
            </motion.div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center relative z-10">
            <motion.div
              variants={FADE_IN_UP}
              initial="initial"
              animate="animate"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-foreground dark:text-primary text-xs font-black uppercase tracking-widest border border-primary/20 mb-8">
                <Zap className="size-3 fill-primary text-primary" />
                nextjs x creem x supabase
              </span>
              <h1 className="text-6xl md:text-9xl font-black tracking-[calc(-0.04em)] leading-[0.85] mb-8 uppercase">
                <span className="bg-gradient-to-b from-foreground via-foreground to-primary bg-clip-text text-transparent">Ship Your</span> <br />
                <span className="fiery-text-effect italic">SAAS.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-tight">
                A premium command-center SAAS with auth, database, and global payments. 
                Built for builders who value <span className="text-orange-900 dark:text-primary font-extrabold uppercase tracking-tight">speed and design.</span>
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="h-16 px-12 text-lg rounded-full">
                  <Link href="/signup">
                    Start Building <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" className="h-16 px-12 text-lg bg-foreground text-background hover:bg-muted rounded-full transition-colors">
                  <a href="https://github.com/samuel-olubukun/Nextjs-Creem-Starter" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Github className="size-5 mr-2" strokeWidth={2.5} /> Github
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Hero Visual — Command Center */}
            <CommandCard glow className="mt-20 max-w-5xl mx-auto border-4 md:border-8 border-slate-900 !rounded-[1.5rem] md:!rounded-[2.5rem]">
              <div className="bg-slate-900/50 backdrop-blur-3xl flex flex-col items-stretch h-full">
                <div className="h-8 md:h-10 flex items-center px-4 md:px-6 gap-2 border-b border-white/5 bg-white/5">
                  <div className="flex gap-1.5">
                    <div className="size-1.5 md:size-2.5 rounded-full bg-red-500/50" />
                    <div className="size-1.5 md:size-2.5 rounded-full bg-amber-500/50" />
                    <div className="size-1.5 md:size-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="ml-2 md:ml-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/30 truncate">system_v1.0.0 — active</div>
                </div>
                
                <div className="p-4 md:p-10 grid gap-4 md:gap-6 md:grid-cols-2 text-left">
                  <div className="space-y-4 md:space-y-6">
                    <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary">Revenue Outflow</span>
                          <div className="text-2xl md:text-3xl font-black text-white">{formatCurrency(4291000)}</div>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">+12.5%</div>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            variants={BAR_FILL}
                            initial="initial"
                            whileInView="whileInView"
                            custom="85%"
                            className="h-full bg-primary" 
                          />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10">
                          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 md:mb-2">Active Users</div>
                          <div className="text-lg md:text-xl font-black text-white">2,841</div>
                      </div>
                      <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10">
                          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 md:mb-2">Uptime</div>
                          <div className="text-lg md:text-xl font-black text-emerald-400">99.9%</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-slate-900 border border-white/10 flex flex-col">
                      <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <div className="size-1.5 md:size-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/60">Live Event Feed</span>
                      </div>
                      <div className="space-y-2 md:space-y-4 flex-1">
                        {[
                          { label: "checkout.completed", time: "2m ago", value: formatCurrency(7900) },
                          { label: "subscription.active", time: "5m ago", value: "user_912" },
                          { label: "refund.requested", time: "12m ago", value: `-${formatCurrency(1000)}` },
                          { label: "license.activated", time: "21m ago", value: "device_8" },
                        ].map((evt, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] md:text-xs py-1.5 md:py-2 border-b border-white/5 last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                              <div className="flex flex-col">
                                <span className="font-bold text-white uppercase tracking-tighter">{evt.label}</span>
                                <span className="text-[8px] md:text-[10px] text-white/30">{evt.time}</span>
                              </div>
                              <span className="font-black text-primary font-mono">{evt.value}</span>
                          </div>
                        ))}
                      </div>
                  </div>
                </div>
              </div>
            </CommandCard>
          </div>
        </section>

        {/* Feature Grid — Centered Text */}
        <section className="py-32 bg-secondary/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center mb-20 gap-8 max-w-3xl mx-auto">
              <div>
                <span className="text-xs font-black text-primary uppercase tracking-widest mb-4 block">Features</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-none uppercase">
                  THE NEW <br /> STANDARD.
                </h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-md font-medium">
                We've handled the boring stuff so you can focus on building what matters.
              </p>
            </div>

            <motion.div
              variants={STAGGER_CONTAINER}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-12 md:grid-cols-3"
            >
              {primaryFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={FADE_IN_UP}
                  className={cn("flex flex-col", i === 1 && "md:translate-y-12")}
                >
                  <CommandCard glow className="flex-1 !rounded-[2.5rem]">
                    <div className="p-10">
                      <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20 shadow-sm">
                        {f.icon}
                      </div>
                      <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase">{f.title}</h3>
                      <p className="text-muted-foreground font-medium text-lg leading-relaxed">{f.description}</p>
                    </div>
                  </CommandCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing CTA — New Section */}
        <section className="py-24 bg-background border-y border-border">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-8">
              READY TO <br /> <span className="text-primary italic">SHIP?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 font-medium max-w-2xl mx-auto">
              This boilerplate comes with pre-built pricing components and Creem integration. Customize your plans and go live in minutes.
            </p>
            <Button asChild size="lg" className="h-16 px-12 text-lg bg-foreground text-background hover:bg-muted rounded-full w-full md:w-auto transition-colors">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        {/* Grid Section — 6-item Grid */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">
                BUILT ON THE <br /> <span className="text-primary">COMMAND STACK</span>
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {secondaryFeatures.map((f, i) => (
                <CommandCard key={f.title} className="bg-secondary/50 !rounded-3xl hover:bg-slate-900 border-white/5">
                  <div className="p-8">
                    <div className="size-10 rounded-xl bg-background flex items-center justify-center text-foreground mb-6 shadow-sm border border-white/5">
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-black tracking-tighter uppercase mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm font-medium">{f.description}</p>
                  </div>
                </CommandCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — Immersive Gradient */}
        <section className="py-24 px-4 md:px-6">
          <Card className="max-w-7xl mx-auto overflow-hidden border border-border bg-[#020617] relative rounded-[3rem]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent" />
            <CardContent className="p-8 md:p-32 text-center relative z-10 box-border">
              <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85] mb-8">
                READY TO <br /> <span className="text-primary italic">COMMAND?</span>
              </h2>
              <p className="text-sm md:text-xl text-slate-400 max-w-xl mx-auto mb-12 font-medium uppercase tracking-wide">
                Join the builders shipping? Use the SAASXCREEM framework.
              </p>
              <Button asChild size="lg" className="h-16 px-12 text-lg bg-white text-black hover:bg-primary transition-colors w-full md:w-auto">
                <Link href="/signup">Get Started Now →</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

const primaryFeatures = [
  {
    icon: <ShieldCheck className="size-8" strokeWidth={2.5} />,
    title: "Secure Auth",
    description: "Enterprise-grade authentication powered by Supabase. Email, OAuth, and magic links out of the box.",
  },
  {
    icon: <CreditCard className="size-8" strokeWidth={2.5} />,
    title: "Global Payments",
    description: "Creem handles all the messy stuff. Tax compliance, subscriptions, and global checkout in minutes.",
  },
  {
    icon: <Database className="size-8" strokeWidth={2.5} />,
    title: "Powerful DB",
    description: "A secure, scaleable Postgres database with Row-Level Security to keep your customer data safe.",
  },
];

const secondaryFeatures = [
  {
    icon: <Bell className="size-5" />,
    title: "Webhooks",
    description: "Real-time sync between payments and your database with verified HMACS.",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "User Dashboard",
    description: "Users can manage their own subscriptions, seats, and billing directly.",
  },
  {
    icon: <Globe className="size-5" />,
    title: "Localization",
    description: "Creem handles global currencies and localized checkout experiences.",
  },
  {
    icon: <Lock className="size-5" />,
    title: "RLS Security",
    description: "Your data is protected by Postgres Row Level Security (RLS) policies.",
  },
  {
    icon: <Cpu className="size-5" />,
    title: "Modern Stack",
    description: "Next.js 16, React 19, and Tailwind 4 for the ultimate developer experience.",
  },
  {
    icon: <Rocket className="size-5" />,
    title: "Fast Deploy",
    description: "One-click deployment to Vercel with all environment variables ready.",
  },
];
