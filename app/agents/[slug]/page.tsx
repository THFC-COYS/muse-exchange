import Link from "next/link";
import { notFound } from "next/navigation";
import PricingCard from "@/components/PricingCard";
import AgentCard from "@/components/AgentCard";
import {
  agents,
  getAgentBySlug,
  getAgentsByCreator,
  getCreatorByHandle,
  formatCompact,
  formatMoney,
} from "@/lib/seed";

export function generateStaticParams() {
  return agents.map((a) => ({ slug: a.slug }));
}

export default function AgentPage({ params }: { params: { slug: string } }) {
  const agent = getAgentBySlug(params.slug);
  if (!agent) notFound();

  const creator = getCreatorByHandle(agent.creator);
  const siblings = getAgentsByCreator(agent.creator).filter(
    (a) => a.slug !== agent.slug
  );

  const stats = [
    { v: formatCompact(agent.runCount), l: "runs" },
    { v: agent.rating.toFixed(1), l: `rating (${formatCompact(agent.ratingCount)})` },
    { v: formatCompact(agent.cloneCount), l: "clones" },
    { v: formatCompact(agent.followerCount), l: "followers" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm text-zinc-500">
        <Link href="/directory" className="transition hover:text-white">
          Directory
        </Link>{" "}
        / <span className="text-zinc-300">{agent.name}</span>
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-300">
              {agent.category}
            </span>
            <span className="text-xs text-zinc-500">v{agent.version}</span>
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            {agent.name}
          </h1>
          <p className="mt-3 text-xl text-zinc-400">{agent.tagline}</p>
          {creator && (
            <p className="mt-4 text-sm text-zinc-500">
              by{" "}
              <Link
                href={`/creators/${creator.handle.slice(1)}`}
                className="font-semibold text-zinc-200 transition hover:text-white"
              >
                {creator.displayName} ({creator.handle})
              </Link>
            </p>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="card p-4 text-center">
                <p className="text-2xl font-black">{s.v}</p>
                <p className="mt-1 text-xs text-zinc-500">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="card mt-8 p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              About this agent
            </p>
            <p className="mt-4 leading-relaxed text-zinc-300">
              {agent.description}
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Required tools
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.requiredTools.length === 0 ? (
                    <span className="text-sm text-zinc-500">None, runs anywhere.</span>
                  ) : (
                    agent.requiredTools.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-300"
                      >
                        {t}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Required connectors
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.requiredConnectors.length === 0 ? (
                    <span className="text-sm text-zinc-500">None, runs anywhere.</span>
                  ) : (
                    agent.requiredConnectors.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-300"
                      >
                        {c}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {agent.evalNotes && (
              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Eval notes from the creator
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {agent.evalNotes}
                </p>
              </div>
            )}
          </div>

          {/* REVIEWS */}
          <div className="mt-12">
            <h2 className="text-2xl font-black tracking-tight">
              Reviews{" "}
              <span className="text-base font-medium text-zinc-500">
                ({agent.reviews.length})
              </span>
            </h2>
            <div className="mt-6 space-y-4">
              {agent.reviews.map((r) => (
                <div key={r.author + r.date} className="card p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-cyan-300">{r.author}</p>
                    <p className="text-sm text-zinc-500">
                      <span className="font-bold text-amber-300">★ {r.rating}</span>{" "}
                      · {r.date}
                    </p>
                  </div>
                  <p className="mt-3 leading-relaxed text-zinc-300">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <PricingCard agent={agent} />
          {creator && (
            <div className="card p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Creator
              </p>
              <p className="mt-3 text-lg font-bold">{creator.displayName}</p>
              <p className="text-sm text-cyan-300">{creator.handle}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {creator.bio.split(".")[0]}.
              </p>
              <Link
                href={`/creators/${creator.handle.slice(1)}`}
                className="mt-4 inline-block text-sm font-bold text-white transition hover:text-violet-300"
              >
                View profile →
              </Link>
            </div>
          )}
        </div>
      </div>

      {siblings.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-black tracking-tight">
            More from {agent.creator}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((a) => (
              <AgentCard key={a.slug} agent={a} />
            ))}
          </div>
        </div>
      )}

      {/* rent math footnote */}
      <p className="mt-12 text-center text-xs text-zinc-600">
        Renting at {formatMoney(agent.pricing.rentPerRun, agent.pricing.currency)}
        /run sends{" "}
        {formatMoney(agent.pricing.rentPerRun * 0.7, agent.pricing.currency)} to
        the creator, every time.
      </p>
    </div>
  );
}
