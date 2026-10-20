import Link from "next/link";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import ConfirmEntitlement from "./ConfirmEntitlement";

export const dynamic = "force-dynamic";

function centsToMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <div className="card p-8">{children}</div>
    </div>
  );
}

/**
 * Landing page after Stripe Checkout.
 *
 * The purchase is confirmed ONLY by retrieving the Checkout Session from
 * Stripe server-side and checking payment_status === "paid". Every other
 * situation (no session id, unknown session, unpaid session, payments not
 * configured) renders a plain "we could not verify this payment" message.
 * This page never fakes a confirmation.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <Shell>
        <h1 className="text-2xl font-black tracking-tight">
          We could not verify a payment
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          This page confirms purchases by checking a Stripe checkout session,
          and no session was provided. If you just paid, use the link in your
          Stripe receipt, or head back to the directory and start again.
        </p>
        <Link
          href="/directory"
          className="mt-6 inline-block rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:bg-white/5"
        >
          Back to the directory
        </Link>
      </Shell>
    );
  }

  if (!isStripeConfigured()) {
    return (
      <Shell>
        <h1 className="text-2xl font-black tracking-tight">
          We could not verify a payment
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          Payments are not configured on this deployment, so there is no way
          to check this checkout session against Stripe. No purchase can be
          confirmed here until payments are connected.
        </p>
        <Link
          href="/directory"
          className="mt-6 inline-block rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:bg-white/5"
        >
          Back to the directory
        </Link>
      </Shell>
    );
  }

  const stripe = getStripe();
  let session = null;
  if (stripe) {
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
      session = null;
    }
  }

  if (!session) {
    return (
      <Shell>
        <h1 className="text-2xl font-black tracking-tight">
          We could not verify a payment
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          Stripe has no checkout session matching this link, so no purchase
          can be confirmed. If you believe you were charged, check your card
          statement and Stripe receipt first, then contact the creator.
        </p>
        <Link
          href="/directory"
          className="mt-6 inline-block rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:bg-white/5"
        >
          Back to the directory
        </Link>
      </Shell>
    );
  }

  if (session.payment_status !== "paid") {
    return (
      <Shell>
        <h1 className="text-2xl font-black tracking-tight">
          This checkout is not paid yet
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          Stripe reports this session as{" "}
          <span className="font-semibold text-zinc-200">
            {session.payment_status}
          </span>
          , so nothing has been unlocked. If the payment is still processing,
          this page will confirm it once Stripe marks it paid.
        </p>
        <Link
          href="/directory"
          className="mt-6 inline-block rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:bg-white/5"
        >
          Back to the directory
        </Link>
      </Shell>
    );
  }

  const slug = session.metadata?.agent_slug ?? "";
  const agentName = session.metadata?.agent_name ?? "your agent";
  const kind = session.metadata?.kind === "clone" ? "clone" : "rent";
  const creatorHandle = session.metadata?.creator_handle ?? "the creator";
  const amountCents = Number(session.metadata?.amount_cents ?? 0);
  const creatorShareCents = Number(session.metadata?.creator_share_cents ?? 0);
  const platformShareCents = Number(
    session.metadata?.platform_share_cents ?? 0
  );

  return (
    <Shell>
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
        Payment confirmed by Stripe
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight">
        {kind === "rent"
          ? `You rented ${agentName}`
          : `You cloned ${agentName}`}
      </h1>
      <p className="mt-4 leading-relaxed text-zinc-400">
        {kind === "rent"
          ? "One hosted run is yours. Start it whenever you are ready."
          : "The full blueprint is yours: system prompt, tool wiring, connector config, and eval notes. Download the manifest below."}
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          How your {centsToMoney(amountCents)} splits
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <p className="flex items-baseline justify-between">
            <span className="text-zinc-300">
              Creator ({creatorHandle}) receives 70%
            </span>
            <span className="font-bold text-emerald-300">
              {centsToMoney(creatorShareCents)}
            </span>
          </p>
          <p className="flex items-baseline justify-between">
            <span className="text-zinc-300">Muse Exchange keeps 30%</span>
            <span className="font-bold text-zinc-100">
              {centsToMoney(platformShareCents)}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href={`/agents/${slug}/run`}
          className="block w-full rounded-full bg-cyan-400 px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-cyan-300"
        >
          {kind === "rent" ? "Start your run" : "Open the run console"}
        </Link>
        {kind === "clone" && (
          <>
            <a
              href={`/api/agents/${slug}/manifest?format=markdown`}
              className="block w-full rounded-full bg-violet-500 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-violet-400"
            >
              Download the manifest (Markdown)
            </a>
            <a
              href={`/api/agents/${slug}/manifest`}
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded-full border border-white/20 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/5"
            >
              View the manifest (JSON)
            </a>
          </>
        )}
        <Link
          href={`/agents/${slug}`}
          className="block w-full rounded-full border border-white/20 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/5"
        >
          Back to the listing
        </Link>
      </div>

      <ConfirmEntitlement sessionId={sessionId} />
    </Shell>
  );
}
