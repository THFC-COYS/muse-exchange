import Link from "next/link";
import PublishForm from "./PublishForm";
import { isDatabaseLive } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PublishPage() {
  const live = await isDatabaseLive();

  if (!live) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="card p-12">
          <p className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-3xl">
            !
          </p>
          <h1 className="mt-6 text-3xl font-black tracking-tight">
            Publishing needs a database
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-zinc-400">
            The publish flow writes straight to Postgres. Set{" "}
            <span className="font-mono text-zinc-200">DATABASE_URL</span> and
            run the Prisma migration and seed, then come back. The README has
            the full setup.
          </p>
          <Link
            href="/directory"
            className="mt-8 inline-block rounded-full border border-white/20 px-8 py-3 text-sm font-bold transition hover:bg-white/5"
          >
            Browse the directory instead
          </Link>
        </div>
      </div>
    );
  }

  return <PublishForm />;
}
