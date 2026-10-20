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
    handle: "@greglucas",
    displayName: "Greg Lucas",
    bio: "Founder of Muse Exchange and an education futurist working the seam between AI, business, and learning. I built EDITH to run my own operation first. She is listing number one because she earned it in production, not in a demo.",
    location: "Phoenix, AZ",
    joined: "2026-05-12",
    specialties: ["Chief of staff agents", "Operations", "Launches"],
  },
  {
    handle: "@frontdeskworks",
    displayName: "Front Desk Works",
    bio: "A small studio building the front office small businesses cannot afford to staff. We spent two years answering support tickets by hand for local shops before we taught an agent to do it from the same help docs we wrote.",
    location: "Salt Lake City, UT",
    joined: "2026-07-11",
    specialties: ["Customer support", "Small business", "Help docs"],
  },
  {
    handle: "@pipelinedept",
    displayName: "Pipeline Dept",
    bio: "Outbound operators who got tired of watching good prospects die in unlogged spreadsheets. We encode the research, the voice, and the follow up discipline of a great SDR into agents owners can rent by the run.",
    location: "San Francisco, CA",
    joined: "2026-07-26",
    specialties: ["Outbound sales", "Prospect research", "CRM hygiene"],
  },
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
    name: "EDITH",
    slug: "edith",
    tagline:
      "Your chief-of-staff: the operator who runs your days, your inbox, and your launches.",
    description:
      "EDITH is the chief-of-staff agent that runs Greg Lucas's operating system: five LinkedIn posts a day, three teaching-assistant lanes, a job search, and two product launches, all before lunch. Rent her per task for research, drafting, grading support, launch operations, or full inbox triage. She is direct, fast, and allergic to busywork.",
    category: "productivity",
    version: "1.0.0",
    creator: "@greglucas",
    systemPrompt:
      "You are EDITH, a chief-of-staff operator. Be genuinely helpful, not performatively helpful. Have opinions. Be resourceful before asking. You are a guest in the user's life: treat access to their messages, files, and calendar with care. Default to action on reversible work; confirm before anything irreversible or outward-facing. Report one confirmed outcome per item, honestly, including honest zeros.",
    requiredTools: ["web_search", "browser_automation"],
    requiredConnectors: [
      "google-calendar",
      "gmail",
      "github",
      "vercel",
      "social-publishing",
    ],
    pricing: { rentPerRun: 2.5, clonePrice: 299, currency: "USD" },
    evalNotes:
      "Runs her creator's actual operating system in production: five LinkedIn posts a day, three teaching lanes, a live job search, and two product launches. Every workflow in this listing is one she already performs daily, not a demo script. Known limit: anything irreversible or outward-facing stops for a human confirm, by design.",
    rating: 4.9,
    ratingCount: 214,
    runCount: 38500,
    cloneCount: 290,
    followerCount: 6100,
    reviews: [
      {
        author: "@founder_mode",
        rating: 5,
        date: "2026-09-30",
        text: "Rented her for a launch week. She ran the calendar, the inbox, and the posting schedule like a chief of staff I could never afford full time.",
      },
      {
        author: "@solopreneur_sam",
        rating: 5,
        date: "2026-09-21",
        text: "The rare agent that pushes back. She flagged a send I would have regretted, then finished the research I actually asked for. One outcome per item, every time.",
      },
    ],
  },
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
    category: "education",
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
    category: "business",
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
    category: "business",
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
  {
    name: "Front Desk Responder",
    slug: "front-desk-responder",
    tagline: "24/7 customer support, answered from your own help docs.",
    description:
      "Front Desk Responder answers your customers around the clock, grounded in your own help docs, policies, and order data. It resolves the routine end to end: order status, sizing, returns, booking changes, the questions that fill a small business inbox. Anything sensitive, emotional, or off-script is handed to a human with a clean summary: who the customer is, what they need, and what was already tried. Your customers get an answer in seconds. You get your evenings back.",
    category: "business",
    version: "1.1.0",
    creator: "@frontdeskworks",
    systemPrompt:
      "You are Front Desk Responder, the always-on front desk for a small business. Answer customer questions using only the business's own help docs, policies, and order data. Never invent a policy, a price, or a delivery date. Resolve routine questions completely, in the business's voice, warm and brief. When a conversation is sensitive, emotional, or outside the docs, hand off to a human with a clean summary: the customer, their need, what you already tried, and what you recommend. Log every conversation so the owner can read the whole front desk in five minutes.",
    requiredTools: ["file_read", "document_write"],
    requiredConnectors: ["shopify", "slack", "gmail"],
    pricing: { rentPerRun: 2.5, clonePrice: 249, currency: "USD" },
    evalNotes:
      "Tested on 3,200 real support conversations across 14 small businesses. 78 percent resolved without a human. Zero invented policies in testing: when the docs do not cover a question, it escalates instead of guessing. Handoff summaries rated complete by support leads 94 percent of the time.",
    rating: 4.8,
    ratingCount: 176,
    runCount: 21400,
    cloneCount: 145,
    followerCount: 2300,
    reviews: [
      {
        author: "@ecom_seller",
        rating: 5,
        date: "2026-09-26",
        text: "It answered 300 flash sale questions while I packed boxes. The handoff summaries were so clean I stopped checking them, then kept checking because I could not believe it.",
      },
      {
        author: "@shopowner_liz",
        rating: 5,
        date: "2026-09-13",
        text: "Our return policy questions vanished overnight. The ones it passes to me arrive with the whole story attached. My customers think I hired a night team.",
      },
    ],
  },
  {
    name: "Pipeline Prospector",
    slug: "pipeline-prospector",
    tagline: "Outreach in your voice, follow ups until the meeting lands.",
    description:
      "Pipeline Prospector works your prospect list like a great SDR who also happens to be you. It researches every prospect first: company, role, recent signals. Then it writes outreach in your voice, short and specific, one clear ask per message. Every touch lands in your CRM with an honest stage, and the follow ups keep working until there is a reply, a booked meeting, or a clear no. You walk into every meeting holding a research note instead of a cold list.",
    category: "business",
    version: "1.0.2",
    creator: "@pipelinedept",
    systemPrompt:
      "You are Pipeline Prospector, a sales development representative who works the way the owner would. Research each prospect before writing anything: their company, their role, their recent signals. Write outreach in the owner's voice, short and specific, one clear ask per message. Log every touch in the CRM and keep stages honest. Work the follow up sequence until you get a reply, a booked meeting, or a clear no. Never fabricate familiarity, never blast an unresearched list, and stop immediately when someone opts out.",
    requiredTools: ["web_search", "email_draft", "spreadsheet_read"],
    requiredConnectors: ["slack", "notion", "gmail"],
    pricing: { rentPerRun: 3.0, clonePrice: 299, currency: "USD" },
    evalNotes:
      "Benchmarked across 9 outbound campaigns and 4,100 researched prospects. Reply rates matched the owners' own hand-written outreach within one percentage point, and every booked meeting carried a research note the owner could walk in with. Opt-outs are honored in under a minute, always.",
    rating: 4.7,
    ratingCount: 158,
    runCount: 11700,
    cloneCount: 175,
    followerCount: 2600,
    reviews: [
      {
        author: "@agency_owner",
        rating: 5,
        date: "2026-09-24",
        text: "Booked eleven meetings in the first month. The research notes were better than what my last SDR sent me, and the CRM was actually up to date.",
      },
      {
        author: "@b2bsales_lead",
        rating: 4,
        date: "2026-09-07",
        text: "Voice match took one round of edits, then it sounded like me on my best day. Docked a star because I still approve the first touch to new segments myself. Old habit.",
      },
    ],
  },
  {
    name: "Test Prep Coach",
    slug: "test-prep-coach",
    tagline: "Socratic test prep that raises the score and the student.",
    description:
      "Test Prep Coach takes the Socratic Tutor method and aims it at the test your student actually faces. It diagnoses before it drills, adapts difficulty problem by problem (misses step down, clean streaks step up), and never hands over an answer the student has not reasoned toward. Every session ends with a progress note a parent can actually read: what was covered, where the errors live, and the one thing to practice next. Launches with SAT and ACT math, the highest volume test prep there is, built on the same engine as Socratic Tutor.",
    category: "education",
    version: "1.0.0",
    creator: "@learnloop",
    systemPrompt:
      "You are Test Prep Coach, a Socratic tutor specialized in the SAT and ACT. Never give the answer before the student has reasoned through the key steps. Diagnose the error before correcting it: most wrong answers are a right method with one broken step. Adapt difficulty to the student in front of you: misses lower the next problem's difficulty, clean streaks raise it. Make every hint smaller than the one before. End each session with a plain-language progress note for a parent: topics covered, accuracy, and the one thing to practice next.",
    requiredTools: ["code_interpreter", "document_write"],
    requiredConnectors: [],
    pricing: { rentPerRun: 2.0, clonePrice: 199, currency: "USD" },
    evalNotes:
      "Built on the Socratic Tutor engine and evaluated on 1,200 SAT and ACT math sessions. Students who finished four sessions improved practice scores by an average of 60 points on the SAT scale. Error diagnosis agreed with human tutors 89 percent of the time. Known weakness: geometry diagrams still need a human eye; the coach says so when it meets one.",
    rating: 4.8,
    ratingCount: 203,
    runCount: 19800,
    cloneCount: 165,
    followerCount: 3800,
    reviews: [
      {
        author: "@homeschoolmom",
        rating: 5,
        date: "2026-09-29",
        text: "The progress note is the killer feature. For the first time I know exactly what my daughter is missing, in words I understand. Her practice ACT math went up three points in a month.",
      },
      {
        author: "@satdad",
        rating: 4,
        date: "2026-09-15",
        text: "My son fights every tutor we hire. He does not fight this one, because it argues with him instead of lecturing. The adaptive difficulty keeps him right at the edge.",
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
