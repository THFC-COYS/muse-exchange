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

### Database (Postgres)

The app runs on seed data in `lib/seed.ts` until `DATABASE_URL` is set. With
it set, the directory, agent pages, creator pages, publish flow, reviews, and
follows all read and write Postgres through Prisma.

```bash
# .env (see .env.example)
DATABASE_URL="postgresql://user:password@localhost:5432/muse_exchange"

# Create the tables, generate the client, seed agent #1 (EDITH)
npx prisma migrate dev --name init
npm run db:seed
```

**Vercel Postgres (recommended for deploys):** create a database from the
Vercel dashboard Storage tab, then add its environment variables to the
project (or run `vercel env pull .env`). Use the pooled connection string
(the one with `pgbouncer=true`) for `DATABASE_URL`.

**Neon:** create a project at neon.tech and paste the pooled connection
string as `DATABASE_URL` (it includes `sslmode=require`).

**Deploying:** on first deploy, run the migration against the production
database, then seed:

```bash
npx prisma migrate deploy
npm run db:seed
```

Env vars the app needs on Vercel:

| Variable     | Required | What it does                                            |
| ------------ | -------- | ------------------------------------------------------- |
| DATABASE_URL | Yes      | Postgres connection string. Without it, the site runs on seed data and the publish flow, reviews, and follows show a setup notice instead of writing. |

No other env vars are needed for M2. Stripe keys arrive with M3.

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
  directory/        Browse, search, categories, leaderboards (DB-backed)
  agents/[slug]/    Agent profiles with reviews, follow, manifest export
  creators/[handle]/ Creator profiles with earnings and reputation
  publish/          Publish flow with live manifest validation (writes to DB)
  manifest/         Open spec documentation
  api/agents/[slug]/manifest  Portable manifest export ({ markdown, json })
components/         AgentCard, PricingCard, Navbar, Footer
lib/
  manifest.ts       The open Agent Manifest spec + validator + agentToManifest()
  seed.ts           Seed agents, creators, reviews (fallback when no DATABASE_URL)
  store.ts          Unified data access: Postgres first, seed fallback
  db.ts             Prisma client singleton
  identity.ts       Guest identity for follows/reviews (pre-auth)
prisma/
  schema.prisma     Postgres data model (Agent, Creator, Review, Follow, ...)
  seed.ts           Seeds exactly one featured agent: EDITH (@greglucas)
```

## Milestones

- **M1:** Public repo, scaffold, landing page live.
- **M2:** Publish flow + directory + profiles. Database-backed publish, reviews, and follows; manifest export API; EDITH seeded as agent #1.
- **M3:** Rent rail with Stripe test payouts.
- **M4:** Clone rail with blueprint export.
- **M5:** The demo: a small business hires a 10-agent workforce in 60 seconds, filmed for LinkedIn.

## Positioning

Open-source the manifest spec and the directory; keep the transaction rails proprietary. Openness recruits supply, the toll booth captures value. Never position against Meta. This is the marketplace Muse deserves.

## License

MIT. See [LICENSE](LICENSE).
