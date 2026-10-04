"use server";

import { prisma, dbConfigured } from "@/lib/db";
import {
  AGENT_CATEGORIES,
  validateManifest,
  type AgentManifest,
} from "@/lib/manifest";

export interface PublishState {
  ok: boolean;
  errors: string[];
  slug?: string;
}

const INITIAL_STATE: PublishState = { ok: false, errors: [] };

function parseList(v: string): string[] {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || "agent";
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await prisma.agent.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

/**
 * Create an agent listing in Postgres. Validates the full manifest against
 * the open spec on the server, finds or creates the creator, then redirects
 * the client to the new agent page on success.
 */
export async function publishAgent(
  _prevState: PublishState,
  formData: FormData
): Promise<PublishState> {
  if (!dbConfigured()) {
    return {
      ok: false,
      errors: [
        "Publishing needs a database. Set DATABASE_URL to enable the publish flow.",
      ],
    };
  }

  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const manifest: AgentManifest = {
    name: get("name"),
    slug: slugify(get("slug") || get("name")),
    tagline: get("tagline"),
    description: get("description"),
    category: get("category") as AgentManifest["category"],
    version: get("version") || "1.0.0",
    creator: get("creator"),
    systemPrompt: get("systemPrompt"),
    requiredTools: parseList(get("tools")),
    requiredConnectors: parseList(get("connectors")),
    pricing: {
      rentPerRun: parseFloat(get("rentPerRun")) || 0,
      clonePrice: parseFloat(get("clonePrice")) || 0,
      currency: "USD",
    },
    ...(get("demoUrl") ? { demoUrl: get("demoUrl") } : {}),
    ...(get("evalNotes") ? { evalNotes: get("evalNotes") } : {}),
  };

  const validation = validateManifest(manifest);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  const displayName = get("displayName");
  if (displayName.length < 2 || displayName.length > 60) {
    return {
      ok: false,
      errors: ["Display name must be between 2 and 60 characters."],
    };
  }

  try {
    const creator = await prisma.creator.upsert({
      where: { handle: manifest.creator },
      update: {},
      create: {
        handle: manifest.creator,
        displayName: displayName.slice(0, 60),
        bio: "",
      },
    });

    const slug = await uniqueSlug(manifest.slug);

    await prisma.agent.create({
      data: {
        slug,
        name: manifest.name,
        tagline: manifest.tagline,
        description: manifest.description,
        category: manifest.category,
        version: manifest.version,
        systemPrompt: manifest.systemPrompt,
        requiredTools: manifest.requiredTools,
        requiredConnectors: manifest.requiredConnectors,
        rentPerRun: manifest.pricing.rentPerRun,
        clonePrice: manifest.pricing.clonePrice,
        currency: manifest.pricing.currency,
        demoUrl: manifest.demoUrl,
        evalNotes: manifest.evalNotes,
        creatorId: creator.id,
      },
    });

    return { ok: true, errors: [], slug };
  } catch (e) {
    console.error("publishAgent failed:", e);
    return {
      ok: false,
      errors: [
        "Could not save your agent. The database may be unreachable. Try again in a moment.",
      ],
    };
  }
}

export { INITIAL_STATE };
