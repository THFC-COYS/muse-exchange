import Link from "next/link";
import { notFound } from "next/navigation";
import AgentCard from "@/components/AgentCard";
import {
  getAgentsByCreator,
  getCreatorByHandle,
  isDatabaseLive,
} from "@/lib/store";
import { formatCompact, formatMoney } from "@/lib/seed";
import { getGuestHandle } from "@/lib/identity";
import { FollowCreatorButton } from "./CreatorInteractions";
import { creatorFollowStatus } from "@/app/agents/[slug]/actions";

export const dynamic = "force-dynamic";

export default async function CreatorPage({
  params,
}: {
  params: { handle: string };
}) {
  const creator = await getCreatorByHandle(params.handle);
  if (!creator) notFound();

  const dbLive = await isDatabaseLive();
  let guestHandle: string | null = null;
  try {
    guestHandle = await getGuestHandle();
  } catch {
    guestHandle = null;
  }
  const follow = await creatorFollowStatus(creator.handle, guestHandle);

  const list = await getAgentsByCreator(creator.handle);

  const cards = [
    { v: String(creator.agentCount), l: "agents published" },
    { v: formatCompact(creator.totalRuns), l: "total runs" },
    { v: creator.avgRating.toFixed(1), l: "average rating" },
    { v: formatCompact(creator.totalFollowers), l: "followers" },
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
              {creator.bio || "Building on the Exchange."}
            </p>
            {creator.specialties.length > 0 && (
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
            )}
            <p className="mt-4 text-xs text-zinc-500">
              {creator.location ? `${creator.location} · ` : ""}publishing
              since {creator.joined}
            </p>
          </div>
          <FollowCreatorButton
            handle={creator.handle}
            initialFollowing={follow.following}
            initialCount={follow.count}
            dbLive={dbLive}
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.l} className="text-center">
              <p className="text-3xl font-black">{c.v}</p>
              <p className="mt-1 text-xs text-zinc-500">{c.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Estimated earnings
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-300">
              {formatMoney(creator.estimatedEarnings)}
            </p>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-zinc-500">
            70% of rent revenue plus 90% of clone revenue across all agents.
            Reputation is earned from community ratings and reviews, no
            paid placement, ever.
          </p>
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
      {list.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">
          No agents published yet.
        </p>
      )}
    </div>
  );
}
