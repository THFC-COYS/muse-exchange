"use client";

import { useMemo, useState } from "react";
import AgentCard from "@/components/AgentCard";
import { AGENT_CATEGORIES, type AgentCategory } from "@/lib/manifest";
import { agents, trendingScore } from "@/lib/seed";

type Tab = "rented" | "rated" | "trending";

const tabs: { id: Tab; label: string }[] = [
  { id: "rented", label: "Most rented" },
  { id: "rated", label: "Top rated" },
  { id: "trending", label: "Trending" },
];

const CATEGORY_LABELS: Record<AgentCategory, string> = {
  education: "Education",
  business: "Business",
  marketing: "Marketing",
  research: "Research",
  productivity: "Productivity",
  finance: "Finance",
};

export default function DirectoryPage() {
  const [tab, setTab] = useState<Tab>("rented");
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
    if (tab === "rented") sorted.sort((a, b) => b.runCount - a.runCount);
    if (tab === "rated")
      sorted.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
    if (tab === "trending")
      sorted.sort((a, b) => trendingScore(b) - trendingScore(a));
    return sorted;
  }, [tab, query, category]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        The directory
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Every agent on the Exchange, ranked by the community. Rent one for a
        task, or clone the blueprint and make it yours.
      </p>

      {/* tabs */}
      <div className="mt-10 flex gap-2 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-bold transition ${
              tab === t.id
                ? "border-b-2 border-violet-400 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* search + categories */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents, creators, tags..."
          className="w-full rounded-full border border-white/15 bg-panel px-5 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400 focus:outline-none lg:max-w-sm"
        />
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
            Try a different search, or be the first to publish in this space.
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
