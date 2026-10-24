import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAgentBySlug } from "@/lib/store";
import {
  getStripe,
  isStripeConfigured,
  buildSplitMetadata,
  getCreatorStripeAccountId,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout  { slug, kind: "rent" | "clone" }
 *
 * Creates a real Stripe Checkout Session (test mode when the configured key
 * is a test key) for one of the two money rails:
 *   rent  -> one run of the agent, priced at agent.rentPerRun
 *   clone -> the full blueprint, priced at agent.clonePrice
 *
 * Split: the creator keeps 70 percent, the platform 30 percent. When the
 * creator has a Stripe Connect account, the session becomes a destination
 * charge and Stripe settles the split at charge time. Until then the
 * platform collects and the exact split rides on the session metadata as
 * the payout ledger.
 *
 * Honest failure: when STRIPE_SECRET_KEY is not configured this returns
 * 503 { error: "payments_not_configured" }. It never invents a URL.
 */
export async function POST(req: Request) {
  let body: { slug?: unknown; kind?: unknown };
  try {
    body = (await req.json()) as { slug?: unknown; kind?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug : null;
  const kind = body.kind === "rent" || body.kind === "clone" ? body.kind : null;
  if (!slug || !kind) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const agent = await getAgentBySlug(slug);
  if (!agent) {
    return NextResponse.json({ error: "agent_not_found" }, { status: 404 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "payments_not_configured" },
      { status: 503 }
    );
  }
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "payments_not_configured" },
      { status: 503 }
    );
  }

  const price = kind === "rent" ? agent.rentPerRun : agent.clonePrice;
  const amountCents = Math.round(price * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "invalid_price" }, { status: 422 });
  }

  const metadata = buildSplitMetadata(agent, kind, amountCents);
  const origin = new URL(req.url).origin;

  const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData =
    { metadata };

  // Connect branch: once a creator has a connected account, settle the
  // 70/30 split inside Stripe at charge time. The platform's 30 percent
  // becomes the application fee; the creator's 70 percent transfers to
  // their account automatically.
  const destination = getCreatorStripeAccountId(agent);
  if (destination) {
    paymentIntentData.application_fee_amount = Number(
      metadata.platform_share_cents
    );
    paymentIntentData.transfer_data = { destination };
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: agent.currency.toLowerCase(),
            unit_amount: amountCents,
            product_data: {
              name:
                kind === "rent"
                  ? `${agent.name} — one run (rent)`
                  : `${agent.name} — clone license`,
              description:
                kind === "rent"
                  ? `One hosted run of ${agent.name} by ${agent.creatorDisplayName}. Creator keeps 70 percent.`
                  : `The full ${agent.name} blueprint: system prompt, tool wiring, connector config, and eval notes. Creator keeps 70 percent.`,
            },
          },
        },
      ],
      metadata,
      payment_intent_data: paymentIntentData,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/agents/${agent.slug}?checkout=cancelled`,
    });
  } catch {
    return NextResponse.json(
      { error: "checkout_unavailable" },
      { status: 502 }
    );
  }

  if (!session.url) {
    return NextResponse.json(
      { error: "checkout_unavailable" },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: session.url });
}
