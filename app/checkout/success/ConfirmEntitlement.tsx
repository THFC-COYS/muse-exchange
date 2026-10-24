"use client";

import { useEffect, useState } from "react";

/**
 * Asks the server to verify the paid session and set the entitlement
 * cookie (the server re-checks payment_status with Stripe; this component
 * cannot grant anything by itself). Renders only a small status line.
 */
export default function ConfirmEntitlement({
  sessionId,
}: {
  sessionId: string;
}) {
  const [state, setState] = useState<"pending" | "saved" | "failed">(
    "pending"
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (!cancelled) setState(res.ok ? "saved" : "failed");
      } catch {
        if (!cancelled) setState("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state === "pending") {
    return (
      <p className="mt-6 text-center text-xs text-zinc-500">
        Saving your run access on this device…
      </p>
    );
  }
  if (state === "saved") {
    return (
      <p className="mt-6 text-center text-xs text-emerald-300">
        Run access saved on this device. The run page below will recognize
        this purchase.
      </p>
    );
  }
  return (
    <p className="mt-6 text-center text-xs text-amber-300">
      We could not save run access automatically. Your payment still stands;
      keep this page or your Stripe receipt as proof of purchase.
    </p>
  );
}
