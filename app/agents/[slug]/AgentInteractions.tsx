"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitReview, toggleAgentFollow, type ReviewState } from "./actions";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-panel px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-400 focus:outline-none";

/* ------------------------- follow button ------------------------- */

export function FollowButton({
  slug,
  initialFollowing,
  initialCount,
  dbLive,
}: {
  slug: string;
  initialFollowing: boolean | null;
  initialCount: number;
  dbLive: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  if (!dbLive) {
    return (
      <button
        type="button"
        disabled
        title="Follows need a database"
        className="w-full cursor-not-allowed rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-zinc-500"
      >
        Follow · {count.toLocaleString()}
      </button>
    );
  }

  const onClick = async () => {
    setBusy(true);
    const res = await toggleAgentFollow(slug);
    setBusy(false);
    if (res.ok) {
      setFollowing(res.following);
      setCount(res.count);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`w-full rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
        following
          ? "border border-white/25 text-white hover:bg-white/5"
          : "bg-white text-ink hover:bg-zinc-200"
      }`}
    >
      {busy ? "..." : following ? "Following" : "Follow"} ·{" "}
      {count.toLocaleString()}
    </button>
  );
}

/* -------------------------- review form -------------------------- */

function ReviewSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-zinc-200 disabled:opacity-40"
    >
      {pending ? "Posting..." : "Post review"}
    </button>
  );
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className={`text-2xl transition ${
            n <= value ? "text-amber-300" : "text-zinc-600 hover:text-zinc-400"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ slug, dbLive }: { slug: string; dbLive: boolean }) {
  const [stars, setStars] = useState(5);
  const [state, formAction] = useFormState(
    submitReview.bind(null, slug),
    { ok: false, errors: [] } as ReviewState
  );
  const [posted, setPosted] = useState(false);

  if (!dbLive) {
    return (
      <div className="card p-6">
        <p className="text-sm text-zinc-400">
          Reviews are stored in the database. Set{" "}
          <span className="font-mono text-zinc-200">DATABASE_URL</span> to
          enable them.
        </p>
      </div>
    );
  }

  if (posted && state.ok) {
    return (
      <div className="card border-emerald-400/30 p-6">
        <p className="font-bold text-emerald-300">Review posted.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Thanks for rating this agent. The community thanks you too.
        </p>
        <button
          type="button"
          onClick={() => setPosted(false)}
          className="mt-4 text-sm font-bold text-white hover:text-violet-300"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      action={(fd) => {
        fd.set("rating", String(stars));
        formAction(fd);
        setPosted(true);
      }}
      className="card space-y-4 p-6"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Write a review
      </p>
      {state.errors.length > 0 && (
        <ul className="space-y-1 text-sm text-red-300">
          {state.errors.map((e) => (
            <li key={e}>· {e}</li>
          ))}
        </ul>
      )}
      <StarInput value={stars} onChange={setStars} />
      <input
        name="displayName"
        className={inputCls}
        placeholder="Your name (optional)"
        maxLength={60}
      />
      <textarea
        name="text"
        required
        minLength={10}
        maxLength={1000}
        className={inputCls + " min-h-24"}
        placeholder="What did you rent it for? What worked, what did not?"
      />
      <ReviewSubmit />
    </form>
  );
}

/* ------------------------ manifest button ------------------------ */

export function ManifestButton({ slug, name }: { slug: string; name: string }) {
  return (
    <a
      href={`/api/agents/${slug}/manifest?format=markdown`}
      download={`${slug}.manifest.md`}
      className="block w-full rounded-full border border-white/20 px-5 py-2.5 text-center text-sm font-bold transition hover:bg-white/5"
    >
      Export manifest (.md)
    </a>
  );
}
