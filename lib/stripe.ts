/**
 * Stripe wiring for the Muse Exchange money rails (M3).
 *
 * Server-only module. The client is created lazily from STRIPE_SECRET_KEY so
 * builds and seed-mode pages never crash when payments are not configured;
 * callers check isStripeConfigured() first and fail honestly when it is false.
 *
 * Revenue split: creators keep 70 percent of every sale, Muse Exchange
 * keeps 30 percent. Two settlement paths:
 *
 *   1. Stripe Connect (destination charge). When a creator has completed
 *      Connect onboarding and we know their connected account id, the
 *      Checkout Session is created with
 *      payment_intent_data.transfer_data.destination set to that account and
 *      application_fee_amount set to the platform's 30 percent. Stripe then
 *      moves the creator's 70 percent to their account at charge time.
 *
 *   2. Platform collect (today's default). No creator has a connected
 *      account yet, so the platform account collects the full charge and the
 *      exact split is recorded on the Checkout Session metadata
 *      (creator_handle, creator_share_cents, platform_share_cents). The
 *      Payout model in prisma/schema.prisma is where those owed amounts get
 *      materialized once payouts ship; the metadata is the ledger until then.
 *
 * All amounts are integer cents, computed from the agent's dollar pricing.
 */
import Stripe from "stripe";
import type { StoreAgent } from "./store";

let client: Stripe | null = null;

/** True when a Stripe secret key is present in the environment. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Lazily constructed Stripe client, or null when payments are not
 * configured. Never throws for a missing key; callers branch on null.
 */
export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }
  return client;
}

/** Creators keep 70 percent; the platform keeps the remainder. */
export const CREATOR_SHARE_RATE = 0.7;

/** Split an amount in cents into creator (70%) and platform (30%) shares. */
export function splitCents(amountCents: number): {
  creatorShareCents: number;
  platformShareCents: number;
} {
  const creatorShareCents = Math.round(amountCents * CREATOR_SHARE_RATE);
  return {
    creatorShareCents,
    platformShareCents: amountCents - creatorShareCents,
  };
}

/** The metadata recorded on every Checkout Session and Payment Intent. */
export interface CheckoutSplitMetadata {
  [key: string]: string;
  agent_slug: string;
  agent_name: string;
  kind: "rent" | "clone";
  creator_handle: string;
  amount_cents: string;
  creator_share_cents: string;
  platform_share_cents: string;
}

export function buildSplitMetadata(
  agent: StoreAgent,
  kind: "rent" | "clone",
  amountCents: number
): CheckoutSplitMetadata {
  const { creatorShareCents, platformShareCents } = splitCents(amountCents);
  return {
    agent_slug: agent.slug,
    agent_name: agent.name,
    kind,
    creator_handle: agent.creator,
    amount_cents: String(amountCents),
    creator_share_cents: String(creatorShareCents),
    platform_share_cents: String(platformShareCents),
  };
}

/**
 * The creator's Stripe Connect account id, if they have one.
 *
 * Returns null today: Connect onboarding has not shipped, so no creator
 * record carries a connected account id. When onboarding lands, read the
 * id from the creator's record here and the checkout route automatically
 * switches that creator's sales to Connect destination charges.
 */
export function getCreatorStripeAccountId(
  _agent: StoreAgent
): string | null {
  return null;
}
