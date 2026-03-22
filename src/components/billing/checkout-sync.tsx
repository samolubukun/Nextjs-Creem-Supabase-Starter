"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function CheckoutSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const polling = useRef(false);
  const [_status, setStatus] = useState<"idle" | "waiting" | "done">("idle");

  useEffect(() => {
    if (polling.current) return;
    const checkout = searchParams.get("checkout");
    const sync = searchParams.get("sync");

    if (checkout !== "success" && sync !== "success") return;

    polling.current = true;
    setStatus("waiting");

    const timer = setTimeout(() => {
      // Clean up URL parameters
      router.replace("/dashboard");
      router.refresh();
      setStatus("done");
      polling.current = false;
    }, 4000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  // This component handles background synchronization logic
  // and does not render any visible UI to avoid layout shifts.
  return null;
}
