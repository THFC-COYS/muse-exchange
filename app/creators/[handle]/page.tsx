import Link from "next/link";
import { notFound } from "next/navigation";
import AgentCard from "@/components/AgentCard";
import {
  creators,
  creatorStats,
  getAgentsByCreator,
  getCreatorByHandle,
  formatCompact,
} from "@/lib/seed";

export function generateStaticParams() {
  return creators.map((c) => ({ handle: c.handle.slice(1) }));
}

export default function CreatorPage({
  params,
}: {
  params: { handle: string };
}) {
  const creator = getCreatorByHandle(params.handle);
  if (!creator) notFound();

  const stats = creatorStats(creator.handle);
  const list = getAgentsByCreator(creator.handle);

  const cards = [
    { v: String(stats.agentCount), l: "agents published" },
    { v: formatCompact(stats.totalRuns), l: "total runs" },
    { v: stats.avgRating.toFixed(1), l: "average rating" },
    { v: formatCompact(stats.totalFollowers), l: "followers" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm text-zinc-500">
        <Link href="/directory" className="transition hover:text-white">
          Directory
        </Link>{" "}
        / <span className="text-zinc-300">Creators</span>
      </p>

      <div className="card mt-8 p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-3xl font-black text-white">
            {creator.displayName.charAt(0)}
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {creator.displayName}
            </h1>
            <p className="mt-1 font-semibold text-cyan-300">{creator.handle}</p>
            <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">
              {creator.bio}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {creator.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              {creator.location} · publishing since {creator.joined}
            </p>
          </div>
          <button
            type="button"
            title="Follow is in test mode"
            className="shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-zinc-200"
          >
            Follow
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.l} className="text-center">
              <p className="text-3xl font-black">{c.v}</p>
              <p className="mt-1 text-xs text-zinc-500">{c.l}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mt-14 text-2xl font-black tracking-tight">
        Agents by {creator.handle}
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <AgentCard key={a.slug} agent={a} />
        ))}
      </div>
    </div>
  );
}
