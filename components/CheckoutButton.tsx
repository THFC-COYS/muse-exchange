"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Real checkout trigger for one money rail. POSTs to /api/checkout and
 * redirects the browser to the Stripe Checkout Session it returns.
 *
 * When payments are not configured (HTTP 503) it says so plainly and
 * points at the sample run instead of failing silently. It never
 * fabricates a checkout or a success state.
 */
export default function CheckoutButton({
  slug,
  kind,
  label,
  className,
}: {
  slug: string;
  kind: "rent" | "clone";
  label: string;
  className: string;
}) {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<"not_configured" | "failed" | null>(
    null
  );

  async function startCheckout() {
    setPending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind }),
      });
      if (res.status === 503) {
        setNotice("not_configured");
        setPending(false);
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setNotice("failed");
      setPending(false);
    } catch {
      setNotice("failed");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={pending}
        className={`${className} disabled:cursor-wait disabled:opacity-60`}
      >
        {pending ? "Opening secure checkout…" : label}
      </button>
      {notice === "not_configured" && (
        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-left text-xs leading-relaxed text-amber-200">
          Checkout opens as soon as payments are connected. The sample run
          below works right now.{" "}
          <Link
            href={`/agents/${slug}/run`}
            className="font-bold underline underline-offset-2 hover:text-amber-100"
          >
            Try the sample run
          </Link>
        </p>
      )}
      {notice === "failed" && (
        <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-left text-xs leading-relaxed text-red-200">
          Checkout could not be opened. Nothing was charged. Please try
          again in a moment.
        </p>
      )}
    </div>
  );
}
