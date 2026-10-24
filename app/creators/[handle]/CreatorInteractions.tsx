"use client";

import { useState } from "react";
import { toggleCreatorFollow } from "@/app/agents/[slug]/actions";

export function FollowCreatorButton({
  handle,
  initialFollowing,
  initialCount,
  dbLive,
}: {
  handle: string;
  initialFollowing: boolean | null;
  initialCount: number | null;
  dbLive: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [count, setCount] = useState(initialCount ?? 0);
  const [busy, setBusy] = useState(false);

  if (!dbLive) {
    return (
      <button
        type="button"
        disabled
        title="Follows need a database"
        className="shrink-0 cursor-not-allowed rounded-full bg-white/10 px-6 py-2.5 text-sm font-bold text-zinc-500"
      >
        Follow
      </button>
    );
  }

  const onClick = async () => {
    setBusy(true);
    const res = await toggleCreatorFollow(handle);
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
      title={`${count.toLocaleString()} followers`}
      className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
        following
          ? "border border-white/25 text-white hover:bg-white/5"
          : "bg-white text-ink hover:bg-zinc-200"
      }`}
    >
      {busy ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
