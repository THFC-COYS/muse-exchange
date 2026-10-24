"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import {
  AGENT_CATEGORIES,
  validateManifest,
  type AgentCategory,
  type AgentManifest,
} from "@/lib/manifest";
import { publishAgent, INITIAL_STATE } from "./actions";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-panel px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-400 focus:outline-none";
const labelCls =
  "mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500";
const errCls = "mt-1.5 text-xs text-amber-300";

const CATEGORY_LABELS: Record<AgentCategory, string> = {
  productivity: "Productivity",
  education: "Education",
  business: "Business",
  marketing: "Marketing",
  engineering: "Engineering",
  lifestyle: "Lifestyle",
};

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "Publishing..." : "Publish to the Exchange"}
    </button>
  );
}

export default function PublishForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(publishAgent, INITIAL_STATE);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AgentCategory>("productivity");
  const [version, setVersion] = useState("1.0.0");
  const [creator, setCreator] = useState("@");
  const [displayName, setDisplayName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tools, setTools] = useState("");
  const [connectors, setConnectors] = useState("");
  const [rentPerRun, setRentPerRun] = useState("1.00");
  const [clonePrice, setClonePrice] = useState("99");
  const [demoUrl, setDemoUrl] = useState("");
  const [evalNotes, setEvalNotes] = useState("");
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  useEffect(() => {
    if (state.ok && state.slug) router.push(`/agents/${state.slug}`);
  }, [state, router]);

  const manifest: AgentManifest = useMemo(
    () => ({
      name: name.trim(),
      slug: slugify(slug || name),
      tagline: tagline.trim(),
      description: description.trim(),
      category,
      version: version.trim() || "1.0.0",
      creator: creator.trim(),
      systemPrompt: systemPrompt.trim(),
      requiredTools: parseList(tools),
      requiredConnectors: parseList(connectors),
      pricing: {
        rentPerRun: parseFloat(rentPerRun) || 0,
        clonePrice: parseFloat(clonePrice) || 0,
        currency: "USD",
      },
      ...(demoUrl.trim() ? { demoUrl: demoUrl.trim() } : {}),
      ...(evalNotes.trim() ? { evalNotes: evalNotes.trim() } : {}),
    }),
    [
      name, slug, tagline, description, category, version, creator,
      systemPrompt, tools, connectors, rentPerRun, clonePrice, demoUrl, evalNotes,
    ]
  );

  const validation = useMemo(() => validateManifest(manifest), [manifest]);
  const showErrors = attempted && !validation.valid;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        Publish your agent
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Fill in the manifest. It validates live against the open spec, saves
        straight to the Exchange database, and the JSON preview on the right
        is exactly what buyers will clone.
      </p>

      {state.errors.length > 0 && (
        <div className="mt-8 rounded-xl border border-red-400/30 bg-red-400/10 p-5">
          <p className="text-sm font-bold text-red-300">
            Could not publish. Fix these and try again:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-200">
            {state.errors.map((e) => (
              <li key={e}>· {e}</li>
            ))}
          </ul>
        </div>
      )}

      <form
        action={formAction}
        onSubmit={() => setAttempted(true)}
        className="mt-10 grid gap-8 lg:grid-cols-2"
      >
        <div className="card space-y-5 p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-name">Agent name</label>
              <input
                id="p-name" name="name" required
                className={inputCls}
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Syllabus Architect"
              />
              {showErrors && manifest.name.length < 3 && (
                <p className={errCls}>Name must be 3 to 60 characters.</p>
              )}
            </div>
            <div>
              <label className={labelCls} htmlFor="p-slug">Slug</label>
              <input
                id="p-slug" name="slug"
                className={inputCls + " font-mono"}
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="p-tagline">Tagline</label>
            <input
              id="p-tagline" name="tagline" required
              className={inputCls}
              value={tagline} onChange={(e) => setTagline(e.target.value)}
              placeholder="One line that sells it"
            />
            {showErrors && (manifest.tagline.length < 10 || manifest.tagline.length > 120) && (
              <p className={errCls}>Tagline must be 10 to 120 characters.</p>
            )}
          </div>

          <div>
            <label className={labelCls} htmlFor="p-desc">Description</label>
            <textarea
              id="p-desc" name="description" required
              className={inputCls + " min-h-28"}
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What it does, who it is for, why it is great"
            />
            {showErrors && (manifest.description.length < 40 || manifest.description.length > 2000) && (
              <p className={errCls}>Description must be 40 to 2000 characters.</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-cat">Category</label>
              <select
                id="p-cat" name="category"
                className={inputCls}
                value={category}
                onChange={(e) => setCategory(e.target.value as AgentCategory)}
              >
                {AGENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="p-ver">Version</label>
              <input
                id="p-ver" name="version"
                className={inputCls + " font-mono"}
                value={version} onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-creator">Creator handle</label>
              <input
                id="p-creator" name="creator" required
                className={inputCls + " font-mono"}
                value={creator} onChange={(e) => setCreator(e.target.value)}
                placeholder="@yourhandle"
              />
              {showErrors && !/^@[a-z0-9_]{3,30}$/.test(manifest.creator) && (
                <p className={errCls}>Handle looks like @yourhandle, lowercase.</p>
              )}
            </div>
            <div>
              <label className={labelCls} htmlFor="p-display">Display name</label>
              <input
                id="p-display" name="displayName" required
                className={inputCls}
                value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="p-prompt">System prompt</label>
            <textarea
              id="p-prompt" name="systemPrompt" required
              className={inputCls + " min-h-32 font-mono"}
              value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are ..., an expert ..."
            />
            {showErrors && manifest.systemPrompt.length < 20 && (
              <p className={errCls}>System prompt must be at least 20 characters.</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-tools">
                Required tools (comma separated)
              </label>
              <input
                id="p-tools" name="tools"
                className={inputCls + " font-mono"}
                value={tools} onChange={(e) => setTools(e.target.value)}
                placeholder="web_search, file_read"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-conn">
                Required connectors (comma separated)
              </label>
              <input
                id="p-conn" name="connectors"
                className={inputCls + " font-mono"}
                value={connectors} onChange={(e) => setConnectors(e.target.value)}
                placeholder="gmail, notion"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-rent">Rent per run (USD)</label>
              <input
                id="p-rent" name="rentPerRun" type="number" min="0.01" step="0.01" required
                className={inputCls + " font-mono"}
                value={rentPerRun} onChange={(e) => setRentPerRun(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-zinc-500">You keep 70% of every rent.</p>
              {showErrors && !(manifest.pricing.rentPerRun > 0) && (
                <p className={errCls}>Rent must be more than 0.</p>
              )}
            </div>
            <div>
              <label className={labelCls} htmlFor="p-clone">Clone price (USD)</label>
              <input
                id="p-clone" name="clonePrice" type="number" min="1" step="1" required
                className={inputCls + " font-mono"}
                value={clonePrice} onChange={(e) => setClonePrice(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-zinc-500">One-time blueprint purchase.</p>
              {showErrors && !(manifest.pricing.clonePrice > 0) && (
                <p className={errCls}>Clone price must be more than 0.</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="p-demo">Demo URL (optional)</label>
            <input
              id="p-demo" name="demoUrl"
              className={inputCls + " font-mono"}
              value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="p-eval">Eval notes (optional)</label>
            <textarea
              id="p-eval" name="evalNotes"
              className={inputCls + " min-h-20"}
              value={evalNotes} onChange={(e) => setEvalNotes(e.target.value)}
              placeholder="How you tested it, where it is weak"
            />
          </div>
        </div>

        {/* live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Manifest preview
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  validation.valid
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-amber-400/15 text-amber-300"
                }`}
              >
                {validation.valid ? "Valid" : `${validation.errors.length} issues`}
              </span>
            </div>
            {showErrors && (
              <ul className="space-y-1.5 border-b border-white/10 bg-amber-400/5 px-6 py-4 text-xs text-amber-200">
                {validation.errors.map((e) => (
                  <li key={e}>· {e}</li>
                ))}
              </ul>
            )}
            <pre className="max-h-[560px] overflow-auto p-6 font-mono text-xs leading-relaxed text-zinc-300">
              {JSON.stringify(manifest, null, 2)}
            </pre>
            <div className="border-t border-white/10 p-6">
              <SubmitButton />
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            The manifest is the open spec. Export it any time, import it
            anywhere. Your blueprint stays portable, forever.
          </p>
        </div>
      </form>
    </div>
  );
}
