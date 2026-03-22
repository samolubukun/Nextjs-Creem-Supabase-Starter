"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PricingSection } from "@/components/billing/pricing-section";
import { LandingFooter } from "@/components/layout/landing-footer";
import { LandingHeader } from "@/components/layout/landing-header";
import { formatCurrency } from "@/lib/currency";

// Creem test product IDs — replace with production IDs before going live
const plans = [
  {
    name: "Starter",
    price: formatCurrency(1000),
    period: "month",
    description: "Essential AI tools to spark your ideas",
    productId: process.env.NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID ?? "prod_starter",
    features: [
      "100 AI credits per month",
      "1 AI Workspace",
      "Basic content generation",
      "Standard voice cloning (1 voice)",
      "Email support",
    ],
  },
  {
    name: "Creator",
    price: formatCurrency(2900),
    period: "month",
    description: "The complete content engine for growing creators",
    productId: process.env.NEXT_PUBLIC_CREEM_PRO_PRODUCT_ID ?? "prod_pro",
    popular: true,
    features: [
      "500 AI credits per month",
      "Unlimited AI Workspaces",
      "Advanced content engine",
      "Custom voice cloning (up to 5)",
      "Automated publishing workflows",
      "Priority API access",
      "Priority support",
    ],
  },
  {
    name: "Professional",
    price: formatCurrency(7900),
    period: "month",
    description: "Maximum power for serious production teams",
    productId: process.env.NEXT_PUBLIC_CREEM_ENTERPRISE_PRODUCT_ID ?? "prod_enterprise",
    features: [
      "2,000 AI credits per month",
      "Everything in Creator",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom AI model fine-tuning",
      "White-labeled workspaces",
      "SSO / SAML",
    ],
  },
  {
    name: "Nova Pro Max",
    price: formatCurrency(300000),
    period: "one-time",
    description: "Lifetime ownership of the world's most powerful content engine",
    productId: process.env.NEXT_PUBLIC_CREEM_PRO_MAX_PRODUCT_ID ?? "prod_W3MrXbD703JLiOAJyL6TD",
    features: [
      "Unlimited AI credits forever",
      "Lifetime access (No subscriptions)",
      "Full source code access",
      "Dedicated 24/7 success manager",
      "Custom integration support",
      "Lifetime feature updates",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 flex flex-col">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 mb-8">
                Pricing Plans
              </span>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.85] mb-8 uppercase">
                CHOOSE YOUR <br />
                <span className="text-primary italic">COMMAND LEVEL.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-tight">
                From solo builders to enterprise teams, we have the power you need to ship faster.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <PricingSection plans={plans} />
          </div>
        </section>

        {/* Footer info */}
        <section className="pb-24 border-t border-border pt-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Link
                  href="/"
                  className="text-2xl font-black tracking-tighter text-foreground uppercase inline-block"
                >
                  SAASXCREEM
                </Link>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-6 text-success" />
                  <h3 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                    Enterprise Grade Security
                  </h3>
                </div>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">
                  All payments are processed securely by{" "}
                  <a
                    href="https://creem.io"
                    className="text-primary font-black hover:underline uppercase tracking-tight"
                  >
                    Creem
                  </a>
                  . We handle global tax compliance, billing cycles, and subscription management so
                  you don't have to.
                </p>
              </div>
              <div className="flex flex-col gap-6">
                <div className="p-8 bg-card rounded-3xl border border-border">
                  <p className="text-sm font-bold text-foreground italic leading-relaxed">
                    "The developer experience is unmatched. We shipped our MVP in 3 days. The
                    Command Center dashboard gives us visibility we never had before."
                  </p>
                  <span className="text-xs font-black text-primary uppercase mt-6 block tracking-widest">
                    — Early Tech Adopter
                  </span>
                </div>
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    14-Day Free Trial included on all plans
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
