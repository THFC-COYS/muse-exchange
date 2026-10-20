"use client";

import { useEffect, useRef, useState } from "react";
import {
  startWithTrack,
  respondWithTrack,
  type SocraticState,
} from "@/lib/socratic";
import {
  TESTPREP_TRACKS,
  TIER_LABELS,
  SESSION_LENGTH,
  gradeProblem,
  nextTier,
  pickProblem,
  type TestPrepProblem,
  type TestPrepTrackDef,
} from "@/lib/testprep";

interface Message {
  role: "coach" | "student";
  text: string;
}

interface ProblemResult {
  skill: string;
  tier: number;
  hintsUsed: number;
  parallelsUsed: number;
  grade: "clean" | "solid" | "struggled";
}

type Phase = "pick" | "chat" | "between" | "done";

/**
 * Interactive hosted run of Test Prep Coach.
 *
 * Same Socratic engine as Socratic Tutor (lib/socratic.ts), wrapped in a
 * test-prep session: the student picks SAT or ACT math, starts at Core
 * difficulty, and the session adapts problem by problem. Clean solves
 * raise the tier and build the streak; struggled solves step the tier
 * down. After each problem the coach says what happens next and why.
 * The session closes with a parent progress note the student can copy.
 */
export default function TestPrepRunner({ entitled }: { entitled: boolean }) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [track, setTrack] = useState<TestPrepTrackDef | null>(null);
  const [problem, setProblem] = useState<TestPrepProblem | null>(null);
  const [engine, setEngine] = useState<SocraticState | null>(null);
  const [tier, setTier] = useState(1);
  const [pendingTier, setPendingTier] = useState(1);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, phase]);

  const sessionHints =
    results.reduce((n, r) => n + r.hintsUsed, 0) + (engine?.hintsUsed ?? 0);
  const maxTierReached = results.reduce((m, r) => Math.max(m, r.tier), tier);

  function beginProblem(
    def: TestPrepTrackDef,
    atTier: number,
    used: string[],
    prior: Message[]
  ) {
    const next = pickProblem(def, atTier, used);
    if (!next) {
      setPhase("done");
      return;
    }
    const actualTier = def.tiers.findIndex((pool) => pool.includes(next));
    const turn = startWithTrack(next);
    setProblem(next);
    setEngine(turn.state);
    setTier(actualTier);
    setUsedIds([...used, next.id]);
    setMessages([
      ...prior,
      {
        role: "coach",
        text: `Problem ${used.length + 1} of ${SESSION_LENGTH}: ${next.skill}, ${TIER_LABELS[actualTier]} difficulty.`,
      },
      { role: "coach", text: turn.reply },
    ]);
    setPhase("chat");
    setInput("");
  }

  function pickTrack(def: TestPrepTrackDef) {
    setTrack(def);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setCopied(false);
    const welcome: Message = {
      role: "coach",
      text: `Test Prep Coach session: ${def.label}. ${SESSION_LENGTH} problems, adaptive. Solve one cleanly and the next steps up a difficulty tier; struggle and we step down to rebuild. I will never just hand you an answer, and at the end you get a progress note written for a parent. Starting at ${TIER_LABELS[1]}.`,
    };
    beginProblem(def, 1, [], [welcome]);
  }

  function reset() {
    setPhase("pick");
    setTrack(null);
    setProblem(null);
    setEngine(null);
    setMessages([]);
    setResults([]);
    setUsedIds([]);
    setStreak(0);
    setBestStreak(0);
    setInput("");
    setCopied(false);
  }

  function send() {
    const text = input.trim();
    if (!text || !engine || !problem || !track) return;
    const turn = respondWithTrack(problem, engine, text);
    setEngine(turn.state);
    const nextMessages: Message[] = [
      ...messages,
      { role: "student", text },
      { role: "coach", text: turn.reply },
    ];
    setMessages(nextMessages);
    setInput("");

    if (turn.state.done) {
      const grade = gradeProblem(turn.state);
      const result: ProblemResult = {
        skill: problem.skill,
        tier,
        hintsUsed: turn.state.hintsUsed,
        parallelsUsed: turn.state.parallelsUsed,
        grade,
      };
      const nextResults = [...results, result];
      setResults(nextResults);
      const newStreak = grade === "clean" ? streak + 1 : 0;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      setPendingTier(nextTier(tier, grade));

      if (nextResults.length >= SESSION_LENGTH) {
        setMessages([
          ...nextMessages,
          {
            role: "coach",
            text: "That is the full session. Your progress note is ready below, written so a parent can read it in under a minute.",
          },
        ]);
        setPhase("done");
      } else {
        const note =
          grade === "clean"
            ? `Clean solve. Streak at ${newStreak}, so the next problem steps up to ${TIER_LABELS[nextTier(tier, grade)]}.`
            : grade === "solid"
              ? `Solid solve, with a little scaffolding. We stay at ${TIER_LABELS[tier]} for the next one.`
              : `That one took real work, and you finished it. We step down to ${TIER_LABELS[nextTier(tier, grade)]} to rebuild the base.`;
        setMessages([...nextMessages, { role: "coach", text: note }]);
        setPhase("between");
      }
    }
  }

  function buildProgressNote(): string {
    if (!track) return "";
    const total = results.length;
    const firstTry = results.filter((r) => r.hintsUsed === 0).length;
    const clean = results.filter((r) => r.grade === "clean").length;
    const struggled = results.filter((r) => r.grade === "struggled");
    const skills = Array.from(new Set(results.map((r) => r.skill)));
    const practiceNext =
      struggled.length > 0
        ? `Keep practicing ${struggled.map((r) => r.skill.toLowerCase()).join(" and ")} at ${TIER_LABELS[Math.max(0, struggled[0].tier - 1)]} difficulty before climbing again. That is where the remaining errors live.`
        : maxTierReached < 2
          ? `Ready to climb: the next session should open at ${TIER_LABELS[Math.min(2, maxTierReached + 1)]} difficulty and stay there.`
          : "Holding at Reach difficulty. The next gains come from timed sets of the same skills under test conditions.";
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return [
      `Parent progress note: Test Prep Coach`,
      `${track.label} · ${date}`,
      ``,
      `Topics covered: ${skills.join("; ")}.`,
      `Problems completed: ${total} of ${SESSION_LENGTH} planned, reaching ${TIER_LABELS[maxTierReached]} difficulty (sessions start at Core).`,
      `Accuracy: ${firstTry} of ${total} solved with no hints at all, ${clean} solved cleanly overall. Best clean streak: ${bestStreak}.`,
      `What to practice next: ${practiceNext}`,
      ``,
      `Coach's note: every answer in this session was reasoned out by the student, not copied. The coach diagnoses the broken step before correcting it, so the score reflects understanding that will hold up on test day.`,
    ].join("\n");
  }

  async function copyNote() {
    const note = buildProgressNote();
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* session header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-6 py-4">
        <div>
          <p className="text-sm font-black tracking-tight">
            Test Prep Coach, hosted run
          </p>
          <p className="text-xs text-zinc-500">
            {entitled
              ? "Rented run · unlimited session"
              : "Sample run · no checkout needed"}
          </p>
        </div>
        {track && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold transition hover:bg-white/5"
          >
            New session
          </button>
        )}
      </div>

      {/* adaptive HUD */}
      {track && phase !== "done" && (
        <div className="flex flex-wrap gap-2 border-b border-white/10 px-6 py-3">
          {[
            { l: "Difficulty", v: TIER_LABELS[tier] },
            { l: "Streak", v: String(streak) },
            {
              l: "Solved",
              v: `${results.length} / ${SESSION_LENGTH}`,
            },
            { l: "Hints used", v: String(sessionHints) },
          ].map((s) => (
            <span
              key={s.l}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
            >
              {s.l}: <span className="font-bold text-zinc-100">{s.v}</span>
            </span>
          ))}
        </div>
      )}

      {phase === "pick" ? (
        <div className="p-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            Pick your test. The coach diagnoses before it drills, adapts the
            difficulty problem by problem, and never hands over an answer you
            have not reasoned toward. Every session ends with a progress note
            a parent can read.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {TESTPREP_TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pickTrack(t)}
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
                  m.role === "coach" ? "flex justify-start" : "flex justify-end"
                }
              >
                <div
                  className={
                    m.role === "coach"
                      ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-zinc-200"
                      : "max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-cyan-400 px-4 py-3 text-sm font-medium leading-relaxed text-ink"
                  }
                >
                  {m.role === "coach" && (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                      Test Prep Coach
                    </p>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {phase === "chat" && (
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
                placeholder="Answer the coach, or ask for a hint…"
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
          )}

          {phase === "between" && track && (
            <div className="flex flex-wrap gap-3 border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  beginProblem(track, pendingTier, usedIds, messages)
                }
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-cyan-300"
              >
                Next problem ({TIER_LABELS[pendingTier]})
              </button>
              <button
                type="button"
                onClick={() => setPhase("done")}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:bg-white/5"
              >
                Finish and see the progress note
              </button>
            </div>
          )}

          {phase === "done" && (
            <div className="border-t border-white/10 px-6 py-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Parent progress note
              </p>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-5 font-sans text-sm leading-relaxed text-zinc-200">
                {buildProgressNote()}
              </pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyNote}
                  className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-emerald-300"
                >
                  {copied ? "Copied" : "Copy the progress note"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:bg-white/5"
                >
                  Start a new session
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-600">
                The note is generated from this session only: topics,
                difficulty reached, hint counts, and the recommended next
                practice. Nothing is stored.
              </p>
            </div>
          )}

          {phase === "chat" && (
            <p className="px-6 pb-4 text-xs text-zinc-600">
              Stuck? Type "hint". The coach shrinks the step, and after three
              stuck exchanges it works a parallel problem in full, then
              returns to yours.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
