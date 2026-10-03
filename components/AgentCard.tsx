import Link from "next/link";
import type { SeedAgent } from "@/lib/seed";
import { formatCompact, formatMoney } from "@/lib/seed";

export default function AgentCard({ agent }: { agent: SeedAgent }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="card group flex flex-col p-6 transition duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-[0_20px_60px_-20px_rgba(139,92,246,0.35)]"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-300">
          {agent.category}
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold text-amber-300">
          <span aria-hidden>★</span> {agent.rating.toFixed(1)}
          <span className="font-normal text-zinc-500">
            ({formatCompact(agent.ratingCount)})
          </span>
        </span>
      </div>

      <h3 className="mt-4 text-xl font-bold tracking-tight transition group-hover:text-white">
        {agent.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
        {agent.tagline}
      </p>
      <p className="mt-3 text-xs font-medium text-zinc-500">
        by{" "}
        <span className="text-zinc-300">{agent.creator}</span>
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
        <span>
          <span className="font-bold text-zinc-200">
            {formatCompact(agent.runCount)}
          </span>{" "}
          runs
        </span>
        <span>
          <span className="font-bold text-zinc-200">
            {formatCompact(agent.cloneCount)}
          </span>{" "}
          clones
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="text-sm">
          <span className="font-bold text-white">
            {formatMoney(agent.pricing.rentPerRun, agent.pricing.currency)}
          </span>
          <span className="text-zinc-500">/run</span>
        </div>
        <div className="text-sm">
          <span className="font-bold text-white">
            {formatMoney(agent.pricing.clonePrice, agent.pricing.currency)}
          </span>
          <span className="text-zinc-500"> clone</span>
        </div>
      </div>
    </Link>
  );
}
