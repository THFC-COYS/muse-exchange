/**
 * The open Agent Manifest spec for Muse Exchange.
 *
 * The manifest is the portable unit of the agent economy. Every agent listed
 * on the Exchange is described by one manifest: identity, capabilities,
 * pricing, and the full blueprint needed to run it. Because the spec is open
 * and versioned, a blueprint exported from the Exchange can be imported into
 * any compatible Muse setup. Portability is a feature, not a risk.
 *
 * Spec version: 1.0.0
 * Canonical schema id: https://muse.exchange/schemas/agent-manifest-v1.json
 */

/** Marketplace categories. Keep in sync with the Prisma AgentCategory enum. */
export const AGENT_CATEGORIES = [
  "productivity",
  "education",
  "business",
  "marketing",
  "engineering",
  "lifestyle",
] as const;

export type AgentCategory = (typeof AGENT_CATEGORIES)[number];

/** Pricing for the two money rails: rent per run, and clone the blueprint. */
export interface ManifestPricing {
  /** Fee charged for a single run of the agent, e.g. 1.5 */
  rentPerRun: number;
  /** One-time price for the full blueprint export, e.g. 149 */
  clonePrice: number;
  /** ISO 4217 currency code, e.g. "USD" */
  currency: string;
}

/**
 * A complete, portable description of one Muse agent.
 */
export interface AgentManifest {
  /** Display name, 3 to 60 characters */
  name: string;
  /** URL-safe slug, lowercase alphanumeric with dashes, e.g. "syllabus-architect" */
  slug: string;
  /** One-line pitch, 10 to 120 characters */
  tagline: string;
  /** Full description, 40 to 2000 characters */
  description: string;
  /** Marketplace category */
  category: AgentCategory;
  /** Semantic version of this blueprint, e.g. "1.2.0" */
  version: string;
  /** Creator handle, e.g. "@teachforward" */
  creator: string;
  /** The full system prompt that defines the agent's behavior */
  systemPrompt: string;
  /** Tool names the agent needs, e.g. ["web_search", "file_read"] */
  requiredTools: string[];
  /** Connector names the agent needs, e.g. ["gmail", "notion"] */
  requiredConnectors: string[];
  /** Pricing for both money rails */
  pricing: ManifestPricing;
  /** Optional link to a demo video or GIF */
  demoUrl?: string;
  /** Optional notes on how the agent was evaluated and where it is weak */
  evalNotes?: string;
}

/**
 * JSON Schema (draft 2020-12) for AgentManifest v1.
 * Published at https://muse.exchange/schemas/agent-manifest-v1.json
 */
export const manifestJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://muse.exchange/schemas/agent-manifest-v1.json",
  title: "Muse Exchange Agent Manifest v1",
  description:
    "Portable, open specification for a Muse agent listing on Muse Exchange.",
  type: "object",
  additionalProperties: false,
  required: [
    "name",
    "slug",
    "tagline",
    "description",
    "category",
    "version",
    "creator",
    "systemPrompt",
    "requiredTools",
    "requiredConnectors",
    "pricing",
  ],
  properties: {
    name: { type: "string", minLength: 3, maxLength: 60 },
    slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    tagline: { type: "string", minLength: 10, maxLength: 120 },
    description: { type: "string", minLength: 40, maxLength: 2000 },
    category: { type: "string", enum: [...AGENT_CATEGORIES] },
    version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
    creator: { type: "string", pattern: "^@[a-z0-9_]{3,30}$" },
    systemPrompt: { type: "string", minLength: 20 },
    requiredTools: {
      type: "array",
      items: { type: "string", minLength: 1 },
      uniqueItems: true,
    },
    requiredConnectors: {
      type: "array",
      items: { type: "string", minLength: 1 },
      uniqueItems: true,
    },
    pricing: {
      type: "object",
      additionalProperties: false,
      required: ["rentPerRun", "clonePrice", "currency"],
      properties: {
        rentPerRun: { type: "number", exclusiveMinimum: 0, maximum: 1000 },
        clonePrice: { type: "number", exclusiveMinimum: 0, maximum: 100000 },
        currency: { type: "string", pattern: "^[A-Z]{3}$" },
      },
    },
    demoUrl: { type: "string", format: "uri" },
    evalNotes: { type: "string", maxLength: 5000 },
  },
} as const;

/** An example manifest used across the docs and the publish flow. */
export const EXAMPLE_MANIFEST: AgentManifest = {
  name: "Syllabus Architect",
  slug: "syllabus-architect",
  tagline: "A complete, outcomes-aligned course syllabus in under ten minutes.",
  description:
    "Feed Syllabus Architect your course outcomes, schedule, and institutional requirements. It returns a week-by-week syllabus with learning objectives, assessments, readings, and policies, formatted and ready to publish.",
  category: "education",
  version: "1.2.0",
  creator: "@teachforward",
  systemPrompt:
    "You are Syllabus Architect, an expert instructional designer. Given course outcomes, a term schedule, and institutional policy requirements, produce a complete week-by-week syllabus with measurable learning objectives, aligned assessments, and a clear grading scheme. Ask for missing inputs before drafting. Never invent accreditation requirements.",
  requiredTools: ["web_search", "file_read", "document_write"],
  requiredConnectors: ["notion", "gmail"],
  pricing: { rentPerRun: 1.5, clonePrice: 149, currency: "USD" },
  demoUrl: "https://demo.muse.exchange/syllabus-architect",
  evalNotes:
    "Tested against 40 real course outlines across 6 disciplines. Strong on alignment and policy completeness. Weaker on lab-heavy science courses with equipment constraints; flag those for human review.",
};

export interface ManifestValidation {
  valid: boolean;
  errors: string[];
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const CREATOR_RE = /^@[a-z0-9_]{3,30}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;

const REQUIRED_KEYS: (keyof AgentManifest)[] = [
  "name",
  "slug",
  "tagline",
  "description",
  "category",
  "version",
  "creator",
  "systemPrompt",
  "requiredTools",
  "requiredConnectors",
  "pricing",
];

const OPTIONAL_KEYS: (keyof AgentManifest)[] = ["demoUrl", "evalNotes"];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function checkString(
  errors: string[],
  obj: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
  label: string
) {
  const v = obj[key];
  if (typeof v !== "string") {
    errors.push(`${label} must be a string.`);
    return;
  }
  if (v.length < min || v.length > max) {
    errors.push(`${label} must be between ${min} and ${max} characters.`);
  }
}

/**
 * Validate an unknown value against the Agent Manifest v1 spec.
 * Returns { valid, errors }. Mirrors manifestJsonSchema without a dependency.
 */
export function validateManifest(input: unknown): ManifestValidation {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { valid: false, errors: ["Manifest must be a JSON object."] };
  }

  for (const key of REQUIRED_KEYS) {
    if (!(key in input) || input[key] === undefined || input[key] === null) {
      errors.push(`Missing required field: "${key}".`);
    }
  }

  const allowed = new Set<string>([...REQUIRED_KEYS, ...OPTIONAL_KEYS]);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) {
      errors.push(`Unknown field: "${key}". Remove it or check the spec version.`);
    }
  }

  checkString(errors, input, "name", 3, 60, "name");
  checkString(errors, input, "tagline", 10, 120, "tagline");
  checkString(errors, input, "description", 40, 2000, "description");
  checkString(errors, input, "systemPrompt", 20, 20000, "systemPrompt");

  if (typeof input.slug === "string" && !SLUG_RE.test(input.slug)) {
    errors.push('slug must be lowercase alphanumeric with dashes, e.g. "syllabus-architect".');
  }

  if (
    typeof input.category === "string" &&
    !(AGENT_CATEGORIES as readonly string[]).includes(input.category)
  ) {
    errors.push(
      `category must be one of: ${(AGENT_CATEGORIES as readonly string[]).join(", ")}.`
    );
  }

  if (typeof input.version === "string" && !VERSION_RE.test(input.version)) {
    errors.push('version must be semantic, e.g. "1.2.0".');
  }

  if (typeof input.creator === "string" && !CREATOR_RE.test(input.creator)) {
    errors.push('creator must be a handle like "@teachforward".');
  }

  for (const key of ["requiredTools", "requiredConnectors"] as const) {
    const v = input[key];
    if (v === undefined) continue;
    if (!Array.isArray(v)) {
      errors.push(`${key} must be an array of strings.`);
      continue;
    }
    if (v.some((t) => typeof t !== "string" || t.trim().length === 0)) {
      errors.push(`${key} must contain only non-empty strings.`);
    }
    if (new Set(v).size !== v.length) {
      errors.push(`${key} must not contain duplicates.`);
    }
  }

  const pricing = input.pricing;
  if (pricing !== undefined) {
    if (!isRecord(pricing)) {
      errors.push("pricing must be an object.");
    } else {
      const { rentPerRun, clonePrice, currency } = pricing;
      if (typeof rentPerRun !== "number" || !(rentPerRun > 0) || rentPerRun > 1000) {
        errors.push("pricing.rentPerRun must be a number between 0 and 1000 (exclusive of 0).");
      }
      if (typeof clonePrice !== "number" || !(clonePrice > 0) || clonePrice > 100000) {
        errors.push("pricing.clonePrice must be a number between 0 and 100000 (exclusive of 0).");
      }
      if (typeof currency !== "string" || !CURRENCY_RE.test(currency)) {
        errors.push('pricing.currency must be a 3-letter code like "USD".');
      }
      for (const k of Object.keys(pricing)) {
        if (!["rentPerRun", "clonePrice", "currency"].includes(k)) {
          errors.push(`Unknown pricing field: "${k}".`);
        }
      }
    }
  }

  if (input.demoUrl !== undefined) {
    if (typeof input.demoUrl !== "string") {
      errors.push("demoUrl must be a string URL.");
    } else {
      try {
        const u = new URL(input.demoUrl);
        if (!["http:", "https:"].includes(u.protocol)) {
          errors.push("demoUrl must start with http:// or https://.");
        }
      } catch {
        errors.push("demoUrl must be a valid URL.");
      }
    }
  }

  if (input.evalNotes !== undefined) {
    if (typeof input.evalNotes !== "string") {
      errors.push("evalNotes must be a string.");
    } else if (input.evalNotes.length > 5000) {
      errors.push("evalNotes must be at most 5000 characters.");
    }
  }

  return { valid: errors.length === 0, errors };
}

/* ------------------------------------------------------------------ */
/* Manifest export (M2). The portable clone-rail payload for M4.        */
/* ------------------------------------------------------------------ */

/**
 * Minimal agent shape accepted by agentToManifest. Satisfied by both the
 * Prisma Agent model (via the store layer) and seed agents.
 */
export interface ManifestSource {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  version: string;
  creator: string;
  creatorDisplayName?: string;
  systemPrompt: string;
  requiredTools: string[];
  requiredConnectors: string[];
  rentPerRun: number;
  clonePrice: number;
  currency: string;
  demoUrl?: string | null;
  evalNotes?: string | null;
}

/**
 * The portable manifest payload. This is the exact shape the M4 clone rail
 * will hand to buyers, so it is frozen as of M2: name, tagline, description,
 * category, systemPrompt, connectors, pricing { rent, clone }, creator,
 * version, exportedAt, plus the spec identity fields.
 */
export interface ManifestExport {
  spec: string;
  specVersion: string;
  exportedAt: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  version: string;
  creator: string;
  creatorDisplayName?: string;
  systemPrompt: string;
  requiredTools: string[];
  requiredConnectors: string[];
  /** Flat connector list for one-line importers: tools + connectors, deduped. */
  connectors: string[];
  pricing: {
    rent: number;
    clone: number;
    currency: string;
  };
  demoUrl?: string;
  evalNotes?: string;
}

function escMd(s: string): string {
  return s.replace(/`/g, "'");
}

/**
 * Serialize any stored agent to the open manifest spec.
 * Returns both the human-readable markdown and the machine-readable JSON.
 * Pure function: no database access, safe to call anywhere.
 */
export function agentToManifest(source: ManifestSource): {
  markdown: string;
  json: ManifestExport;
} {
  const connectors = Array.from(
    new Set([...source.requiredTools, ...source.requiredConnectors])
  );
  const exportedAt = new Date().toISOString();

  const json: ManifestExport = {
    spec: "https://muse.exchange/schemas/agent-manifest-v1.json",
    specVersion: "1.0.0",
    exportedAt,
    name: source.name,
    slug: source.slug,
    tagline: source.tagline,
    description: source.description,
    category: source.category,
    version: source.version,
    creator: source.creator,
    systemPrompt: source.systemPrompt,
    requiredTools: [...source.requiredTools],
    requiredConnectors: [...source.requiredConnectors],
    connectors,
    pricing: {
      rent: source.rentPerRun,
      clone: source.clonePrice,
      currency: source.currency,
    },
  };
  if (source.creatorDisplayName) json.creatorDisplayName = source.creatorDisplayName;
  if (source.demoUrl) json.demoUrl = source.demoUrl;
  if (source.evalNotes) json.evalNotes = source.evalNotes;

  const lines = [
    `# ${escMd(source.name)}`,
    ``,
    `> ${escMd(source.tagline)}`,
    ``,
    `**Category:** ${source.category} · **Version:** ${source.version} · **Creator:** ${source.creator}`,
    `**Exported:** ${exportedAt}`,
    ``,
    `## Description`,
    ``,
    escMd(source.description),
    ``,
    `## System prompt`,
    ``,
    "```",
    source.systemPrompt,
    "```",
    ``,
    `## Connectors and tools`,
    ``,
    ...connectors.map((c) => `- \`${c}\``),
    ``,
    `## Pricing`,
    ``,
    `- Rent: ${source.rentPerRun} ${source.currency} per run`,
    `- Clone: ${source.clonePrice} ${source.currency} one-time`,
    ``,
  ];
  if (source.demoUrl) {
    lines.push(`## Demo`, ``, source.demoUrl, ``);
  }
  if (source.evalNotes) {
    lines.push(`## Eval notes`, ``, escMd(source.evalNotes), ``);
  }
  lines.push(
    `---`,
    ``,
    `Exported from Muse Exchange. Spec: https://muse.exchange/schemas/agent-manifest-v1.json`
  );

  return { markdown: lines.join("\n"), json };
}
