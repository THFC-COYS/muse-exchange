/**
 * The Socratic Tutor engine.
 *
 * A deterministic, in-browser implementation of the Socratic Tutor agent's
 * own system prompt (see lib/seed.ts):
 *
 *   "Never reveal the final answer before the student has reasoned through
 *    the key steps. Diagnose misconceptions with targeted questions, give
 *    hints that shrink as understanding grows, and celebrate genuine
 *    insight. If the student is stuck for three exchanges, offer a worked
 *    example of a parallel problem, then return to the original."
 *
 * How that maps to this module:
 *   - Each track is a chain of questions (nodes). The tutor only ever asks;
 *     an answer is accepted when it matches the node's concept patterns
 *     (keywords and synonyms, never one exact string).
 *   - A miss walks a 3-step hint ladder for that question. Hints get more
 *     direct (smaller) as they go.
 *   - Three consecutive misses on one question trigger the parallel worked
 *     example, fully solved, followed by a return to the original question.
 *   - Reaching the end produces a mastery wrap-up that names what the
 *     student proved. The final answer is only ever confirmed after the
 *     student produced it themselves.
 *   - Asking for the answer outright is declined, Socratically, with a hint.
 *   - After mastery, the tutor keeps answering with reflective follow-up
 *     questions. There is no input that dead-ends the session.
 *
 * Pure functions over an explicit state object so the UI (or a test) can
 * drive it without React.
 */

export type TrackId =
  | "linear-equations"
  | "fractions"
  | "photosynthesis"
  | "thesis"
  | "freeform";

export interface TrackInfo {
  id: TrackId;
  label: string;
  blurb: string;
}

export const TRACKS: TrackInfo[] = [
  {
    id: "linear-equations",
    label: "Linear equations",
    blurb: "Solve 3x + 5 = 20 by unwrapping, not guessing.",
  },
  {
    id: "fractions",
    label: "Adding fractions",
    blurb: "Why 1/2 + 1/3 is not 2/5, and what it actually is.",
  },
  {
    id: "photosynthesis",
    label: "Photosynthesis",
    blurb: "Trace where the oxygen in a sealed box really comes from.",
  },
  {
    id: "thesis",
    label: "Essay thesis building",
    blurb: "Turn a topic into a claim a reader can argue with.",
  },
  {
    id: "freeform",
    label: "Another topic",
    blurb: "Bring any problem. We take it apart the same way.",
  },
];

export interface SocraticNode {
  id: string;
  /** The tutor's question that opens this step. */
  prompt: string;
  /** Concept test for a full answer. */
  match: (input: string) => boolean;
  /** Optional near-miss test: progress, but not the whole step. */
  partialMatch?: (input: string) => boolean;
  partialReply?: string;
  /** Praise + bridge, shown on acceptance. May contain {answer}. */
  successReply: string;
  /** Three hints, broad to direct. */
  hints: [string, string, string];
}

export interface SocraticTrack {
  /** Track id. The Tutor's built-in tracks use TrackId; engine consumers
   * like Test Prep Coach define their own ids, so this stays a string. */
  id: string;
  intro: string;
  nodes: SocraticNode[];
  /** Fully worked PARALLEL problem, shown after 3 stuck exchanges. */
  parallelExample: string;
  /** Closing message naming what the student proved. */
  mastery: string;
}

export interface SocraticState {
  trackId: string;
  nodeIndex: number;
  hintLevel: number;
  stuck: number;
  parallelShown: boolean;
  done: boolean;
  followUps: number;
  answers: Record<string, string>;
  /** Cumulative count of hints served across the whole session. */
  hintsUsed: number;
  /** Cumulative count of worked parallel examples served. */
  parallelsUsed: number;
}

export interface TurnResult {
  state: SocraticState;
  reply: string;
}

/* ----------------------------- matchers ------------------------------ */

const low = (s: string) => s.toLowerCase();
const hasAny = (input: string, words: string[]) =>
  words.some((w) => low(input).includes(w));
const hasRe = (input: string, re: RegExp) => re.test(input);

/* ------------------------------ tracks ------------------------------- */

const LINEAR: SocraticTrack = {
  id: "linear-equations",
  intro:
    "Linear equations it is. One ground rule, straight from my design: I never hand over the final answer before you have reasoned through the key steps. Guesses are welcome here, wrong ones included. They show me where your thinking is.",
  nodes: [
    {
      id: "undo-add",
      prompt:
        "Here is our problem: 3x + 5 = 20. The +5 is attached to the term with x. What operation undoes adding 5, and where do you have to apply it to keep the equation balanced?",
      match: (s) =>
        hasAny(s, ["subtract", "minus", "take away", "remove", "undo"]) &&
        (hasAny(s, ["5", "five"]) || hasAny(s, ["both sides", "balance"])),
      successReply:
        "Exactly. Subtraction is addition's undo button, and balance is the law: whatever you do to one side, you do to the other, or the equation stops being true.",
      hints: [
        "Look at what is glued to the x term. Which operation is the opposite of adding 5?",
        "Picture a balance scale with 5 extra on the left pan. What single move restores balance?",
        "The inverse of +5 is -5. You subtract 5, from both sides. Tell me what you plan to subtract, and from where.",
      ],
    },
    {
      id: "after-subtract",
      prompt:
        "Do it now: subtract 5 from both sides of 3x + 5 = 20. What does the equation look like?",
      match: (s) => hasRe(s, /3\s*x\s*=\s*15/),
      partialMatch: (s) => hasRe(s, /=\s*15/) || hasAny(s, ["15"]),
      partialReply:
        "The 15 is right, that is 20 - 5 doing its job. Now write the whole equation: what is left standing on the left side?",
      successReply:
        "3x = 15. Clean. The +5 is gone and the equation stayed honest the whole way down.",
      hints: [
        "The left side keeps only what was not subtracted away. The right side needs one small subtraction.",
        "On the right: 20 - 5. On the left: 3x plus nothing. Put them together.",
        "3x + 5 - 5 leaves 3x, and 20 - 5 is 15. Say the new equation back to me.",
      ],
    },
    {
      id: "isolate",
      prompt:
        "3x = 15. The 3 is multiplying x. What single operation undoes that multiplication, and what value of x does it give you?",
      match: (s) => hasRe(s, /x\s*=\s*5(?![0-9])/),
      partialMatch: (s) => hasAny(s, ["divide", "division", "split", "/ 3", "/3"]),
      partialReply:
        "Right operation: division undoes multiplication, and 3 is the divisor. Finish the arithmetic for me. 15 divided into 3 equal groups is how much in each?",
      successReply:
        "There it is, and you derived it instead of copying it: dividing both sides by 3 isolates x.",
      hints: [
        "The opposite of multiplying by 3 is...?",
        "You want x wearing a coefficient of 1. Split 15 into 3 equal groups in your head.",
        "Divide both sides by 3: x = 15 / 3. What number is that? Say it as 'x = ...'.",
      ],
    },
  ],
  parallelExample:
    "Time for a worked example, on a twin problem so yours stays yours: 2x + 3 = 11. Undo the +3 by subtracting 3 from both sides: 2x = 8. Undo the x2 by dividing both sides by 2: x = 4. Notice the pattern: never guess, just unwrap one layer at a time, the same move on both sides.",
  mastery:
    "Mastery check, passed. You proved x = 5, and more importantly you can name the method: undo addition with subtraction, undo multiplication with division, always on both sides. That unwrapping works on every linear equation you will ever meet.",
};

const FRACTIONS: SocraticTrack = {
  id: "fractions",
  intro:
    "Fractions it is. Fair warning: I will not tell you the sum, because the sum is the least interesting part. The interesting part is why the obvious move is wrong.",
  nodes: [
    {
      id: "diagnose",
      prompt:
        "You eat 1/2 of a pizza, then a friend hands you 1/3 of the same pizza. A classmate says you have eaten 2/5 of a pizza: add the tops, add the bottoms. What is wrong with that move?",
      match: (s) =>
        hasAny(s, [
          "common denominator",
          "equal pieces",
          "same size",
          "different size",
          "different-sized",
          "not the same size",
          "unequal",
          "how big",
          "size of the piece",
          "size of each",
          "pieces are different",
          "sizes are different",
          "sizes differ",
        ]) && s.trim().length > 3,
      partialMatch: (s) => hasAny(s, ["denominator", "bottom number", "pieces"]),
      partialReply:
        "You are pointing at the right suspect: the denominator. But what does the denominator actually describe, the count of pieces or the size of each piece?",
      successReply:
        "Right. Denominators are not counts, they are sizes. Halves and thirds are different-sized pieces, and you cannot count two different sizes as one honest pile.",
      hints: [
        "Is one half-slice of a pizza the same size as one third-slice?",
        "What does the bottom number describe: how many pieces there are, or how big each piece is?",
        "The bottom number names the size of the pieces. 2/5 pretends halves and thirds are the same size. What must be true of the pieces before adding is legal?",
      ],
    },
    {
      id: "common-denominator",
      prompt:
        "So both fractions need to speak in the same piece size. What number can serve as the new denominator, a number that both 2 and 3 divide into evenly?",
      match: (s) => hasRe(s, /\b6\b/) || hasAny(s, ["common denominator", "lcm", "least common multiple"]),
      successReply:
        "Sixths. Both 2 and 3 divide into 6, so we can re-slice everything into sixths without changing a single amount of pizza.",
      hints: [
        "Run the multiples. Of 2: 2, 4, 6... Of 3: 3, 6, 9... Where do the two lists first meet?",
        "The smallest number both lists share.",
        "They meet at 6. Now the fractions get rewritten in sixths.",
      ],
    },
    {
      id: "rewrite",
      prompt:
        "Rewrite them for me: what is 1/2 expressed in sixths, and what is 1/3 expressed in sixths?",
      match: (s) => hasRe(s, /3\s*\/\s*6/) && hasRe(s, /2\s*\/\s*6/),
      partialMatch: (s) => hasRe(s, /3\s*\/\s*6/) || hasRe(s, /2\s*\/\s*6/),
      partialReply:
        "That is one of them, correctly re-sliced. Now the other: same trick, multiply its top and bottom by whatever turns its denominator into 6.",
      successReply:
        "3/6 and 2/6. Same amounts, new slices, and now they are the same size, which means finally countable.",
      hints: [
        "To turn the denominator 2 into 6 you multiply by 3, and fairness demands the top gets multiplied by 3 too. Same game for the 3, with a different multiplier.",
        "Ask it as: what is half of 6? That is the new top for 1/2. And a third of 6 is the new top for 1/3.",
        "1/2 = 3/6 (top and bottom times 3) and 1/3 = 2/6 (top and bottom times 2). Ready for the last move?",
      ],
    },
    {
      id: "add",
      prompt:
        "Final move: 3/6 + 2/6. The pieces are the same size now, so this part is just counting. How many sixths do you have in total?",
      match: (s) => hasRe(s, /5\s*\/\s*6/),
      partialMatch: (s) => hasRe(s, /\b5\b/),
      partialReply:
        "5 is the count, yes. Five of what size? Give me the full fraction.",
      successReply:
        "Counted, not guessed. Five sixths, every one of them earned.",
      hints: [
        "When piece sizes match, tops simply add. The size name (sixths) stays.",
        "3 pieces plus 2 pieces, all of them sixths.",
        "3 + 2 = 5 pieces, each 1/6, so the total is 5/6. Say it as the full fraction.",
      ],
    },
  ],
  parallelExample:
    "Worked example, on a smaller cousin so yours stays yours: 1/2 + 1/4. Halves and quarters are different sizes, so re-slice into quarters: 1/2 = 2/4. Now the pieces match and counting works: 2/4 + 1/4 = 3/4. The re-slicing never changed any amount. It just made the pieces countable.",
  mastery:
    "Mastery check, passed. You proved 1/2 + 1/3 = 5/6, and the theorem underneath it: fractions only add when the pieces match, so you re-slice to a common denominator first. Your classmate's 2/5 never stood a chance.",
};

const PHOTOSYNTHESIS: SocraticTrack = {
  id: "photosynthesis",
  intro:
    "Photosynthesis it is. I will give you an observation and ask questions until the explanation is yours, not memorized.",
  nodes: [
    {
      id: "gas-in",
      prompt:
        "A plant sits in a sealed glass box in sunlight. Over one day, the oxygen inside the box goes up. Before we explain that: what gas does the plant pull out of the air for itself?",
      match: (s) => hasAny(s, ["carbon dioxide", "co2", "co₂"]),
      successReply:
        "Carbon dioxide, yes. That is the plant's raw material from the air. Now the other inputs.",
      hints: [
        "It is the gas you exhale with every breath.",
        "Plants are famous for absorbing the gas animals breathe out.",
        "Carbon dioxide, CO2. Tell me the gas's name, and we keep building.",
      ],
    },
    {
      id: "water",
      prompt:
        "Air provides carbon dioxide, and the sun provides energy. What is the third ingredient, the one the roots pull up from the soil?",
      match: (s) => hasAny(s, ["water", "h2o", "h₂o"]),
      successReply:
        "Water. So the input shelf holds carbon dioxide, water, and light. Now the interesting part: what comes out, and why.",
      hints: [
        "You are carrying a bottle of it right now, probably.",
        "Roots are not just anchors. They drink.",
        "Water, H2O. Now, the plant splits one of its ingredients to build sugar. Keep that in mind.",
      ],
    },
    {
      id: "oxygen-source",
      prompt:
        "The plant builds sugar, its food, from those ingredients. Building sugar does not use every atom; something is left over and released into the box. Which gas is released?",
      match: (s) => hasAny(s, ["oxygen", "o2", "o₂"]),
      partialMatch: (s) => hasAny(s, ["water"]),
      partialReply:
        "You are circling it. Yes, water gets split in the process: its hydrogen goes toward the sugar. What is left over when water loses its hydrogen?",
      successReply:
        "Oxygen. And here is the detail most people get backwards: that oxygen comes from the split water, not from the carbon dioxide.",
      hints: [
        "It is the very gas we measured rising in the box.",
        "The leftover is the gas your lungs are pulling in right now.",
        "Oxygen, released when water is split. Now assemble the whole recipe.",
      ],
    },
    {
      id: "recipe",
      prompt:
        "Put the whole recipe in one sentence: what goes in, and what comes out?",
      match: (s) => {
        const groups = [
          hasAny(s, ["carbon dioxide", "co2", "co₂"]),
          hasAny(s, ["water", "h2o"]),
          hasAny(s, ["sugar", "glucose", "food", "energy stored"]),
          hasAny(s, ["oxygen", "o2"]),
        ];
        return groups.filter(Boolean).length >= 3;
      },
      partialMatch: (s) =>
        hasAny(s, ["carbon dioxide", "co2", "oxygen", "sugar", "glucose", "water"]),
      partialReply:
        "Part of the recipe is there. Check both shelves: three things go in (a gas, a liquid, and light), two things come out (a food and a gas). Which pieces are you missing?",
      successReply:
        "That is the whole machine, stated in your own words: inputs on one side, products on the other, light paying the energy bill.",
      hints: [
        "Structure helps: 'In go ... and ..., powered by light. Out come ... and ...'.",
        "In: carbon dioxide and water. Out: sugar and one gas you already named.",
        "In go carbon dioxide and water, powered by light. Out come sugar (glucose) and oxygen. Now say the whole sentence yourself.",
      ],
    },
  ],
  parallelExample:
    "Worked example, the classic wet version: pondweed sits in a beaker of water under a funnel, and bubbles collect in a test tube above it. Touch that gas with a glowing splint and the splint bursts back into flame. Only one common gas does that: oxygen. The plant was sitting in water, and the oxygen came out of the plant, so the oxygen's source has to be an ingredient the plant took in. You already know which one it splits.",
  mastery:
    "Mastery check, passed. You derived photosynthesis instead of reciting it: carbon dioxide and water go in, light powers the build, sugar is stored, and oxygen, split from the water, is released. That is exactly why the oxygen rose in the sealed box.",
};

const THESIS: SocraticTrack = {
  id: "thesis",
  intro:
    "Thesis building it is. I will not write your thesis for you, because a thesis you cannot defend is worse than none. But I will ask the questions that build one.",
  nodes: [
    {
      id: "not-a-thesis",
      prompt:
        "Your assignment: argue a position on school start times. A classmate's draft opens with: 'School start times are an interesting topic.' That is not a thesis yet. What is missing from it?",
      match: (s) =>
        hasAny(s, ["position", "stance", "claim", "side", "opinion", "argue", "arguable", "point of view"]) &&
        s.trim().length > 6,
      successReply:
        "Exactly. It names a topic but takes no position, so there is nothing to argue with, and nothing to prove. A thesis starts the moment a reader could disagree.",
      hints: [
        "Test it: could a reasonable person read that sentence and disagree? If nobody can disagree, what does that tell you?",
        "A thesis must be arguable. It has to be one side of a real disagreement.",
        "What is missing is a position: the writer never says what they actually believe. Hold that thought.",
      ],
    },
    {
      id: "position",
      prompt:
        "Your turn. In a few words, what do you believe? Should school start later, start earlier, or stay exactly as it is?",
      match: (s) =>
        hasAny(s, ["later", "earlier", "stay", "same", "should"]) &&
        s.trim().length > 3,
      successReply:
        "There is your claim: a real position someone could push back on. But a claim by itself is a bumper sticker. It needs an engine.",
      hints: [
        "Pick the side you would actually defend in the hallway, not the side you think I want.",
        "Complete this frame: 'School should start ___ because...' Just the first blank for now.",
        "Later, earlier, or unchanged. One word is a complete answer at this step.",
      ],
    },
    {
      id: "reason",
      prompt:
        "Now give the claim its engine: because why? What is your single strongest reason?",
      match: (s) =>
        s.trim().length >= 12 ||
        hasAny(s, ["sleep", "tired", "brain", "health", "bus", "job", "sport", "safety", "grades", "focus", "teen", "rest", "accident"]),
      successReply:
        "You gave the claim this reason: \"{answer}\" That has weight. A reader can picture it, and an opponent has to actually answer it.",
      hints: [
        "Think about what a later or earlier start changes in a real teenager's day.",
        "Sleep, safety, jobs, sports, focus in first period. Which of those do you care about most?",
        "One reason, the strongest one you have. It does not need to be fancy, it needs to be yours.",
      ],
    },
    {
      id: "assemble",
      prompt:
        "Assemble it: one sentence that carries your claim and your reason together. Write your full thesis sentence now.",
      match: (s) =>
        hasAny(s, ["because"]) ||
        (s.trim().length >= 25 && hasAny(s, ["should", "later", "earlier", "stay"])),
      successReply:
        "Read it once more: \"{answer}\" Claim, because, reason, all in one breath. That is a thesis.",
      hints: [
        "Use the frame: 'School should start ___ because ___.' Your two earlier answers are the two blanks.",
        "Claim first, then the word 'because', then your reason, word for word if you like.",
        "One sentence holding both parts. Start with your position and glue the reason on with 'because'.",
      ],
    },
  ],
  parallelExample:
    "Worked example, on a different topic so yours stays yours. Weak: 'Uniforms are a topic at many schools.' That is a topic, no claim. Better: 'Schools should drop uniforms.' A claim, but no reason yet. Thesis: 'Schools should drop uniforms because they cost families money without improving behavior.' Two upgrades: add a position, then add a because. Your start-time draft needs the same two upgrades, in the same order.",
  mastery:
    "Mastery check, passed. You built a real thesis: a position a reasonable person can dispute, powered by a reason you chose and can defend. Topic, then claim, then claim plus reason. That two-step upgrade works on every essay you will write this year.",
};

const FREEFORM: SocraticTrack = {
  id: "freeform",
  intro:
    "Any topic, same method. I will not solve your problem for you; I will teach you the five moves that take any problem apart. Start.",
  nodes: [
    {
      id: "state",
      prompt:
        "State the problem for me, exactly as it was given to you, or in your own words if it is long.",
      match: () => true,
      successReply:
        "Problem on the table: \"{answer}\" Most people skip stating it precisely, and then wonder why their solution wanders.",
      hints: ["Just the problem, as given.", "Copy it word for word if you can.", "One or two sentences is plenty."],
    },
    {
      id: "known",
      prompt:
        "Before solving anything: what do you already know that is relevant? Facts, definitions, formulas, or a similar problem you have seen solved.",
      match: () => true,
      successReply:
        "That is your toolkit, inventoried. Most problems fall to tools already in it.",
      hints: ["Anything related counts.", "Formulas, facts, past problems.", "Even one item is a start."],
    },
    {
      id: "unknown",
      prompt:
        "Now name the unknown precisely. What would a finished answer look like: a number, a sentence, a proof, a decision?",
      match: () => true,
      successReply:
        "Knowing the shape of the finish line changes how you run toward it.",
      hints: ["What form does the answer take?", "A value? A yes or no? An explanation?", "Name the unknown in one phrase."],
    },
    {
      id: "first-step",
      prompt:
        "What is the smallest first step? Not the solution, just one move you could make in the next two minutes.",
      match: () => true,
      successReply:
        "You chose: \"{answer}\" Good. That is a move, not a mountain.",
      hints: ["Smaller than you think.", "What could you write down first?", "One move, two minutes."],
    },
    {
      id: "consequence",
      prompt:
        "Take that step in your head. What does it give you: a new fact, a smaller problem, or a sharper next question?",
      match: () => true,
      successReply: "And notice what happened to the problem while you did that: it got smaller.",
      hints: ["What is true after the step that was not true before?", "Does the problem shrink?", "What question comes next?"],
    },
  ],
  parallelExample:
    "Here is the pattern on a tiny problem, so you can watch all five moves at once. Problem: a train travels 120 miles in 2 hours; how fast is it going? Known: distance and time, and speed relates the two. Unknown: a number of miles per hour. First step: write the relationship, speed = distance / time. Consequence: the arithmetic is now trivial, 120 / 2 = 60 mph. The insight was never the division. It was the four moves before it.",
  mastery:
    "Mastery check, passed, and this is the real curriculum: you stated the problem, inventoried what you know, named the unknown, chose a first step, and took it. That five-move pattern works on problems nobody can help you with. If you stall later, come back and we will take the next step apart exactly the same way.",
};

const TRACK_MAP: Record<TrackId, SocraticTrack> = {
  "linear-equations": LINEAR,
  fractions: FRACTIONS,
  photosynthesis: PHOTOSYNTHESIS,
  thesis: THESIS,
  freeform: FREEFORM,
};

/* ------------------------------ engine ------------------------------- */

const MISS_PROBES = [
  "Not quite. Let us look closer.",
  "That is close enough to be useful, but it is not the piece this step needs.",
  "Hold that thought. Look at the question from a slightly different angle.",
];

const FOLLOW_UPS = [
  "Good question to sit with. What makes you say that?",
  "Interesting. What would you expect to observe if that were true, and what if it were not?",
  "Say more about the part you are least sure of. That is usually where the problem is hiding.",
  "If you had to explain your reasoning so far to a friend, in two sentences, what would you say?",
  "You have the method now. Pick another topic above whenever you want to run it again.",
];

const ANSWER_BEGGING =
  /(just\s+)?(tell|give|show)\s+me\s+the\s+answer|what('s| is)\s+the\s+answer|solve\s+it\s+for\s+me|do\s+it\s+for\s+me|just\s+the\s+answer/i;

const HINT_REQUEST =
  /^(i\s+don'?t\s+know|idk|no\s+idea|help( me)?|hint( please)?|i'?m\s+stuck|stuck|dunno|no\s+clue)\.?$/i;

function fillAnswer(template: string, answer: string): string {
  const trimmed = answer.trim().replace(/\s+/g, " ");
  const short = trimmed.length > 140 ? `${trimmed.slice(0, 137)}...` : trimmed;
  return template.replace("{answer}", short);
}

function currentNode(state: SocraticState, track: SocraticTrack): SocraticNode {
  return track.nodes[Math.min(state.nodeIndex, track.nodes.length - 1)];
}

function acceptNode(
  state: SocraticState,
  track: SocraticTrack,
  nodePos: number,
  rawInput: string,
  jumped: boolean
): TurnResult {
  const node = track.nodes[nodePos];
  const answers = { ...state.answers, [node.id]: rawInput.trim() };
  const praise = fillAnswer(node.successReply, rawInput);
  const bridge = jumped ? "You jumped ahead to exactly the right place. " : "";
  const nextIndex = nodePos + 1;

  if (nextIndex >= track.nodes.length) {
    return {
      state: {
        ...state,
        answers,
        nodeIndex: nextIndex,
        hintLevel: 0,
        stuck: 0,
        parallelShown: false,
        done: true,
      },
      reply: `${bridge}${praise}\n\n${track.mastery}`,
    };
  }

  return {
    state: {
      ...state,
      answers,
      nodeIndex: nextIndex,
      hintLevel: 0,
      stuck: 0,
      parallelShown: false,
    },
    reply: `${bridge}${praise}\n\n${track.nodes[nextIndex].prompt}`,
  };
}

function missTurn(
  state: SocraticState,
  track: SocraticTrack,
  hintRequested: boolean
): TurnResult {
  const node = currentNode(state, track);
  const stuck = state.stuck + 1;
  const hintsUsed = state.hintsUsed + 1;

  // Three stuck exchanges on one question: worked parallel example, then
  // return to the original question with a fresh ladder.
  if (stuck >= 3) {
    if (!state.parallelShown) {
      return {
        state: {
          ...state,
          stuck: 0,
          hintLevel: 0,
          parallelShown: true,
          hintsUsed,
          parallelsUsed: state.parallelsUsed + 1,
        },
        reply: `${track.parallelExample}\n\nBack to ours, same question, fresh eyes:\n\n${node.prompt}`,
      };
    }
    // Parallel already shown: shrink all the way down to the most direct hint.
    return {
      state: { ...state, stuck: 0, hintLevel: 3, hintsUsed },
      reply: `Let us shrink this step all the way down. ${node.hints[2]}`,
    };
  }

  const hint = node.hints[Math.min(state.hintLevel, 2)];
  const opener = hintRequested
    ? "No shame in that; asking for a hint is a strategy, not a surrender. "
    : `${MISS_PROBES[Math.min(stuck - 1, MISS_PROBES.length - 1)]} `;
  return {
    state: { ...state, stuck, hintLevel: state.hintLevel + 1, hintsUsed },
    reply: `${opener}${hint}`,
  };
}

/**
 * Start any SocraticTrack: returns the opening tutor message and the
 * fresh state. The Tutor's built-in tracks go through startTrack below;
 * other agents built on this engine (Test Prep Coach) pass their own
 * track objects here.
 */
export function startWithTrack(track: SocraticTrack): TurnResult {
  const state: SocraticState = {
    trackId: track.id,
    nodeIndex: 0,
    hintLevel: 0,
    stuck: 0,
    parallelShown: false,
    done: false,
    followUps: 0,
    answers: {},
    hintsUsed: 0,
    parallelsUsed: 0,
  };
  return {
    state,
    reply: `${track.intro}\n\n${track.nodes[0].prompt}`,
  };
}

/** Start one of the Socratic Tutor's built-in tracks. */
export function startTrack(trackId: TrackId): TurnResult {
  return startWithTrack(TRACK_MAP[trackId]);
}

/** Advance a session on an explicit track by one student message. */
export function respondWithTrack(
  track: SocraticTrack,
  state: SocraticState,
  rawInput: string
): TurnResult {
  const input = rawInput.trim();

  if (input.length < 2) {
    return {
      state,
      reply:
        "Give me a little more than that, even a guess. Wrong guesses are useful here: they show me exactly where your thinking is.",
    };
  }

  if (state.done) {
    const reply = FOLLOW_UPS[state.followUps % FOLLOW_UPS.length];
    return { state: { ...state, followUps: state.followUps + 1 }, reply };
  }

  const node = currentNode(state, track);

  // Begging for the answer: declined Socratically, with the next hint.
  // The length guard keeps a pasted homework problem that merely contains
  // a phrase like "what is the answer" from tripping this branch.
  if (input.length <= 140 && ANSWER_BEGGING.test(input)) {
    const hint = node.hints[Math.min(state.hintLevel, 2)];
    return {
      state: {
        ...state,
        hintLevel: Math.min(state.hintLevel + 1, 3),
        hintsUsed: state.hintsUsed + 1,
      },
      reply: `That would be me doing the one rep that makes you stronger, so no. But I will make the step smaller: ${hint}`,
    };
  }

  // Explicit hint request walks the same ladder as a miss.
  if (HINT_REQUEST.test(input)) {
    return missTurn(state, track, true);
  }

  // Full answer at the current node.
  if (node.match(input)) {
    return acceptNode(state, track, state.nodeIndex, input, false);
  }

  // Partial progress: acknowledge, do not advance, do not punish.
  if (node.partialMatch && node.partialReply && node.partialMatch(input)) {
    return { state, reply: node.partialReply };
  }

  // Jump-ahead: the student answered a later question correctly.
  for (let j = state.nodeIndex + 1; j < track.nodes.length; j++) {
    if (track.nodes[j].match(input)) {
      return acceptNode(state, track, j, input, true);
    }
  }

  // Ordinary miss: hint ladder, parallel example on the third strike.
  return missTurn(state, track, false);
}

/** Advance a Socratic Tutor session by one student message. Never dead-ends. */
export function respond(state: SocraticState, rawInput: string): TurnResult {
  return respondWithTrack(TRACK_MAP[state.trackId as TrackId], state, rawInput);
}
