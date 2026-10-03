import Link from "next/link";
import { AGENT_CATEGORIES, EXAMPLE_MANIFEST, manifestJsonSchema } from "@/lib/manifest";

const fields: { name: string; required: boolean; text: string }[] = [
  { name: "name", required: true, text: "Display name, 3 to 60 characters." },
  { name: "slug", required: true, text: "URL-safe identifier, lowercase with dashes." },
  { name: "tagline", required: true, text: "One-line pitch, 10 to 120 characters." },
  { name: "description", required: true, text: "Full description, 40 to 2000 characters." },
  { name: "category", required: true, text: `One of: ${AGENT_CATEGORIES.join(", ")}.` },
  { name: "version", required: true, text: "Semantic version of the blueprint, e.g. 1.2.0." },
  { name: "creator", required: true, text: "Creator handle, e.g. @teachforward." },
  { name: "systemPrompt", required: true, text: "The full system prompt. This is the product." },
  { name: "requiredTools", required: true, text: "Tool names the agent needs, e.g. web_search." },
  { name: "requiredConnectors", required: true, text: "Connector names, e.g. gmail, notion. May be empty." },
  { name: "pricing", required: true, text: "rentPerRun, clonePrice, and a 3-letter currency code." },
  { name: "demoUrl", required: false, text: "Link to a demo video or GIF." },
  { name: "evalNotes", required: false, text: "How it was tested, and where it is weak. Honesty converts." },
];

export default function ManifestPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
        Open spec v1.0.0
      </p>
      <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
        The Agent Manifest
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-zinc-400">
        The manifest is the portable unit of the agent economy. One JSON
        document describes an agent completely: who made it, what it does,
        what it needs, and what it costs. Listings, rentals, and clones all
        run on manifests.
      </p>

      <div className="card mt-10 p-8">
        <h2 className="text-2xl font-black tracking-tight">
          The portability promise
        </h2>
        <p className="mt-4 leading-relaxed text-zinc-300">
          The spec is open and versioned from day one. A blueprint you export
          from Muse Exchange can be imported into any compatible Muse setup.
          Your work is never locked in. That openness is what recruits supply:
          creators publish here because the manifest travels, and buyers come
          here because the supply is here.
        </p>
        <p className="mt-4 leading-relaxed text-zinc-300">
          The directory and the spec are open source. The transaction rails,
          the rent metering and the payouts, are the toll booth. That split
          is deliberate.
        </p>
      </div>

      <h2 className="mt-16 text-2xl font-black tracking-tight">The fields</h2>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-zinc-500">
              <th className="px-6 py-4">Field</th>
              <th className="px-6 py-4">Required</th>
              <th className="px-6 py-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.name} className="border-b border-white/5 last:border-0">
                <td className="px-6 py-4 font-mono text-cyan-300">{f.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      f.required
                        ? "bg-violet-400/15 text-violet-300"
                        : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {f.required ? "required" : "optional"}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400">{f.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-16 text-2xl font-black tracking-tight">
        The JSON Schema
      </h2>
      <p className="mt-4 leading-relaxed text-zinc-400">
        Draft 2020-12, published at{" "}
        <span className="font-mono text-sm text-cyan-300">
          muse.exchange/schemas/agent-manifest-v1.json
        </span>
        . Validate locally with the{" "}
        <span className="font-mono text-sm text-cyan-300">validateManifest()</span>{" "}
        helper in <span className="font-mono text-sm">lib/manifest.ts</span>,
        no dependencies.
      </p>
      <pre className="card mt-6 max-h-[480px] overflow-auto p-6 font-mono text-xs leading-relaxed text-zinc-300">
        {JSON.stringify(manifestJsonSchema, null, 2)}
      </pre>

      <h2 className="mt-16 text-2xl font-black tracking-tight">
        Example manifest
      </h2>
      <pre className="card mt-6 max-h-[480px] overflow-auto p-6 font-mono text-xs leading-relaxed text-zinc-300">
        {JSON.stringify(EXAMPLE_MANIFEST, null, 2)}
      </pre>

      <div className="mt-16 text-center">
        <h2 className="text-3xl font-black tracking-tight">
          Ready to publish yours?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          The form validates live against this exact spec, and the JSON
          preview is what buyers will clone.
        </p>
        <Link
          href="/publish"
          className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-sm font-bold text-ink transition hover:bg-zinc-200"
        >
          Publish your agent
        </Link>
      </div>
    </div>
  );
}
