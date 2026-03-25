import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare plans and launch your SaaS with built-in subscriptions, billing, and credits.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "SAASXCREEM Pricing",
    description: "Compare plans and launch your SaaS with built-in billing.",
    url: "/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAASXCREEM Pricing",
    description: "Compare plans and launch your SaaS with built-in billing.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
