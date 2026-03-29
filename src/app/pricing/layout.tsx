import type { Metadata } from "next";
import { formatCurrency } from "@/lib/currency";

const plans = [
  {
    name: "Starter",
    price: formatCurrency(1000),
    description: "Essential AI tools to spark your ideas",
  },
  {
    name: "Creator",
    price: formatCurrency(2900),
    description: "The complete content engine for growing creators",
  },
  {
    name: "Professional",
    price: formatCurrency(7900),
    description: "Maximum power for serious production teams",
  },
  {
    name: "Nova Pro Max",
    price: formatCurrency(300000),
    description: "Lifetime ownership of the world's most powerful content engine",
  },
];

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SAASXCREEM Pricing Plans",
    itemListElement: plans.map((plan, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: plan.name,
        description: plan.description,
        offers: {
          "@type": "Offer",
          price: plan.price.replace(/[^0-9.]/g, ""),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${appUrl}/pricing`,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {children}
    </>
  );
}
