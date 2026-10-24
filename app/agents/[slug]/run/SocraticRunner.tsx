"use client";

import { useEffect, useRef, useState } from "react";
import {
  TRACKS,
  startTrack,
  respond,
  type SocraticState,
  type TrackId,
} from "@/lib/socratic";

interface Message {
  role: "tutor" | "student";
  text: string;
}

/**
 * Interactive hosted run of the Socratic Tutor.
 *
 * The full tutoring session runs in the browser on the engine in
 * lib/socratic.ts, which implements the agent's published system prompt:
 * diagnose with questions, never give the answer first, hints that shrink,
 * a worked parallel example after three stuck exchanges, and a mastery
 * wrap-up that names what the student proved. No external API is called.
 */
export default function SocraticRunner({ entitled }: { entitled: boolean }) {
  const [trackId, setTrackId] = useState<TrackId | null>(null);
  const [engine, setEngine] = useState<SocraticState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function pickTrack(id: TrackId) {
    const turn = startTrack(id);
    setTrackId(id);
    setEngine(turn.state);
    setMessages([{ role: "tutor", text: turn.reply }]);
    setInput("");
  }

  function reset() {
    setTrackId(null);
    setEngine(null);
    setMessages([]);
    setInput("");
  }

  function send() {
    const text = input.trim();
    if (!text || !engine) return;
    const turn = respond(engine, text);
    setEngine(turn.state);
    setMessages((prev) => [
      ...prev,
      { role: "student", text },
      { role: "tutor", text: turn.reply },
    ]);
    setInput("");
  }

  return (
    <div className="card overflow-hidden">
      {/* session header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-6 py-4">
        <div>
          <p className="text-sm font-black tracking-tight">
            Socratic Tutor, hosted run
          </p>
          <p className="text-xs text-zinc-500">
            {entitled
              ? "Rented run · unlimited session"
              : "Sample run · no checkout needed"}
          </p>
        </div>
        {trackId && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold transition hover:bg-white/5"
          >
            Change topic
          </button>
        )}
      </div>

      {!trackId ? (
        <div className="p-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            Pick a topic. The tutor will ask the questions, you will do the
            reasoning, and the answer at the end will be one you derived. It
            never hands over the final answer first. That is the whole
            design.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pickTrack(t.id)}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
              >
                <p className="font-bold text-zinc-100">{t.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {t.blurb}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div
            ref={scrollRef}
            className="max-h-[480px] space-y-4 overflow-y-auto px-6 py-6"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "tutor" ? "flex justify-start" : "flex justify-end"
                }
              >
                <div
                  className={
                    m.role === "tutor"
                      ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-zinc-200"
                      : "max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-cyan-400 px-4 py-3 text-sm font-medium leading-relaxed text-ink"
                  }
                >
                  {m.role === "tutor" && (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                      Socratic Tutor
                    </p>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form
            className="flex gap-3 border-t border-white/10 px-6 py-4"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Answer the tutor, or ask for a hint…"
              className="w-full rounded-full border border-white/15 bg-ink px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={input.trim().length === 0}
              className="shrink-0 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reply
            </button>
          </form>
          <p className="px-6 pb-4 text-xs text-zinc-600">
            Stuck? Type "hint". The tutor will shrink the step, and after
            three stuck exchanges it works a parallel problem in full, then
            returns to yours.
          </p>
        </div>
      )}
    </div>
  );
}
