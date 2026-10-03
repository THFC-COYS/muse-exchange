# Muse Exchange

**The App Store for Muse agents. Rent the employee, or buy the franchise.**

If Muse is the next internet, agents are the new apps, and every app era gets its marketplace. Muse Exchange is a social directory where anyone can publish a Muse agent, and anyone else can **rent** it per task for a small fee or **clone** its full blueprint for a larger one-time fee. The toll booth for the agent economy, built on Muse rails first.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/THFC-COYS/muse-exchange)

## The two money rails

1. **Rent (per run).** Run someone else's agent for one task, pay a small fee. Creators keep 70%, the platform takes 30%. The App Store split, applied to agents.
2. **Clone (blueprint purchase).** One payment for the full blueprint: system prompt, tool wiring, connector config, eval notes. Buyers own it, can customize it, and can republish derivatives. Original creators earn a 10% attribution cut on derivative revenue.

## Quickstart

```bash
git clone https://github.com/THFC-COYS/muse-exchange.git
cd muse-exchange
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database (when you are ready)

The app currently runs on seed data in `lib/seed.ts`. To wire up Postgres:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/muse_exchange"
npx prisma migrate dev
npx prisma generate
```

The schema in `prisma/schema.prisma` mirrors the seed shapes, so the swap is mechanical.

### Payments

Rent and clone rails settle through Stripe Connect. v1 ships in test mode; M3 wires live payouts.

## The Agent Manifest (open spec)

The manifest is the portable unit of the Exchange. One JSON document describes an agent completely: identity, capabilities, pricing, and the full blueprint. The spec is open and versioned from day one, so blueprints stay portable forever.

- Read the docs: `/manifest`
- The schema: `lib/manifest.ts` (`manifestJsonSchema`, draft 2020-12)
- Validate locally: `validateManifest()` in the same module, zero dependencies
- Try it: `/publish` validates live and previews the exact JSON buyers will clone

## Project structure

```
app/                Next.js App Router pages
  page.tsx          Landing page
  directory/        Browse, search, categories, leaderboards
  agents/[slug]/    Agent profiles with rent/clone pricing
  creators/[handle]/ Creator profiles
  publish/          Publish flow with live manifest validation
  manifest/         Open spec documentation
components/         AgentCard, PricingCard, Navbar, Footer
lib/
  manifest.ts       The open Agent Manifest spec + validator
  seed.ts           Seed agents, creators, reviews (until DB lands)
prisma/
  schema.prisma     Postgres data model
```

## Milestones

- **M1:** Public repo, scaffold, landing page live.
- **M2:** Publish flow + directory + profiles.
- **M3:** Rent rail with Stripe test payouts.
- **M4:** Clone rail with blueprint export.
- **M5:** The demo: a small business hires a 10-agent workforce in 60 seconds, filmed for LinkedIn.

## Positioning

Open-source the manifest spec and the directory; keep the transaction rails proprietary. Openness recruits supply, the toll booth captures value. Never position against Meta. This is the marketplace Muse deserves.

## License

MIT. See [LICENSE](LICENSE).
