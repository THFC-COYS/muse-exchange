/**
 * Database seed for Muse Exchange M2.
 *
 * Inserts exactly ONE featured agent: EDITH, creator Greg Lucas (@greglucas).
 * Idempotent: safe to run multiple times (upserts by unique handle/slug).
 *
 * Run with: npx prisma db seed   (needs tsx, see package.json prisma.seed)
 */
import { PrismaClient } from "@prisma/client";
import { validateManifest, agentToManifest, type AgentManifest } from "../lib/manifest";

const prisma = new PrismaClient();

const EDITH_MANIFEST: AgentManifest = {
  name: "EDITH",
  slug: "edith",
  tagline:
    "Your chief-of-staff: the operator who runs your days, your inbox, and your launches.",
  description:
    "EDITH is the chief-of-staff agent that runs Greg Lucas's operating system: five LinkedIn posts a day, three teaching-assistant lanes, a job search, and two product launches, all before lunch. Rent her per task for research, drafting, grading support, launch operations, or full inbox triage. She is direct, fast, and allergic to busywork.",
  category: "productivity",
  version: "1.0.0",
  creator: "@greglucas",
  systemPrompt:
    "You are EDITH, a chief-of-staff operator. Be genuinely helpful, not performatively helpful. Have opinions. Be resourceful before asking. You are a guest in the user's life: treat access to their messages, files, and calendar with care. Default to action on reversible work; confirm before anything irreversible or outward-facing. Report one confirmed outcome per item, honestly, including honest zeros.",
  requiredTools: ["web-search", "browser-automation"],
  requiredConnectors: [
    "google-calendar",
    "gmail",
    "github",
    "vercel",
    "social-publishing",
  ],
  pricing: { rentPerRun: 2.5, clonePrice: 299, currency: "USD" },
  demoUrl: "https://muse-exchange.vercel.app",
};

async function main() {
  const check = validateManifest(EDITH_MANIFEST);
  if (!check.valid) {
    throw new Error(`EDITH manifest failed validation: ${check.errors.join("; ")}`);
  }

  const creator = await prisma.creator.upsert({
    where: { handle: "@greglucas" },
    update: { displayName: "Greg Lucas" },
    create: {
      handle: "@greglucas",
      displayName: "Greg Lucas",
      bio: "Founder of the Exchange. Education futurist building the agent economy on Muse rails.",
      location: "Phoenix, AZ",
    },
  });

  const agent = await prisma.agent.upsert({
    where: { slug: EDITH_MANIFEST.slug },
    update: {
      name: EDITH_MANIFEST.name,
      tagline: EDITH_MANIFEST.tagline,
      description: EDITH_MANIFEST.description,
      category: EDITH_MANIFEST.category,
      version: EDITH_MANIFEST.version,
      systemPrompt: EDITH_MANIFEST.systemPrompt,
      requiredTools: EDITH_MANIFEST.requiredTools,
      requiredConnectors: EDITH_MANIFEST.requiredConnectors,
      rentPerRun: EDITH_MANIFEST.pricing.rentPerRun,
      clonePrice: EDITH_MANIFEST.pricing.clonePrice,
      currency: EDITH_MANIFEST.pricing.currency,
      demoUrl: EDITH_MANIFEST.demoUrl,
      creatorId: creator.id,
    },
    create: {
      slug: EDITH_MANIFEST.slug,
      name: EDITH_MANIFEST.name,
      tagline: EDITH_MANIFEST.tagline,
      description: EDITH_MANIFEST.description,
      category: EDITH_MANIFEST.category,
      version: EDITH_MANIFEST.version,
      systemPrompt: EDITH_MANIFEST.systemPrompt,
      requiredTools: EDITH_MANIFEST.requiredTools,
      requiredConnectors: EDITH_MANIFEST.requiredConnectors,
      rentPerRun: EDITH_MANIFEST.pricing.rentPerRun,
      clonePrice: EDITH_MANIFEST.pricing.clonePrice,
      currency: EDITH_MANIFEST.pricing.currency,
      demoUrl: EDITH_MANIFEST.demoUrl,
      creatorId: creator.id,
      simSlug: null,
    },
  });

  // Prove the manifest export shape serializes cleanly for the M4 clone rail.
  const exported = agentToManifest({
    name: agent.name,
    slug: agent.slug,
    tagline: agent.tagline,
    description: agent.description,
    category: agent.category,
    version: agent.version,
    creator: creator.handle,
    creatorDisplayName: creator.displayName,
    systemPrompt: agent.systemPrompt,
    requiredTools: agent.requiredTools,
    requiredConnectors: agent.requiredConnectors,
    rentPerRun: Number(agent.rentPerRun),
    clonePrice: Number(agent.clonePrice),
    currency: agent.currency,
    demoUrl: agent.demoUrl,
  });
  const recheck = validateManifest({
    ...EDITH_MANIFEST,
    systemPrompt: exported.json.systemPrompt,
  });
  if (!recheck.valid) throw new Error("Exported manifest failed revalidation.");

  console.log(`Seeded agent #1: ${agent.name} (${agent.slug}) by ${creator.handle}`);
  console.log(`Manifest export: ${exported.markdown.split("\n").length} markdown lines, JSON keys: ${Object.keys(exported.json).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
