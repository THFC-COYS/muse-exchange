import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAgentBySlug } from "@/lib/store";
import SocraticRunner from "./SocraticRunner";
import TestPrepRunner from "./TestPrepRunner";
import GenericRunner from "./GenericRunner";

export const dynamic = "force-dynamic";

/**
 * Hosted run page for an agent.
 *
 * Reachable by anyone for the SAMPLE run (no checkout needed), which is
 * what makes the listing honest: you can watch the agent work before you
 * pay. A visitor whose browser carries the mx_entitlement cookie for this
 * slug (set only by /api/checkout/confirm after Stripe verifies a paid
 * session) gets the RENTED run framing instead: unlimited session.
 */
export default async function RunPage({
  params,
}: {
  params: { slug: string };
}) {
  const agent = await getAgentBySlug(params.slug);
  if (!agent) notFound();

  const entitlement = cookies().get("mx_entitlement")?.value;
  const entitled =
    entitlement === `${agent.slug}:rent` ||
    entitlement === `${agent.slug}:clone`;
  const entitlementKind =
    entitlement === `${agent.slug}:clone` ? "clone" : "rent";

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm text-zinc-500">
        <Link href="/directory" className="transition hover:text-white">
          Directory
        </Link>{" "}
        /{" "}
        <Link
          href={`/agents/${agent.slug}`}
          className="transition hover:text-white"
        >
          {agent.name}
        </Link>{" "}
        / <span className="text-zinc-300">Run</span>
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-300">
          {agent.category}
        </span>
        <span className="text-xs text-zinc-500">v{agent.version}</span>
        {entitled ? (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
            {entitlementKind === "clone" ? "Clone owner" : "Rented run"} ·
            unlimited session
          </span>
        ) : (
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cyan-300">
            Sample run · free
          </span>
        )}
      </div>

      <h1 className="mt-4 text-4xl font-black tracking-tight">
        {agent.name}, hosted run
      </h1>
      <p className="mt-3 text-lg text-zinc-400">{agent.tagline}</p>
      <p className="mt-2 text-sm text-zinc-500">
        {entitled
          ? "This browser completed checkout for this agent, so this session is unlimited."
          : "You are running the sample. It is the real agent behavior, free, so you can judge it before renting. Renting from the listing unlocks unlimited sessions."}
      </p>

      <div className="mt-10">
        {agent.slug === "socratic-tutor" ? (
          <SocraticRunner entitled={entitled} />
        ) : agent.slug === "test-prep-coach" ? (
          <TestPrepRunner entitled={entitled} />
        ) : (
          <GenericRunner agent={agent} entitled={entitled} />
        )}
      </div>

      <p className="mt-10 text-center text-xs text-zinc-600">
        Runs are hosted by Muse Exchange.{" "}
        <Link
          href={`/agents/${agent.slug}`}
          className="font-semibold text-zinc-400 transition hover:text-white"
        >
          Back to the listing
        </Link>{" "}
        to rent or clone {agent.name}.
      </p>
    </div>
  );
}
