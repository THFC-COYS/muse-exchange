import { NextResponse } from "next/server";
import { getAgentBySlug, toManifestSource } from "@/lib/store";
import { agentToManifest } from "@/lib/manifest";

export const dynamic = "force-dynamic";

/**
 * GET /api/agents/[slug]/manifest
 *
 * Returns the portable manifest for an agent: { markdown, json }.
 * This is the exact payload shape the M4 clone rail will hand to buyers.
 * Pass ?format=markdown for a downloadable markdown document.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const agent = await getAgentBySlug(params.slug);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const exported = agentToManifest(toManifestSource(agent));
  const url = new URL(_req.url);

  if (url.searchParams.get("format") === "markdown") {
    return new Response(exported.markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${agent.slug}.manifest.md"`,
      },
    });
  }

  return NextResponse.json(exported);
}
