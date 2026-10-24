"use client";

import { useState } from "react";
import type { StoreAgent } from "@/lib/store";

/**
 * Run console for agents other than the Socratic Tutor.
 *
 * Honest by construction: the sample run is a deterministic preview driven
 * by the agent's manifest, and it says so on its face. It does NOT pretend
 * a live model answered. Renting or cloning delivers the full manifest,
 * which is what runs the agent for real.
 */
export default function GenericRunner({
  agent,
  entitled,
}: {
  agent: StoreAgent;
  entitled: boolean;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  function runSample() {
    const task = input.trim();
    if (!task) return;
    // Deterministic preview: a simple stable hash picks the framing, so
    // the same input always yields the same output.
    let hash = 0;
    for (let i = 0; i < task.length; i++) {
      hash = (hash * 31 + task.charCodeAt(i)) >>> 0;
    }
    const framings = [
      `Working brief accepted. ${agent.name} would open by restating the task in its own frame, then apply the system prompt below step by step.`,
      `Task received. ${agent.name} would first check its required tools and connectors, then work the task in the order its blueprint specifies.`,
      `Input logged. ${agent.name} would break this into sub-tasks, handle them in sequence, and return a single finished deliverable.`,
    ];
    const framing = framings[hash % framings.length];
    setOutput(
      `${framing}\n\nYour task, as received: "${task}"\n\nSample run of the manifest: this preview is deterministic and calls no model. Rent or clone ${agent.name} to run the full blueprint for real.`
    );
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-6 py-4">
          <div>
            <p className="text-sm font-black tracking-tight">
              {agent.name}, run console
            </p>
            <p className="text-xs text-zinc-500">
              {entitled
                ? "Entitled run · this browser completed checkout"
                : "Sample run · deterministic manifest preview"}
            </p>
          </div>
          <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-zinc-400">
            by {agent.creator}
          </span>
        </div>

        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Run brief (the agent's system prompt)
          </p>
          <pre className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-ink p-4 font-mono text-xs leading-relaxed text-zinc-300">
            {agent.systemPrompt}
          </pre>

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-zinc-500">
            Give it a task
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder={`Describe a task for ${agent.name}…`}
            className="mt-3 w-full rounded-xl border border-white/15 bg-ink px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={runSample}
            disabled={input.trim().length === 0}
            className="mt-3 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Run sample
          </button>

          {output && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Sample output
              </p>
              <div className="mt-3 whitespace-pre-line rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-4 text-sm leading-relaxed text-zinc-200">
                {output}
              </div>
              <p className="mt-2 text-xs text-zinc-600">
                Labeled honestly: this is a sample run of the manifest, not
                a live model response.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          The full blueprint
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Renting runs this agent hosted. Cloning hands you the complete
          manifest: system prompt, tool wiring, connector config, and eval
          notes, yours to run anywhere.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`/api/agents/${agent.slug}/manifest`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:bg-white/5"
          >
            View manifest (JSON)
          </a>
          <a
            href={`/api/agents/${agent.slug}/manifest?format=markdown`}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:bg-white/5"
          >
            Download manifest (Markdown)
          </a>
        </div>
      </div>
    </div>
  );
}
