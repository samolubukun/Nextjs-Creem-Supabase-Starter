import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "SAASXCREEM — Next.js + Supabase + Creem Boilerplate",
    template: "%s | SAASXCREEM",
  },
  description:
    "Production-ready SaaS starter with authentication, database, payments, and subscriptions. Built with Next.js, Supabase, and Creem.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "SAASXCREEM",
    title: "SAASXCREEM — Next.js + Supabase + Creem Boilerplate",
    description:
      "Production-ready SaaS starter with authentication, database, payments, and subscriptions.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "SAASXCREEM" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAASXCREEM — Next.js + Supabase + Creem Boilerplate",
    description:
      "Production-ready SaaS starter with authentication, database, payments, and subscriptions.",
    images: ["/opengraph-image"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SAASXCREEM",
    url: appUrl,
    description: "Production-ready SaaS boilerplate with Next.js, Supabase, and Creem",
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SAASXCREEM",
    url: appUrl,
    description:
      "Production-ready SaaS starter with authentication, database, payments, and subscriptions.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${bricolage.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>{children}</PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
