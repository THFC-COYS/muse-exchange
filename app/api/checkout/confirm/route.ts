import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/confirm  { session_id }
 *
 * Called by the success page after a buyer lands back from Stripe. This is
 * the ONLY place the run entitlement is granted: the session is retrieved
 * from Stripe server-side and the cookie is set only when Stripe reports
 * payment_status === "paid". Nothing client-supplied is trusted.
 *
 * The cookie value is `slug:kind`. It is deliberately simple and unsigned:
 * acceptable for test mode while payments run on test keys, and it must be
 * replaced with a signed token (or a DB-backed Run/Clone record, see
 * prisma/schema.prisma) before live keys are used. Noted here so nobody
 * mistakes it for production-grade entitlement.
 */
export async function POST(req: Request) {
  let body: { session_id?: unknown };
  try {
    body = (await req.json()) as { session_id?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const sessionId =
    typeof body.session_id === "string" ? body.session_id : null;
  if (!sessionId) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
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

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "not_paid", payment_status: session.payment_status },
      { status: 402 }
    );
  }

  const slug = session.metadata?.agent_slug;
  const kind = session.metadata?.kind;
  if (!slug || (kind !== "rent" && kind !== "clone")) {
    return NextResponse.json(
      { error: "session_missing_metadata" },
      { status: 422 }
    );
  }

  const res = NextResponse.json({ ok: true, slug, kind });
  res.cookies.set("mx_entitlement", `${slug}:${kind}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
