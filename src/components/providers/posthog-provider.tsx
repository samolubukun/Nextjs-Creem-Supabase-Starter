"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { initPostHog } from "@/lib/posthog";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  const client = useMemo(() => {
    if (typeof window === "undefined") return null;
    return initPostHog();
  }, []);

  useEffect(() => {
    if (client) {
      setIsReady(true);
    }
  }, [client]);

  // If no key is provided, just render children without provider to avoid errors
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  if (!isReady || !client) return <>{children}</>;

  return (
    <PHProvider client={client}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
