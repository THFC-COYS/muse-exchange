import type { StoreAgent } from "@/lib/store";
import { formatMoney } from "@/lib/seed";
import CheckoutButton from "./CheckoutButton";

/**
 * The two money rails, side by side. Both buttons open a real Stripe
 * Checkout Session via /api/checkout. Creators keep 70 percent of every
 * sale; the split is recorded on the session and, once a creator has a
 * Stripe Connect account, settled by Stripe at charge time.
 * Clone buyers get the full blueprint; derivatives pay 10 percent back to
 * the original creator.
 */
export default function PricingCard({ agent }: { agent: StoreAgent }) {
  return (
    <div className="card p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Get this agent
      </p>

      <div className="mt-4 rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-bold">Rent it</p>
          <p className="text-2xl font-black">
            {formatMoney(agent.rentPerRun, agent.currency)}
            <span className="text-sm font-medium text-zinc-400">/run</span>
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          One task, one run, one small fee. The creator keeps 70 percent of
          every rent.
        </p>
        <div className="mt-4">
          <CheckoutButton
            slug={agent.slug}
            kind="rent"
            label="Run it now"
            className="w-full rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-cyan-300"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-violet-400/25 bg-violet-400/5 p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-bold">Clone it</p>
          <p className="text-2xl font-black">
            {formatMoney(agent.clonePrice, agent.currency)}
            <span className="text-sm font-medium text-zinc-400"> once</span>
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          The full blueprint: system prompt, tool wiring, connector config,
          and eval notes. Yours to customize. Derivatives pay 10 percent back
          to the original creator.
        </p>
        <div className="mt-4">
          <CheckoutButton
            slug={agent.slug}
            kind="clone"
            label="Clone the blueprint"
            className="w-full rounded-full bg-violet-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-400"
          />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Secure checkout via Stripe, in test mode. Every sale splits 70/30:
        70 percent to the creator, 30 percent to Muse Exchange.
      </p>
    </div>
  );
}
