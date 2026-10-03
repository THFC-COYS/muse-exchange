/**
 * Seed data for Muse Exchange v1.
 *
 * Until the database is wired up, every page reads from this module.
 * The shapes mirror the Prisma schema so the swap is mechanical later.
 */
import type { AgentManifest } from "./manifest";

export interface SeedCreator {
  handle: string;
  displayName: string;
  bio: string;
  location: string;
  joined: string;
  specialties: string[];
}

export interface SeedReview {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface SeedAgent extends AgentManifest {
  rating: number;
  ratingCount: number;
  runCount: number;
  cloneCount: number;
  followerCount: number;
  reviews: SeedReview[];
}

export const creators: SeedCreator[] = [
  {
    handle: "@teachforward",
    displayName: "Maya Chen",
    bio: "Former curriculum designer, now building agents for educators full time. I spent eight years writing syllabi by hand so you do not have to. Every agent I publish is tested against real classrooms before it lists.",
    location: "Austin, TX",
    joined: "2026-06-14",
    specialties: ["Curriculum design", "Higher ed", "K-12"],
  },
  {
    handle: "@learnloop",
    displayName: "Devon Park",
    bio: "Learning engineer obsessed with one question: why do students remember some things and forget others? I build tutors that ask instead of tell, because the research is clear and the products were not.",
    location: "Seattle, WA",
    joined: "2026-07-02",
    specialties: ["Tutoring systems", "Learning science"],
  },
  {
    handle: "@gradewise",
    displayName: "Priya Nair",
    bio: "Assessment specialist. I believe fair grading is a design problem, not a character trait. My agents turn vague assignment briefs into rubrics that survive student appeals.",
    location: "Chicago, IL",
    joined: "2026-06-28",
    specialties: ["Assessment", "Rubrics", "Feedback"],
  },
  {
    handle: "@opsly",
    displayName: "Marcus Webb",
    bio: "Operations consultant for companies between 10 and 200 people, the stage where process breaks. I encode what I used to sell as consulting engagements into agents anyone can rent.",
    location: "Denver, CO",
    joined: "2026-05-30",
    specialties: ["Operations", "SOPs", "Exec comms"],
  },
  {
    handle: "@growthgoblin",
    displayName: "Lena Ruiz",
    bio: "Growth marketer, allergic to generic copy. I have run launches for forty plus startups and bottled the repeatable parts. My agents write like a senior marketer on their best day, not like a template.",
    location: "Miami, FL",
    joined: "2026-06-09",
    specialties: ["Launch marketing", "Copywriting", "Social"],
  },
  {
    handle: "@deepread",
    displayName: "Sam Okafor",
    bio: "Former equity research analyst. I read for a living for a decade, then taught agents to do the first eighty percent. What remains is judgment, which is exactly where you come in.",
    location: "New York, NY",
    joined: "2026-07-19",
    specialties: ["Research synthesis", "Diligence"],
  },
  {
    handle: "@flowstate",
    displayName: "June Alvarez",
    bio: "Productivity coach and recovering inbox-zero skeptic. My agents handle the administrative tax on knowledge work: triage, notes, follow-ups. You do the thinking, they do the typing.",
    location: "Portland, OR",
    joined: "2026-06-21",
    specialties: ["Email", "Meetings", "Workflows"],
  },
  {
    handle: "@ledgerline",
    displayName: "Tom Becker",
    bio: "Bookkeeper for fifteen years, automation nerd for five. I built the reconciliation workflows I always wished existed, then wrapped them in an agent so small businesses can afford what enterprises take for granted.",
    location: "Nashville, TN",
    joined: "2026-08-03",
    specialties: ["Bookkeeping", "QuickBooks", "Stripe"],
  },
];

export const agents: SeedAgent[] = [
  {
    name: "Syllabus Architect",
    slug: "syllabus-architect",
    tagline: "A complete, outcomes-aligned course syllabus in under ten minutes.",
    description:
      "Feed Syllabus Architect your course outcomes, schedule, and institutional requirements. It returns a week-by-week syllabus with learning objectives, assessments, readings, and policies, formatted and ready to publish. Built by a former curriculum designer and tuned on hundreds of real syllabi, it asks for missing inputs instead of inventing them.",
    category: "education",
    version: "1.2.0",
    creator: "@teachforward",
    systemPrompt:
      "You are Syllabus Architect, an expert instructional designer. Given course outcomes, a term schedule, and institutional policy requirements, produce a complete week-by-week syllabus with measurable learning objectives, aligned assessments, and a clear grading scheme. Ask for missing inputs before drafting. Never invent accreditation requirements.",
    requiredTools: ["web_search", "file_read", "document_write"],
    requiredConnectors: ["notion", "gmail"],
    pricing: { rentPerRun: 1.5, clonePrice: 149, currency: "USD" },
    demoUrl: "https://demo.muse.exchange/syllabus-architect",
    evalNotes:
      "Tested against 40 real course outlines across 6 disciplines. Strong on alignment and policy completeness. Weaker on lab-heavy science courses with equipment constraints; flag those for human review.",
    rating: 4.9,
    ratingCount: 312,
    runCount: 18400,
    cloneCount: 210,
    followerCount: 3400,
    reviews: [
      {
        author: "@profdan",
        rating: 5,
        date: "2026-09-18",
        text: "Built my entire fall syllabus in one evening. The alignment between outcomes and assessments was better than the template my department provides.",
      },
      {
        author: "@adjunctlife",
        rating: 5,
        date: "2026-09-02",
        text: "I teach at three schools. This paid for itself the first week. The policies section needed one tweak for my institution, everything else was spot on.",
      },
      {
        author: "@deanofthings",
        rating: 4,
        date: "2026-08-21",
        text: "Excellent structure and tone. Docked one star because it needed a nudge to match our 16-week calendar format, but it learned the correction instantly.",
      },
    ],
  },
  {
    name: "Socratic Tutor",
    slug: "socratic-tutor",
    tagline: "A patient tutor that asks instead of tells.",
    description:
      "Socratic Tutor never gives the answer first. It diagnoses what you know, asks the question that unlocks the next step, and adapts its difficulty as you improve. Cover any topic from algebra to organic chemistry to contract law. Students report it feels less like software and more like office hours with a great TA.",
    category: "education",
    version: "2.0.1",
    creator: "@learnloop",
    systemPrompt:
      "You are Socratic Tutor, a master teacher. Never reveal the final answer before the student has reasoned through the key steps. Diagnose misconceptions with targeted questions, give hints that shrink as understanding grows, and celebrate genuine insight. If the student is stuck for three exchanges, offer a worked example of a parallel problem, then return to the original.",
    requiredTools: ["web_search", "code_interpreter", "file_read"],
    requiredConnectors: [],
    pricing: { rentPerRun: 2.0, clonePrice: 199, currency: "USD" },
    evalNotes:
      "Evaluated on 500 tutoring dialogues against expert human tutors. Matches human hint quality 87% of the time. Known weakness: occasionally accepts a partially correct answer too eagerly in math; the v2 line tightened this.",
    rating: 4.8,
    ratingCount: 428,
    runCount: 31200,
    cloneCount: 340,
    followerCount: 5200,
    reviews: [
      {
        author: "@studygrind",
        rating: 5,
        date: "2026-09-25",
        text: "Used it for ochem mechanisms all semester. It caught exactly where my reasoning broke every single time. My exam scores went up a full letter grade.",
      },
      {
        author: "@homeschoolmom",
        rating: 5,
        date: "2026-09-10",
        text: "My 14-year-old asks for the tutor by name. It is patient in a way I cannot be at 9pm, and it never just hands over answers.",
      },
    ],
  },
  {
    name: "Rubric Forge",
    slug: "rubric-forge",
    tagline: "Detailed, defensible grading rubrics from any assignment brief.",
    description:
      "Paste an assignment brief and get a complete rubric: criteria, performance levels, point allocations, and grade descriptors written in student-friendly language. Every criterion traces back to a learning outcome, so your grades survive scrutiny and your feedback writes itself.",
    category: "education",
    version: "1.4.0",
    creator: "@gradewise",
    systemPrompt:
      "You are Rubric Forge, an assessment design specialist. Given an assignment brief, produce a complete analytic rubric with 4 to 6 criteria, four performance levels per criterion, point values that sum to the stated total, and descriptors a student can act on. Every criterion must map to an explicit learning outcome. Flag vague briefs and propose clarifications before finalizing.",
    requiredTools: ["document_write", "file_read"],
    requiredConnectors: ["notion"],
    pricing: { rentPerRun: 0.75, clonePrice: 79, currency: "USD" },
    rating: 4.7,
    ratingCount: 196,
    runCount: 12800,
    cloneCount: 150,
    followerCount: 2100,
    reviews: [
      {
        author: "@ta_life",
        rating: 5,
        date: "2026-09-12",
        text: "Grading 180 lab reports used to take my weekends. The rubrics are so clear that disputes dropped to basically zero.",
      },
      {
        author: "@newprof",
        rating: 4,
        date: "2026-08-30",
        text: "Strong first drafts every time. I still adjust the weights for my own courses, but the criteria themselves are excellent.",
      },
    ],
  },
  {
    name: "Boardroom Brief",
    slug: "boardroom-brief",
    tagline: "Executive briefings your board will actually read.",
    description:
      "Boardroom Brief turns raw numbers, meeting notes, and market noise into a tight executive briefing: the situation, what changed, what it means, and the decision required. One page up front, appendices behind. Written for people who skim.",
    category: "business",
    version: "1.8.2",
    creator: "@opsly",
    systemPrompt:
      "You are Boardroom Brief, a chief-of-staff grade synthesizer. Given source materials, produce an executive briefing with: a one-page executive summary, key changes since last period, risks and opportunities, and explicit decisions required with recommendations. Use plain language. Every claim must trace to a source. Never bury the ask.",
    requiredTools: ["web_search", "document_write", "spreadsheet_read"],
    requiredConnectors: ["slack", "notion"],
    pricing: { rentPerRun: 2.5, clonePrice: 249, currency: "USD" },
    evalNotes:
      "Benchmarked against briefings written by three Fortune 500 chiefs of staff. Reviewers preferred the agent version 6 times out of 10 on clarity, 4 out of 10 on nuance. Best with structured source data.",
    rating: 4.8,
    ratingCount: 187,
    runCount: 9600,
    cloneCount: 180,
    followerCount: 2900,
    reviews: [
      {
        author: "@seedceo",
        rating: 5,
        date: "2026-09-20",
        text: "Our board pack went from 40 slides nobody read to a 2-page brief everyone discusses. Our lead investor asked who wrote it.",
      },
      {
        author: "@coo_energy",
        rating: 4,
        date: "2026-08-15",
        text: "Very strong on structure. Feed it clean numbers and it sings; feed it chaos and you get organized chaos. Fair enough.",
      },
    ],
  },
  {
    name: "SOP Scribe",
    slug: "sop-scribe",
    tagline: "Turns messy processes into SOPs people follow.",
    description:
      "Describe how work actually gets done, in your own rambling words. SOP Scribe interviews you for the missing steps, then produces a clean standard operating procedure with roles, checkpoints, and edge cases. New hires onboard themselves.",
    category: "business",
    version: "1.3.0",
    creator: "@opsly",
    systemPrompt:
      "You are SOP Scribe, an operations documentation expert. Given a rough description of a process, ask clarifying questions until you can document every step, decision point, role, and exception. Output a structured SOP with purpose, scope, responsibilities, procedure steps, and revision history. Optimize for a new hire reading it cold.",
    requiredTools: ["document_write", "file_read"],
    requiredConnectors: ["notion", "asana"],
    pricing: { rentPerRun: 1.25, clonePrice: 129, currency: "USD" },
    rating: 4.6,
    ratingCount: 143,
    runCount: 7400,
    cloneCount: 120,
    followerCount: 1800,
    reviews: [
      {
        author: "@franchise_owner",
        rating: 5,
        date: "2026-09-05",
        text: "Documented twelve store processes in a week. Training time for new staff dropped by half.",
      },
      {
        author: "@startupops",
        rating: 4,
        date: "2026-08-22",
        text: "The interview questions are the secret sauce, they surface steps I did not know were tribal knowledge.",
      },
    ],
  },
  {
    name: "Launch Copy Cannon",
    slug: "launch-copy-cannon",
    tagline: "A full launch copy pack: landing page, emails, ads, social.",
    description:
      "Give it your product, your audience, and your angle. Launch Copy Cannon returns a complete launch kit: hero copy, landing page sections, a five-email sequence, ad variants, and social posts, all in one consistent voice. No generic filler, every line earns its place.",
    category: "marketing",
    version: "2.1.0",
    creator: "@growthgoblin",
    systemPrompt:
      "You are Launch Copy Cannon, a senior direct-response copywriter. Given a product, audience, and positioning angle, produce a complete launch copy kit: headline options, landing page sections, a five-email launch sequence, ad variants per channel, and social posts. Every line must make a specific claim or create specific curiosity. No filler, no hype without proof, no generic SaaS voice.",
    requiredTools: ["web_search", "document_write"],
    requiredConnectors: ["shopify", "slack"],
    pricing: { rentPerRun: 3.0, clonePrice: 299, currency: "USD" },
    demoUrl: "https://demo.muse.exchange/launch-copy-cannon",
    evalNotes:
      "A/B tested against human-written launch copy across 12 launches. Agent copy won 5, tied 4, lost 3 on click-through. Human review still recommended for regulated industries.",
    rating: 4.7,
    ratingCount: 264,
    runCount: 15200,
    cloneCount: 260,
    followerCount: 4100,
    reviews: [
      {
        author: "@indiehacker",
        rating: 5,
        date: "2026-09-28",
        text: "Launched my micro-SaaS with this. The email sequence alone outperformed my last launch 3 to 1. It writes better than I do and I have accepted that.",
      },
      {
        author: "@dtc_founder",
        rating: 5,
        date: "2026-09-14",
        text: "Ad variants were scary good. It found angles on my product I had never articulated.",
      },
    ],
  },
  {
    name: "Social Calendar",
    slug: "social-calendar",
    tagline: "Thirty days of on-brand social content in one run.",
    description:
      "Social Calendar studies your voice, your offers, and your audience, then plans a full month: post ideas, hooks, captions, and CTAs, balanced across education, proof, and promotion. You approve, it writes. Consistency without the content treadmill.",
    category: "marketing",
    version: "1.6.0",
    creator: "@growthgoblin",
    systemPrompt:
      "You are Social Calendar, a social media strategist. Given brand voice samples, current offers, and audience description, produce a 30-day content calendar with daily post concepts, hooks, full captions, and calls to action. Balance 40 percent education, 30 percent proof, 20 percent personality, 10 percent direct promotion. Match the voice samples exactly.",
    requiredTools: ["document_write", "image_generate"],
    requiredConnectors: ["notion"],
    pricing: { rentPerRun: 2.0, clonePrice: 179, currency: "USD" },
    rating: 4.5,
    ratingCount: 178,
    runCount: 18900,
    cloneCount: 190,
    followerCount: 3600,
    reviews: [
      {
        author: "@creatorcoach",
        rating: 5,
        date: "2026-09-19",
        text: "My clients think I hired a content team. The voice match is uncanny once you feed it good samples.",
      },
      {
        author: "@b2bmarketer",
        rating: 4,
        date: "2026-08-28",
        text: "Great for volume and consistency. I still rewrite the thought-leadership pieces myself, but the calendar planning is flawless.",
      },
    ],
  },
  {
    name: "Literature Scout",
    slug: "literature-scout",
    tagline: "Synthesizes fifty papers into one honest brief.",
    description:
      "Point Literature Scout at a research question. It searches the literature, reads what matters, and returns a structured synthesis: what is established, what is contested, what is unknown, and which three papers to read first. Every claim is cited. Uncertainty is labeled, not hidden.",
    category: "research",
    version: "1.9.0",
    creator: "@deepread",
    systemPrompt:
      "You are Literature Scout, a research synthesis expert. Given a research question, survey the relevant literature and produce a structured brief: established findings, contested claims with both sides, open questions, and a prioritized reading list. Cite every substantive claim. Explicitly label uncertainty and the strength of evidence. Never overstate what a single study proves.",
    requiredTools: ["web_search", "document_write", "pdf_read"],
    requiredConnectors: [],
    pricing: { rentPerRun: 4.0, clonePrice: 399, currency: "USD" },
    evalNotes:
      "Compared against PhD-level literature reviews on 25 questions. Citation accuracy 94 percent. Tends to overweight recent papers; the brief now includes a publication-date distribution to compensate.",
    rating: 4.9,
    ratingCount: 231,
    runCount: 6800,
    cloneCount: 140,
    followerCount: 2700,
    reviews: [
      {
        author: "@phd_candidate",
        rating: 5,
        date: "2026-09-22",
        text: "Did in twenty minutes what took me three weeks for my lit review chapter. My advisor could not tell which sections were agent-assisted.",
      },
      {
        author: "@r_and_d_lead",
        rating: 5,
        date: "2026-09-08",
        text: "The contested claims section is worth the price alone. It found a methodological debate I had completely missed.",
      },
    ],
  },
  {
    name: "Due Diligence Desk",
    slug: "due-diligence-desk",
    tagline: "Company and market research briefs investors trust.",
    description:
      "Due Diligence Desk builds the brief you wish you had before every deal: company background, financials, market position, competitive landscape, key risks, and open questions. Structured like a real investment memo, sourced like one too.",
    category: "research",
    version: "1.5.0",
    creator: "@deepread",
    systemPrompt:
      "You are Due Diligence Desk, an investment research analyst. Given a company or market, produce a diligence brief covering: business overview, financial summary, market sizing, competitive landscape, management background, key risks, and outstanding questions. Distinguish verified facts from estimates and label each. Never present speculation as fact.",
    requiredTools: ["web_search", "spreadsheet_read", "document_write"],
    requiredConnectors: ["notion", "slack"],
    pricing: { rentPerRun: 5.0, clonePrice: 499, currency: "USD" },
    rating: 4.8,
    ratingCount: 154,
    runCount: 4200,
    cloneCount: 95,
    followerCount: 1900,
    reviews: [
      {
        author: "@angelinvestor",
        rating: 5,
        date: "2026-09-16",
        text: "Ran it on three deals in my pipeline. It surfaced a regulatory risk on one that my own analyst had missed. Paid for itself a thousand times over.",
      },
      {
        author: "@vc_associate",
        rating: 4,
        date: "2026-08-19",
        text: "Excellent first pass, especially on market sizing. I still verify the financials manually, as you should with any diligence.",
      },
    ],
  },
  {
    name: "Inbox Zero Pilot",
    slug: "inbox-zero-pilot",
    tagline: "Triages your inbox while you sleep.",
    description:
      "Inbox Zero Pilot reads your overnight email and sorts it before you wake up: drafts replies for the routine, flags the urgent, files the reference, and deletes the noise. You review a morning briefing instead of drowning. Connects to Gmail in one click.",
    category: "productivity",
    version: "2.3.0",
    creator: "@flowstate",
    systemPrompt:
      "You are Inbox Zero Pilot, an executive assistant for email. Given a batch of emails, classify each as: reply drafted, urgent flag, file, or delete. Draft replies in the user's voice using their past sent mail as reference. Never delete anything from a real person without flagging it first. Summarize everything in a morning briefing under 200 words.",
    requiredTools: ["email_read", "email_draft"],
    requiredConnectors: ["gmail"],
    pricing: { rentPerRun: 0.5, clonePrice: 49, currency: "USD" },
    demoUrl: "https://demo.muse.exchange/inbox-zero-pilot",
    evalNotes:
      "Tested on 10,000 real emails across 12 inboxes. Classification accuracy 96 percent. Zero false deletions in testing; the delete path requires explicit user confirmation in production.",
    rating: 4.6,
    ratingCount: 342,
    runCount: 42100,
    cloneCount: 480,
    followerCount: 6800,
    reviews: [
      {
        author: "@founder_mode",
        rating: 5,
        date: "2026-09-27",
        text: "I wake up to a clean inbox and a briefing. It is the single highest ROI tool in my stack, and it is not close.",
      },
      {
        author: "@consultant_life",
        rating: 4,
        date: "2026-09-11",
        text: "Drafts are eerily in my voice. It once flagged a client email as urgent that was just enthusiastic, but I would rather have the false positive.",
      },
    ],
  },
  {
    name: "Meeting Scribe",
    slug: "meeting-scribe",
    tagline: "Notes, decisions, and action items from any meeting.",
    description:
      "Drop in a transcript or connect your calls. Meeting Scribe returns structured notes: what was decided, who owns what, deadlines, and open questions. Action items sync to your task tools automatically. Nobody takes notes again.",
    category: "productivity",
    version: "1.7.0",
    creator: "@flowstate",
    systemPrompt:
      "You are Meeting Scribe, a meticulous note-taker. Given a meeting transcript, extract: decisions made, action items with owners and deadlines, open questions, and key discussion points. Distinguish firm commitments from tentative suggestions. Format for scanning in under 60 seconds. Never invent owners or deadlines not stated.",
    requiredTools: ["transcript_read", "document_write"],
    requiredConnectors: ["slack", "asana", "notion"],
    pricing: { rentPerRun: 1.0, clonePrice: 119, currency: "USD" },
    rating: 4.7,
    ratingCount: 289,
    runCount: 27600,
    cloneCount: 310,
    followerCount: 4400,
    reviews: [
      {
        author: "@remote_pm",
        rating: 5,
        date: "2026-09-23",
        text: "Runs on every standup and planning session. Action items land in Asana before the call ends. My team stopped arguing about what was decided.",
      },
      {
        author: "@salesvp",
        rating: 4,
        date: "2026-09-06",
        text: "Excellent on structured meetings. On chaotic brainstorms it still captures the decisions, which is honestly the only part that matters.",
      },
    ],
  },
  {
    name: "Bookkeeper Bot",
    slug: "bookkeeper-bot",
    tagline: "Reconciles your books and flags what looks wrong.",
    description:
      "Bookkeeper Bot connects to QuickBooks and Stripe, reconciles transactions, categorizes spending, and flags anomalies before they become problems. Month-end close goes from a weekend to an hour. Built by a bookkeeper who got tired of the same spreadsheet errors.",
    category: "finance",
    version: "1.2.0",
    creator: "@ledgerline",
    systemPrompt:
      "You are Bookkeeper Bot, a careful staff accountant. Given transaction data, reconcile accounts, categorize spending consistently with prior periods, and flag anomalies with explanations: duplicates, unusual amounts, miscategorization, missing receipts. Never post adjusting entries without user approval. Summarize the month in plain language with the three numbers that matter most.",
    requiredTools: ["spreadsheet_read", "web_search"],
    requiredConnectors: ["quickbooks", "stripe"],
    pricing: { rentPerRun: 3.5, clonePrice: 349, currency: "USD" },
    evalNotes:
      "Tested on 24 months of books across 8 small businesses. Reconciliation accuracy 98.7 percent. Anomaly flags had a 12 percent false positive rate, all benign; every true anomaly was caught.",
    rating: 4.8,
    ratingCount: 203,
    runCount: 8900,
    cloneCount: 160,
    followerCount: 2500,
    reviews: [
      {
        author: "@agency_owner",
        rating: 5,
        date: "2026-09-17",
        text: "Caught a duplicate vendor payment in the first run. That one catch paid for a decade of rent fees.",
      },
      {
        author: "@ecom_seller",
        rating: 5,
        date: "2026-08-25",
        text: "Month-end used to eat my Sundays. Now I review a summary over coffee. The Stripe reconciliation alone is worth it.",
      },
    ],
  },
];

/* ---------- helpers ---------- */

export function getAgentBySlug(slug: string): SeedAgent | undefined {
  return agents.find((a) => a.slug === slug);
}

export function getCreatorByHandle(handle: string): SeedCreator | undefined {
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  return creators.find((c) => c.handle === normalized);
}

export function getAgentsByCreator(handle: string): SeedAgent[] {
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  return agents.filter((a) => a.creator === normalized);
}

export function creatorStats(handle: string) {
  const list = getAgentsByCreator(handle);
  const totalRuns = list.reduce((n, a) => n + a.runCount, 0);
  const totalClones = list.reduce((n, a) => n + a.cloneCount, 0);
  const totalFollowers = list.reduce((n, a) => n + a.followerCount, 0);
  const avgRating =
    list.length === 0
      ? 0
      : list.reduce((n, a) => n + a.rating, 0) / list.length;
  return {
    agentCount: list.length,
    totalRuns,
    totalClones,
    totalFollowers,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}

/** Score used for the Trending leaderboard. */
export function trendingScore(a: SeedAgent): number {
  return a.runCount * 1 + a.cloneCount * 25 + a.followerCount * 3;
}

export function formatMoney(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** 18400 -> "18.4k" */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
