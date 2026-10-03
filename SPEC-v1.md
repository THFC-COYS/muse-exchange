# Muse Exchange — v1 Spec

Working title: **Muse Exchange**. Repo: `muse-exchange` (public, THFC-COYS).
Tagline: *The App Store for Muse agents. Rent the employee, or buy the franchise.*

## Vision

If Muse is the next internet, agents are the new apps, and every app era gets its
marketplace. The App Store organized mobile software. Muse Exchange organizes
Muse agents: a social directory where anyone can publish an agent, and anyone
else can **rent** it per task for a small fee or **clone** its full blueprint for
a larger one-time fee. The toll booth for the agent economy, built on Muse's
rails first.

## Why now

- Meta launched Muse business connectors (Shopify, Stripe, QuickBooks, Slack,
  Asana, Notion) on 2026-09-29: agents can now touch real business systems.
- Meta open-sourced Muse Gadgets on 2026-10-02: Muse is moving into hardware.
- Meta's M&A proves the thesis: Manus (>$2B, general agents), Moltbook (agent
  social network), Stilla (Meta Business Agent). The transaction layer is the
  unowned piece.
- OpenAI announced a ChatGPT app store at DevDay (Sep 2026) with 30+ partners
  and 1.2B weekly users but no revenue split. The monetization throne is empty.

## The two money rails

1. **Rent (per-run).** A user runs someone else's agent for one task and pays a
   small fee. Creator keeps ~70%, platform takes ~30% (the App Store split).
   Metered via run count or task completion.
2. **Clone (blueprint purchase).** A buyer pays a larger one-time fee for the
   agent's full blueprint: system prompt, tool wiring, connector config, eval
   notes. They own it, can customize and republish derivatives (original creator
   gets an attribution cut on derivative revenue, e.g. 10%).

## Social layer

Agents have public profiles: description, demo video, ratings, run counts,
follower counts, remix/clone counts, category leaderboards. Creators have
profiles with earnings and reputation. This is the "Muse social media" wedge:
discovery is social, not search-box.

## v1 scope (MVP)

- **Publish:** agent manifest (name, tagline, description, category, system
  prompt, required connectors/tools, pricing: rent-per-run and clone price,
  demo video/GIF).
- **Directory:** browse + search + categories + leaderboards (most rented, top
  rated, trending).
- **Rent rail:** one-click run against a published agent; run logging; Stripe
  Connect payouts to creators (test mode first).
- **Clone rail:** one-click blueprint purchase; buyer gets a full export
  (markdown manifest + config JSON) they can import into their own Muse setup.
- **Profiles + ratings:** creator profiles, agent reviews, follow/unfollow.
- **Landing page:** the vision, the demo, "publish your agent" CTA.

Out of scope for v1: native mobile apps, enterprise SSO, usage-based AI
inference billing (rent fee covers it implicitly at first), formal review
process (community ratings only).

## Suggested stack (coder's call)

Web app (Next.js + Tailwind), Postgres, Stripe Connect, hosted agent runtime
adapter for Muse. Keep the agent manifest an open markdown/JSON spec from day
one so blueprints are portable, that portability is a feature, not a risk.

## Data model sketch

`creators`, `agents` (manifest + pricing + stats), `runs` (renter, agent,
status, fee), `clones` (buyer, agent, price, license), `reviews`,
`follows`, `payouts`.

## Milestones

- **M1:** public repo, scaffold, landing page live.
- **M2:** publish flow + directory + profiles.
- **M3:** rent rail with Stripe test payouts.
- **M4:** clone rail with blueprint export.
- **M5:** the demo: "a small business hires a 10-agent workforce in 60
  seconds," filmed for LinkedIn.

## Demo target (the viral asset)

Sixty-second video: a real small business owner opens Muse Exchange, rents ten
agents (bookkeeper, marketer, scheduler, researcher, etc.), and watches them
work. Money visibly moves to creators. That video is the acquisition bait.

## Positioning notes (for later)

- Open-source the manifest spec and the directory; keep the transaction rails
  proprietary. Openness recruits supply, the toll booth captures value.
- Education wedge: students and teachers publish the first 100 agents. Supply
  on day one.
- Never position against Meta. Position as *the marketplace Muse deserves*,
  the answer to OpenAI's DevDay move.
