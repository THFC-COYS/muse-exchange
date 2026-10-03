import Link from "next/link";
import AgentCard from "@/components/AgentCard";
import { agents, creators, formatCompact } from "@/lib/seed";

const featured = [...agents].sort((a, b) => b.runCount - a.runCount).slice(0, 6);

const totalRuns = agents.reduce((n, a) => n + a.runCount, 0);
const avgRating =
  Math.round((agents.reduce((n, a) => n + a.rating, 0) / agents.length) * 10) / 10;

const steps = [
  {
    n: "01",
    title: "Publish your manifest",
    text: "Describe your agent, set your rent and clone prices. The open manifest spec keeps your blueprint portable, forever.",
  },
  {
    n: "02",
    title: "Rent it per run",
    text: "Anyone can run your agent in one click. Usage is metered, and payouts flow straight to you. You keep 70 percent.",
  },
  {
    n: "03",
    title: "Clone the blueprint",
    text: "Buyers get the full export and can build on it. You earn an attribution cut on every derivative they sell.",
  },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(139,92,246,0.25),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 text-center sm:pt-32">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Now in public beta, built on Muse rails
          </p>
          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
            The App Store for <span className="text-gradient">Muse agents</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Rent the employee, or buy the franchise. Discover agents built on
            Muse, run them per task for a small fee, or clone the full
            blueprint and make it yours.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/directory"
              className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-ink transition hover:bg-zinc-200 sm:w-auto"
            >
              Browse the directory
            </Link>
            <Link
              href="/publish"
              className="w-full rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5 sm:w-auto"
            >
              Publish your agent
            </Link>
          </div>

          {/* mock transaction ticker */}
          <div className="card mx-auto mt-16 max-w-3xl p-6 text-left">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              Live on the exchange
            </p>
            <div className="mt-4 space-y-3 font-mono text-sm">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                <span className="text-zinc-300">
                  <span className="text-cyan-300">@seedceo</span> rented{" "}
                  <span className="text-white">Boardroom Brief</span>
                </span>
                <span className="text-emerald-300">+$1.75 to @opsly</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                <span className="text-zinc-300">
                  <span className="text-cyan-300">@studygrind</span> cloned{" "}
                  <span className="text-white">Socratic Tutor</span>
                </span>
                <span className="text-emerald-300">+$199 to @learnloop</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                <span className="text-zinc-300">
                  <span className="text-cyan-300">@agency_owner</span> rented{" "}
                  <span className="text-white">Bookkeeper Bot</span>
                </span>
                <span className="text-emerald-300">+$2.45 to @ledgerline</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Every run moves money to a creator. That is the whole idea.
            </p>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-white/10 bg-panel/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {[
            { v: String(agents.length), l: "agents live" },
            { v: formatCompact(totalRuns), l: "runs completed" },
            { v: String(creators.length), l: "creators earning" },
            { v: avgRating.toFixed(1), l: "average rating" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-4xl font-black tracking-tight">{s.v}</p>
              <p className="mt-1 text-sm text-zinc-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RENT VS CLONE */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-violet-300">
          Two money rails
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-black tracking-tight sm:text-5xl">
          Rent the employee. <span className="text-gradient">Buy the franchise.</span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              Rent
            </p>
            <p className="mt-3 text-2xl font-bold">Per-run access</p>
            <p className="mt-3 leading-relaxed text-zinc-400">
              Pay a small fee each time you run someone&apos;s agent. Perfect
              for one-off tasks: a syllabus, a briefing, a month-end close.
              No commitment, no setup.
            </p>
            <p className="mt-6 rounded-xl bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200">
              Creators keep 70% of every rent. The App Store split, applied to
              agents.
            </p>
          </div>
          <div className="card p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
              Clone
            </p>
            <p className="mt-3 text-2xl font-bold">The full blueprint</p>
            <p className="mt-3 leading-relaxed text-zinc-400">
              One payment, full ownership. The system prompt, tool wiring,
              connector config, and eval notes, exported as a portable
              manifest. Customize it, republish derivatives.
            </p>
            <p className="mt-6 rounded-xl bg-violet-400/10 px-4 py-3 text-sm font-semibold text-violet-200">
              Original creators earn 10% on every derivative sold. Build on
              shoulders, pay the shoulders.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
              Most rented this week
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Featured agents
            </h2>
          </div>
          <Link
            href="/directory"
            className="hidden text-sm font-semibold text-zinc-400 transition hover:text-white sm:block"
          >
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((a) => (
            <AgentCard key={a.slug} agent={a} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-white/10 bg-panel/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-violet-300">
            How it works
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-black tracking-tight sm:text-5xl">
            Three steps to the agent economy
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="card p-8">
                <p className="text-gradient text-5xl font-black">{s.n}</p>
                <p className="mt-4 text-xl font-bold">{s.title}</p>
                <p className="mt-3 leading-relaxed text-zinc-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREATOR CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
          Your best prompts are <span className="text-gradient">assets</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          That agent you built for yourself, the one that saves you five hours
          a week? Thousands of people would pay to rent it. Publish in
          minutes, earn on every rent and every clone.
        </p>
        <Link
          href="/publish"
          className="mt-10 inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-10 py-4 text-sm font-bold text-white transition hover:opacity-90"
        >
          Publish your agent
        </Link>
        <p className="mt-4 text-xs text-zinc-500">
          Free to list. You keep 70% of rents, forever.
        </p>
      </section>
    </div>
  );
}
