import type { SeedAgent } from "@/lib/seed";
import { formatMoney } from "@/lib/seed";

/**
 * The two money rails, side by side. Creators keep 70 percent of every rent.
 * Clone buyers get the full blueprint; derivatives pay 10 percent back to the
 * original creator.
 */
export default function PricingCard({ agent }: { agent: SeedAgent }) {
  const { pricing } = agent;
  return (
    <div className="card p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Get this agent
      </p>

      <div className="mt-4 rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-bold">Rent it</p>
          <p className="text-2xl font-black">
            {formatMoney(pricing.rentPerRun, pricing.currency)}
            <span className="text-sm font-medium text-zinc-400">/run</span>
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          One task, one run, one small fee. The creator keeps 70 percent of
          every rent.
        </p>
        <button
          type="button"
          title="Rent rail is in test mode"
          className="mt-4 w-full rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-cyan-300"
        >
          Run it now
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-violet-400/25 bg-violet-400/5 p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-bold">Clone it</p>
          <p className="text-2xl font-black">
            {formatMoney(pricing.clonePrice, pricing.currency)}
            <span className="text-sm font-medium text-zinc-400"> once</span>
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          The full blueprint: system prompt, tool wiring, connector config,
          and eval notes. Yours to customize. Derivatives pay 10 percent back
          to the original creator.
        </p>
        <button
          type="button"
          title="Clone rail is in test mode"
          className="mt-4 w-full rounded-full bg-violet-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-400"
        >
          Clone the blueprint
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Test mode. Payments via Stripe Connect land with M3.
      </p>
    </div>
  );
}
