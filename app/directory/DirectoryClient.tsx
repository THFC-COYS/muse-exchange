"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AgentCard from "@/components/AgentCard";
import { AGENT_CATEGORIES, type AgentCategory } from "@/lib/manifest";
import { trendingScore, type StoreAgent } from "@/lib/store";
import { formatCompact } from "@/lib/seed";

type Sort = "rented" | "rated" | "trending" | "newest";

const SORTS: { id: Sort; label: string }[] = [
  { id: "rented", label: "Most rented" },
  { id: "rated", label: "Top rated" },
  { id: "trending", label: "Trending" },
  { id: "newest", label: "Newest" },
];

const CATEGORY_LABELS: Record<AgentCategory, string> = {
  productivity: "Productivity",
  education: "Education",
  business: "Business",
  marketing: "Marketing",
  engineering: "Engineering",
  lifestyle: "Lifestyle",
};

function Board({
  title,
  rows,
  stat,
}: {
  title: string;
  rows: StoreAgent[];
  stat: (a: StoreAgent) => string;
}) {
  return (
    <div className="card p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
        {title}
      </p>
      <ol className="mt-4 space-y-3">
        {rows.map((a, i) => (
          <li key={a.slug} className="flex items-center gap-3">
            <span className="w-6 shrink-0 text-center font-mono text-sm font-bold text-zinc-500">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/agents/${a.slug}`}
                className="block truncate text-sm font-bold transition hover:text-violet-300"
              >
                {a.name}
              </Link>
              <p className="text-xs text-zinc-500">{a.creator}</p>
            </div>
            <span className="shrink-0 font-mono text-xs text-zinc-400">
              {stat(a)}
            </span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="text-sm text-zinc-500">Nothing here yet.</li>
        )}
      </ol>
    </div>
  );
}

export default function DirectoryClient({
  agents,
  boards,
}: {
  agents: StoreAgent[];
  boards: { rented: StoreAgent[]; rated: StoreAgent[]; trending: StoreAgent[] };
}) {
  const [sort, setSort] = useState<Sort>("rented");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AgentCategory | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = agents.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!q) return true;
      return [a.name, a.tagline, a.description, a.creator, a.slug]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    const sorted = [...filtered];
    if (sort === "rented") sorted.sort((a, b) => b.runCount - a.runCount);
    if (sort === "rated")
      sorted.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
    if (sort === "trending")
      sorted.sort((a, b) => trendingScore(b) - trendingScore(a));
    if (sort === "newest")
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }, [sort, query, category, agents]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        The directory
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Every agent on the Exchange, ranked by the community. Rent one for a
        task, or clone the blueprint and make it yours.
      </p>

      {/* leaderboards */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Board
          title="Most rented"
          rows={boards.rented}
          stat={(a) => `${formatCompact(a.runCount)} runs`}
        />
        <Board
          title="Top rated"
          rows={boards.rated}
          stat={(a) => `★ ${a.rating.toFixed(1)}`}
        />
        <Board
          title="Trending"
          rows={boards.trending}
          stat={(a) => `${formatCompact(a.followerCount)} followers`}
        />
      </div>

      {/* search + filters */}
      <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents, creators, tags..."
          className="w-full rounded-full border border-white/15 bg-panel px-5 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:outline-none lg:max-w-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-full border border-white/15 bg-panel px-5 py-3 text-sm font-bold text-white focus:border-violet-400 focus:outline-none"
          aria-label="Sort agents"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              category === "all"
                ? "bg-white text-ink"
                : "border border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
            }`}
          >
            All
          </button>
          {AGENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                category === c
                  ? "bg-white text-ink"
                  : "border border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        {results.length} {results.length === 1 ? "agent" : "agents"}
        {category !== "all" ? ` in ${CATEGORY_LABELS[category]}` : ""}
        {query.trim() ? ` matching "${query.trim()}"` : ""}
      </p>

      {results.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-xl font-bold">Nothing found</p>
          <p className="mt-2 text-sm text-zinc-400">
            Try a different search, or{" "}
            <Link href="/publish" className="font-bold text-white hover:text-violet-300">
              be the first to publish
            </Link>{" "}
            in this space.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <AgentCard key={a.slug} agent={a} />
          ))}
        </div>
      )}
    </div>
  );
}
