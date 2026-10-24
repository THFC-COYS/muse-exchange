/**
 * Unified data access for Muse Exchange M2.
 *
 * Every page reads through this module. When DATABASE_URL is set and the
 * database is reachable AND has agents, reads come from Postgres. Otherwise
 * everything falls back to the M1 seed data in lib/seed.ts, so the site
 * always renders, including `next build` with no database configured.
 */
import type { Agent, Creator, Review } from "@prisma/client";
import { prisma, dbConfigured } from "./db";
import {
  agents as seedAgents,
  creators as seedCreators,
  getAgentBySlug as seedGetAgent,
  getAgentsByCreator as seedAgentsByCreator,
  getCreatorByHandle as seedGetCreator,
  creatorStats as seedCreatorStats,
  type SeedAgent,
} from "./seed";
import type { ManifestSource } from "./manifest";

/* ------------------------------ shapes ------------------------------ */

export interface StoreReview {
  id: string;
  author: string;
  authorHandle: string;
  rating: number;
  date: string;
  text: string;
}

export interface StoreAgent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  version: string;
  creator: string;
  creatorDisplayName: string;
  systemPrompt: string;
  requiredTools: string[];
  requiredConnectors: string[];
  rentPerRun: number;
  clonePrice: number;
  currency: string;
  demoUrl?: string;
  evalNotes?: string;
  rating: number;
  ratingCount: number;
  runCount: number;
  cloneCount: number;
  followerCount: number;
  reviews: StoreReview[];
  createdAt: string;
}

export interface StoreCreator {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  location: string | null;
  joined: string;
  specialties: string[];
  agentCount: number;
  totalRuns: number;
  totalClones: number;
  avgRating: number;
  totalFollowers: number;
  /** Estimated lifetime earnings: 70% of rent revenue + 90% of clone revenue. */
  estimatedEarnings: number;
}

/* --------------------------- mapping -------------------------------- */

type AgentWithRelations = Agent & {
  creator: Creator;
  reviews: (Review & { author: Creator })[];
};

function mapAgent(a: AgentWithRelations): StoreAgent {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    tagline: a.tagline,
    description: a.description,
    category: a.category,
    version: a.version,
    creator: a.creator.handle,
    creatorDisplayName: a.creator.displayName,
    systemPrompt: a.systemPrompt,
    requiredTools: [...a.requiredTools],
    requiredConnectors: [...a.requiredConnectors],
    rentPerRun: Number(a.rentPerRun),
    clonePrice: Number(a.clonePrice),
    currency: a.currency,
    demoUrl: a.demoUrl ?? undefined,
    evalNotes: a.evalNotes ?? undefined,
    rating: Number(a.rating),
    ratingCount: a.ratingCount,
    runCount: a.runCount,
    cloneCount: a.cloneCount,
    followerCount: a.followerCount,
    reviews: a.reviews.map((r) => ({
      id: r.id,
      author: r.author.displayName,
      authorHandle: r.author.handle,
      rating: r.rating,
      date: r.createdAt.toISOString().slice(0, 10),
      text: r.text,
    })),
    createdAt: a.createdAt.toISOString(),
  };
}

function mapSeedAgent(a: SeedAgent): StoreAgent {
  const creator = seedGetCreator(a.creator);
  return {
    id: `seed-${a.slug}`,
    slug: a.slug,
    name: a.name,
    tagline: a.tagline,
    description: a.description,
    category: a.category,
    version: a.version,
    creator: a.creator,
    creatorDisplayName: creator?.displayName ?? a.creator,
    systemPrompt: a.systemPrompt,
    requiredTools: [...a.requiredTools],
    requiredConnectors: [...a.requiredConnectors],
    rentPerRun: a.pricing.rentPerRun,
    clonePrice: a.pricing.clonePrice,
    currency: a.pricing.currency,
    demoUrl: a.demoUrl,
    evalNotes: a.evalNotes,
    rating: a.rating,
    ratingCount: a.ratingCount,
    runCount: a.runCount,
    cloneCount: a.cloneCount,
    followerCount: a.followerCount,
    reviews: a.reviews.map((r) => ({
      id: `seed-${a.slug}-${r.author}-${r.date}`,
      author: r.author,
      authorHandle: r.author,
      rating: r.rating,
      date: r.date,
      text: r.text,
    })),
    createdAt: "2026-06-01T00:00:00.000Z",
  };
}

function creatorStatsFromAgents(list: StoreAgent[]) {
  const totalRuns = list.reduce((n, a) => n + a.runCount, 0);
  const totalClones = list.reduce((n, a) => n + a.cloneCount, 0);
  const totalFollowers = list.reduce((n, a) => n + a.followerCount, 0);
  const ratingWeight = list.reduce((n, a) => n + a.ratingCount, 0);
  const avgRating =
    ratingWeight === 0
      ? 0
      : list.reduce((n, a) => n + a.rating * a.ratingCount, 0) / ratingWeight;
  const estimatedEarnings = list.reduce(
    (n, a) => n + a.runCount * a.rentPerRun * 0.7 + a.cloneCount * a.clonePrice * 0.9,
    0
  );
  return {
    agentCount: list.length,
    totalRuns,
    totalClones,
    totalFollowers,
    avgRating: Math.round(avgRating * 10) / 10,
    estimatedEarnings: Math.round(estimatedEarnings * 100) / 100,
  };
}

function mapSeedCreator(handle: string): StoreCreator | null {
  const c = seedGetCreator(handle);
  if (!c) return null;
  const stats = seedCreatorStats(c.handle);
  const list = seedAgentsByCreator(c.handle).map(mapSeedAgent);
  const full = creatorStatsFromAgents(list);
  return {
    id: `seed-${c.handle}`,
    handle: c.handle,
    displayName: c.displayName,
    bio: c.bio,
    location: c.location,
    joined: c.joined,
    specialties: [...c.specialties],
    agentCount: stats.agentCount,
    totalRuns: stats.totalRuns,
    totalClones: stats.totalClones,
    avgRating: stats.avgRating,
    totalFollowers: stats.totalFollowers,
    estimatedEarnings: full.estimatedEarnings,
  };
}

/* --------------------------- queries -------------------------------- */

async function dbListAgents(): Promise<StoreAgent[]> {
  const rows = await prisma.agent.findMany({
    include: {
      creator: true,
      reviews: { include: { author: true }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapAgent);
}

/** Run the DB query, falling back to seed data on any failure or empty DB. */
async function withFallback<T>(
  dbQuery: () => Promise<T>,
  seedValue: () => T | Promise<T>,
  useSeedWhenEmpty?: (dbResult: T) => boolean
): Promise<T> {
  if (!dbConfigured()) return seedValue();
  try {
    const result = await dbQuery();
    if (useSeedWhenEmpty && useSeedWhenEmpty(result)) return seedValue();
    return result;
  } catch {
    return seedValue();
  }
}

export function listSeedAgents(): StoreAgent[] {
  return seedAgents.map(mapSeedAgent);
}

export async function listAgents(): Promise<StoreAgent[]> {
  return withFallback(dbListAgents, listSeedAgents, (rows) => rows.length === 0);
}

export async function getAgentBySlug(slug: string): Promise<StoreAgent | null> {
  if (!dbConfigured()) {
    const a = seedGetAgent(slug);
    return a ? mapSeedAgent(a) : null;
  }
  try {
    const count = await prisma.agent.count();
    if (count === 0) {
      const a = seedGetAgent(slug);
      return a ? mapSeedAgent(a) : null;
    }
    const row = await prisma.agent.findUnique({
      where: { slug },
      include: {
        creator: true,
        reviews: { include: { author: true }, orderBy: { createdAt: "desc" } },
      },
    });
    return row ? mapAgent(row) : null;
  } catch {
    const a = seedGetAgent(slug);
    return a ? mapSeedAgent(a) : null;
  }
}

export async function getAgentsByCreator(handle: string): Promise<StoreAgent[]> {
  const all = await listAgents();
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  return all.filter((a) => a.creator.toLowerCase() === normalized.toLowerCase());
}

function normalizeHandle(handle: string): string {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

export async function getCreatorByHandle(handle: string): Promise<StoreCreator | null> {
  const normalized = normalizeHandle(handle);
  if (!dbConfigured()) return mapSeedCreator(normalized);
  try {
    const count = await prisma.agent.count();
    if (count === 0) return mapSeedCreator(normalized);
    const row = await prisma.creator.findUnique({
      where: { handle: normalized },
      include: {
        agents: {
          include: {
            creator: true,
            reviews: { include: { author: true } },
          },
        },
      },
    });
    if (!row) return null;
    const agents = row.agents.map(mapAgent);
    const stats = creatorStatsFromAgents(agents);
    return {
      id: row.id,
      handle: row.handle,
      displayName: row.displayName,
      bio: row.bio,
      location: row.location,
      joined: row.createdAt.toISOString().slice(0, 10),
      specialties: [],
      ...stats,
    };
  } catch {
    return mapSeedCreator(normalized);
  }
}

export async function listCreators(): Promise<StoreCreator[]> {
  const agents = await listAgents();
  const handles = Array.from(new Set(agents.map((a) => a.creator)));
  const out: StoreCreator[] = [];
  for (const h of handles) {
    const c = await getCreatorByHandle(h);
    if (c) out.push(c);
  }
  return out;
}

/* --------------------------- helpers -------------------------------- */

/** Score used for the Trending leaderboard. */
export function trendingScore(a: {
  runCount: number;
  cloneCount: number;
  followerCount: number;
}): number {
  return a.runCount * 1 + a.cloneCount * 25 + a.followerCount * 3;
}

/** Convert a store agent to the manifest export source shape. */
export function toManifestSource(a: StoreAgent): ManifestSource {
  return {
    name: a.name,
    slug: a.slug,
    tagline: a.tagline,
    description: a.description,
    category: a.category,
    version: a.version,
    creator: a.creator,
    creatorDisplayName: a.creatorDisplayName,
    systemPrompt: a.systemPrompt,
    requiredTools: a.requiredTools,
    requiredConnectors: a.requiredConnectors,
    rentPerRun: a.rentPerRun,
    clonePrice: a.clonePrice,
    currency: a.currency,
    demoUrl: a.demoUrl,
    evalNotes: a.evalNotes,
  };
}

/** True when the database is the live source (used to gate write UI). */
export async function isDatabaseLive(): Promise<boolean> {
  if (!dbConfigured()) return false;
  try {
    await prisma.agent.count();
    return true;
  } catch {
    return false;
  }
}

export { seedCreators };
