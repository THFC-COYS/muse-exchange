"use client";

import { useMemo, useState } from "react";
import {
  AGENT_CATEGORIES,
  validateManifest,
  type AgentCategory,
  type AgentManifest,
} from "@/lib/manifest";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-panel px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-400 focus:outline-none";
const labelCls =
  "mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500";

function parseList(v: string): string[] {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function PublishPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AgentCategory>("education");
  const [version, setVersion] = useState("1.0.0");
  const [creator, setCreator] = useState("@");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tools, setTools] = useState("");
  const [connectors, setConnectors] = useState("");
  const [rentPerRun, setRentPerRun] = useState("1.00");
  const [clonePrice, setClonePrice] = useState("99");
  const [demoUrl, setDemoUrl] = useState("");
  const [evalNotes, setEvalNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const manifest: AgentManifest = useMemo(
    () => ({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      tagline: tagline.trim(),
      description: description.trim(),
      category,
      version: version.trim(),
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
      name,
      slug,
      tagline,
      description,
      category,
      version,
      creator,
      systemPrompt,
      tools,
      connectors,
      rentPerRun,
      clonePrice,
      demoUrl,
      evalNotes,
    ]
  );

  const validation = useMemo(() => validateManifest(manifest), [manifest]);
  const touched =
    name.length + slug.length + tagline.length + description.length > 0;

  const download = () => {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${manifest.slug || "agent"}.manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="card p-12">
          <p className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-3xl">
            ✓
          </p>
          <h1 className="mt-6 text-3xl font-black tracking-tight">
            Manifest received
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-zinc-400">
            <span className="font-bold text-white">{manifest.name}</span>{" "}
            passed validation and is queued. This is test mode, so nothing was
            charged and no backend was called. When the rent rail lands, this
            is the exact flow your buyers will see.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-8 rounded-full border border-white/20 px-8 py-3 text-sm font-bold transition hover:bg-white/5"
          >
            Publish another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        Publish your agent
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Fill in the manifest. It validates live against the open spec, and the
        JSON preview on the right is exactly what buyers will clone.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card space-y-5 p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-name">Agent name</label>
              <input
                id="p-name"
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Syllabus Architect"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-slug">Slug</label>
              <input
                id="p-slug"
                className={inputCls + " font-mono"}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="syllabus-architect"
              />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="p-tagline">Tagline</label>
            <input
              id="p-tagline"
              className={inputCls}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="One line that sells it"
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="p-desc">Description</label>
            <textarea
              id="p-desc"
              className={inputCls + " min-h-28"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What it does, who it is for, why it is great"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="p-cat">Category</label>
              <select
                id="p-cat"
                className={inputCls}
                value={category}
                onChange={(e) => setCategory(e.target.value as AgentCategory)}
              >
                {AGENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="p-ver">Version</label>
              <input
                id="p-ver"
                className={inputCls + " font-mono"}
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-creator">Creator handle</label>
              <input
                id="p-creator"
                className={inputCls + " font-mono"}
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="@yourhandle"
              />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="p-prompt">System prompt</label>
            <textarea
              id="p-prompt"
              className={inputCls + " min-h-32 font-mono"}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are ..., an expert ..."
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-tools">
                Required tools (comma separated)
              </label>
              <input
                id="p-tools"
                className={inputCls + " font-mono"}
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="web_search, file_read"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-conn">
                Required connectors (comma separated)
              </label>
              <input
                id="p-conn"
                className={inputCls + " font-mono"}
                value={connectors}
                onChange={(e) => setConnectors(e.target.value)}
                placeholder="gmail, notion"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-rent">Rent per run (USD)</label>
              <input
                id="p-rent"
                type="number"
                min="0.01"
                step="0.01"
                className={inputCls + " font-mono"}
                value={rentPerRun}
                onChange={(e) => setRentPerRun(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                You keep 70% of every rent.
              </p>
            </div>
            <div>
              <label className={labelCls} htmlFor="p-clone">Clone price (USD)</label>
              <input
                id="p-clone"
                type="number"
                min="1"
                step="1"
                className={inputCls + " font-mono"}
                value={clonePrice}
                onChange={(e) => setClonePrice(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                One-time blueprint purchase.
              </p>
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="p-demo">Demo URL (optional)</label>
            <input
              id="p-demo"
              className={inputCls + " font-mono"}
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="p-eval">Eval notes (optional)</label>
            <textarea
              id="p-eval"
              className={inputCls + " min-h-20"}
              value={evalNotes}
              onChange={(e) => setEvalNotes(e.target.value)}
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
            {touched && !validation.valid && (
              <ul className="space-y-1.5 border-b border-white/10 bg-amber-400/5 px-6 py-4 text-xs text-amber-200">
                {validation.errors.map((e) => (
                  <li key={e}>· {e}</li>
                ))}
              </ul>
            )}
            <pre className="max-h-[560px] overflow-auto p-6 font-mono text-xs leading-relaxed text-zinc-300">
              {JSON.stringify(manifest, null, 2)}
            </pre>
            <div className="flex gap-3 border-t border-white/10 p-6">
              <button
                type="button"
                disabled={!validation.valid}
                onClick={() => setSubmitted(true)}
                className="flex-1 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Publish (test mode)
              </button>
              <button
                type="button"
                disabled={!validation.valid}
                onClick={download}
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Download JSON
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            The manifest is the open spec. Export it any time, import it
            anywhere. Your blueprint stays portable, forever.
          </p>
        </div>
      </div>
    </div>
  );
}
