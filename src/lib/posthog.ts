"use client";

import posthog from "posthog-js";

let posthogClient: typeof posthog | null = null;

export const initPostHog = () => {
  if (posthogClient) return posthogClient;

  try {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") posthog.debug(false);
        },
        autocapture: false,
        capture_pageview: false,
        persistence: "localStorage",
        cross_subdomain_cookie: false,
      });
      posthogClient = posthog;
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("PostHog initialization error:", error);
    }
  }

  return posthogClient;
};
