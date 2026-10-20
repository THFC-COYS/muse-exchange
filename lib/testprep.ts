/**
 * The Test Prep Coach engine data.
 *
 * Test Prep Coach is a product-line extension of Socratic Tutor by the
 * same creator, so it runs on the same engine (lib/socratic.ts): diagnose
 * first, never hand over the answer, hints that shrink, a worked parallel
 * problem after three stuck exchanges, and a celebration that names the
 * skill the student just proved.
 *
 * What is different here is the session shape. A session is a short set
 * of drill problems drawn from three difficulty tiers:
 *
 *   tier 0  Foundation
 *   tier 1  Core        (sessions start here)
 *   tier 2  Reach
 *
 * Adaptation rule, visible to the student in the runner HUD:
 *   clean solve (at most 1 hint, no worked example)  -> tier up, streak +1
 *   solid solve (a few hints)                        -> same tier
 *   struggled solve (worked example, or 4+ hints)    -> tier down, streak reset
 *
 * Each problem is a two-node Socratic chain: translate or set up first,
 * then compute. The setup node is where test prep is won; the traps the
 * tests plant (the discount instead of the price paid, the new number
 * instead of the original) are named out loud when the student clears
 * them.
 */
import type { SocraticState, SocraticTrack } from "./socratic";

export interface TestPrepProblem extends SocraticTrack {
  /** Short skill name, used in the progress note. */
  skill: string;
}

export interface TestPrepTrackDef {
  id: string;
  label: string;
  blurb: string;
  test: "SAT" | "ACT";
  /** [Foundation, Core, Reach], problems in serving order. */
  tiers: [TestPrepProblem[], TestPrepProblem[], TestPrepProblem[]];
}

export const TIER_LABELS = ["Foundation", "Core", "Reach"] as const;

/** Problems per session before the progress note is offered as the finish. */
export const SESSION_LENGTH = 4;

/* ----------------------------- matchers ------------------------------ */

const low = (s: string) => s.toLowerCase();
const hasAny = (input: string, words: string[]) =>
  words.some((w) => low(input).includes(w));
const hasRe = (input: string, re: RegExp) => re.test(input);

/* --------------------------- SAT: linear ----------------------------- */

const SAT_TWO_STEP: TestPrepProblem = {
  id: "sat-two-step",
  skill: "Two-step equations",
  intro:
    "SAT style, warm-up weight. Problem: if 2x + 6 = 18, what is the value of x? We solve it the Socratic way: you make the moves, I ask the questions.",
  nodes: [
    {
      id: "setup",
      prompt:
        "First move only. The +6 is attached to the term with x. What operation undoes it, and where do you apply it?",
      match: (s) =>
        hasAny(s, ["subtract", "minus", "take away"]) &&
        (hasAny(s, ["6", "six"]) || hasAny(s, ["both sides"])),
      successReply:
        "Subtract 6 from both sides. The equation keeps its balance and sheds a layer.",
      hints: [
        "The inverse of adding 6 is which operation?",
        "Picture the balance scale: 6 extra sits on the left pan. One move restores it.",
        "Subtract 6, from both sides. Tell me the operation and the number.",
      ],
    },
    {
      id: "solve",
      prompt:
        "Now it reads 2x = 12. The 2 is multiplying x. Finish it: what is x?",
      match: (s) => hasRe(s, /x\s*=\s*6(?![0-9])/),
      partialMatch: (s) => hasAny(s, ["divide", "division", "/ 2", "/2"]),
      partialReply:
        "Division is the undo, right. 12 split into 2 equal groups is how much per group? Say it as x = ...",
      successReply:
        "x = 6, derived, not guessed. That is the whole two-step game in one problem.",
      hints: [
        "The opposite of multiplying by 2 is...?",
        "You want x with a coefficient of 1. Split 12 into 2 equal groups.",
        "Divide both sides by 2: x = 12 / 2. What number is that?",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin problem so yours stays yours: 3x + 4 = 19. Subtract 4 from both sides: 3x = 15. Divide both sides by 3: x = 5. Same unwrap, different numbers.",
  mastery:
    "Problem solved. You named the method yourself: undo addition with subtraction, undo multiplication with division, both sides every time.",
};

const SAT_FRACTION_EQ: TestPrepProblem = {
  id: "sat-fraction-eq",
  skill: "Equations with fractions",
  intro:
    "Problem: x/3 + 2 = 7. Fractions first, fear never. The x is wrapped in two layers, and the order you remove them matters.",
  nodes: [
    {
      id: "setup",
      prompt:
        "Two layers wrap the x: a +2 and a division by 3. Which layer comes off first, and how?",
      match: (s) =>
        hasAny(s, ["subtract", "minus"]) && hasAny(s, ["2", "two", "first"]),
      successReply:
        "Subtract 2 from both sides first. You unwrap in reverse order: the last layer added is the first layer removed.",
      hints: [
        "Think of the order the layers were put on. Division by 3 happened to x first, then the +2. Undo in reverse.",
        "PEMDAS backwards: addition and subtraction undo before multiplication and division.",
        "Subtract 2 from both sides, before you touch the division. Say the move.",
      ],
    },
    {
      id: "solve",
      prompt:
        "Now x/3 = 5. The x is being divided by 3. What operation undoes that, and what is x?",
      match: (s) => hasRe(s, /x\s*=\s*15/),
      partialMatch: (s) => hasAny(s, ["multiply", "times", "x 3", "* 3", "*3"]),
      partialReply:
        "Multiplication is the undo, yes. 5 times 3 is what? Give me the value of x.",
      successReply:
        "x = 15. Check it in the original: 15/3 + 2 = 5 + 2 = 7. It balances.",
      hints: [
        "Dividing by 3 is undone by multiplying by 3. Both sides, as always.",
        "If x thirds make 5, then x is 3 groups of 5.",
        "Multiply both sides by 3: x = 5 x 3. What is that number?",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: x/2 + 1 = 6. Subtract 1 from both sides: x/2 = 5. Multiply both sides by 2: x = 10. Reverse order unwrap, again.",
  mastery:
    "Solved. Notice the sequence: the +2 came off before the division was touched. Unwrap in reverse order of wrapping, every single time.",
};

const SAT_DISTRIBUTE: TestPrepProblem = {
  id: "sat-distribute",
  skill: "Distributing and dividing through parentheses",
  intro:
    "A College Board favorite: 3(x - 2) = 21. Two legal first moves exist here. Pick one and defend it.",
  nodes: [
    {
      id: "setup",
      prompt:
        "First move: you can divide both sides by 3, or distribute the 3 across the parentheses. Which do you choose, and what does the equation become?",
      match: (s) =>
        hasRe(s, /x\s*-\s*2\s*=\s*7/) || hasRe(s, /3x\s*-\s*6\s*=\s*21/),
      partialMatch: (s) => hasAny(s, ["divide", "distribute", "multiply out", "expand"]),
      partialReply:
        "That is a legal road, yes. Now drive it: write out what the equation looks like after that move.",
      successReply:
        "Both roads are legal: x - 2 = 7 by dividing through, or 3x - 6 = 21 by distributing. Either way, x is closer to daylight.",
      hints: [
        "The 3 outside the parentheses can be divided away, or multiplied through. Both are honest.",
        "Dividing gives x - 2 = something small. Distributing gives 3x - 6 = something bigger. Pick one and write it.",
        "Either write 'x - 2 = 7' (divided) or '3x - 6 = 21' (distributed). Show me the new equation.",
      ],
    },
    {
      id: "solve",
      prompt: "Finish from wherever you are: what is x?",
      match: (s) => hasRe(s, /x\s*=\s*9(?![0-9])/),
      partialMatch: (s) => hasAny(s, ["add 2", "add the 2", "plus 2", "divide by 3"]),
      partialReply:
        "That is the right next move. Run it all the way to a value: x equals what number?",
      successReply:
        "x = 9. Check it in the original: 3(9 - 2) = 3 x 7 = 21. It balances.",
      hints: [
        "From x - 2 = 7: one addition finishes it. From 3x - 6 = 21: one addition, then one division.",
        "Get x alone. Whatever is attached comes off, on both sides.",
        "x - 2 = 7, add 2 to both sides: x = 9. Or 3x = 27, divide by 3: x = 9. Say the value.",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: 2(x + 5) = 24. Divide first: x + 5 = 12, so x = 7. Or distribute: 2x + 10 = 24, then 2x = 14, so x = 7. Two roads, same town.",
  mastery:
    "Solved, and here is the real lesson: parentheses are just a wrapper. Divide it off or distribute through it, both are honest moves, and the SAT cannot tell which one you used.",
};

const SAT_SYSTEM: TestPrepProblem = {
  id: "sat-system",
  skill: "Systems of equations by elimination",
  intro:
    "System time. x + y = 12 and x - y = 2. The SAT loves this pair because one move nearly solves the whole thing.",
  nodes: [
    {
      id: "setup",
      prompt:
        "Look at the two equations stacked. If you add them together, left sides and right sides, what happens to the y terms?",
      match: (s) =>
        hasAny(s, ["cancel", "disappear", "eliminate", "go away", "zero", "vanish"]) ||
        hasRe(s, /2x\s*=\s*14/),
      successReply:
        "The y terms cancel: +y and -y sum to nothing. That is the whole trick of elimination, spotted before any arithmetic.",
      hints: [
        "Add the y column in your head: +y plus -y equals what?",
        "The equations were built so one variable is the opposite of itself across the pair.",
        "The y terms cancel to zero, leaving a one-variable equation. What happens to them?",
      ],
    },
    {
      id: "solve",
      prompt:
        "Adding gives you 2x = 14. So x is what, and once you have x, what is y from the first equation?",
      match: (s) => hasRe(s, /x\s*=\s*7/) && hasRe(s, /y\s*=\s*5/),
      partialMatch: (s) => hasRe(s, /x\s*=\s*7/),
      partialReply:
        "x = 7, correct. Now feed it back into x + y = 12: if x is 7, what must y be?",
      successReply:
        "x = 7 and y = 5. Check the second equation: 7 - 5 = 2. It balances on both.",
      hints: [
        "2x = 14 is one division away from x. Then the first equation becomes 7 + y = 12.",
        "x is half of 14. y is whatever 12 still needs.",
        "x = 7, and 12 - 7 gives y = 5. Say both values.",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin system: a + b = 9 and a - b = 3. Add them: 2a = 12, so a = 6. Then b = 3 from the first equation. When the signs oppose, add. When they match, subtract.",
  mastery:
    "System solved by elimination. You spotted that the y terms were built to cancel, and on the SAT that spot is worth more than the arithmetic that follows it.",
};

const SAT_IDENTITY: TestPrepProblem = {
  id: "sat-identity",
  skill: "No solution and infinite solutions",
  intro:
    "Reach problem, the kind that separates scores. For what value of a does 4(x + 3) = ax + 12 have infinitely many solutions?",
  nodes: [
    {
      id: "setup",
      prompt: "Distribute the left side first. What does 4(x + 3) become?",
      match: (s) => hasRe(s, /4x\s*\+\s*12/),
      partialMatch: (s) => hasAny(s, ["distribute", "multiply", "expand"]),
      partialReply:
        "Distributing is the move. Run it: 4 times x, and 4 times 3. Write the result.",
      successReply:
        "4x + 12 on the left. Now the equation reads 4x + 12 = ax + 12. Stare at both sides for a second.",
      hints: [
        "The 4 multiplies everything inside the parentheses, both terms.",
        "4 times x is 4x. 4 times 3 is 12. Put them together with a plus.",
        "The left side becomes 4x + 12. Write it out.",
      ],
    },
    {
      id: "solve",
      prompt:
        "For infinitely many solutions, the two sides must be identical for every x. The constants already match. What must a be?",
      match: (s) => hasRe(s, /\ba\s*=\s*4\b/) || hasRe(s, /^4$/),
      partialMatch: (s) =>
        hasAny(s, ["same", "identical", "equal", "match"]),
      partialReply:
        "Identical is the right instinct. So the x coefficients must match too. The left coefficient is 4, which makes a equal to...?",
      successReply:
        "a = 4. Both sides become the same expression, so every value of x works. That is what infinitely many solutions means.",
      hints: [
        "Identical sides need identical pieces: same x coefficient, same constant. The constants are already twins.",
        "Look at the number in front of x on the left. a has to be that number.",
        "a = 4 makes ax into 4x, a perfect copy of the left. What is a?",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: 2(x + 5) = bx + 10, with infinitely many solutions. Distribute: 2x + 10 = bx + 10. Match the x coefficients: b = 2. Identity on both sides is the whole test.",
  mastery:
    "Reach problem, solved. Infinitely many solutions means the equation is an identity: same coefficients, same constants, both sides. Most students guess at these. You matched structure instead.",
};

const SAT_WORD: TestPrepProblem = {
  id: "sat-word",
  skill: "Translating word problems into equations",
  intro:
    "Word problem, SAT flavor. A gym charges a $30 signup fee plus $12 per month. After how many months has a member paid $210 in total?",
  nodes: [
    {
      id: "setup",
      prompt:
        "Build the equation before solving anything. Total cost is the fee plus the monthly rate times the months. Using m for months, write the equation that says the total equals 210.",
      match: (s) =>
        hasRe(s, /30\s*\+\s*12\s?m\s*=\s*210/) ||
        hasRe(s, /12\s?m\s*\+\s*30\s*=\s*210/),
      partialMatch: (s) => hasAny(s, ["12m", "12 m"]),
      partialReply:
        "The 12m term is right, that is the monthly money growing. Now the full equation: what gets added to it, and what does the whole thing equal?",
      successReply:
        "30 + 12m = 210. The story is now algebra, and algebra you already know how to unwrap.",
      hints: [
        "Fixed money first (the fee), growing money second (rate times m), then equals the total.",
        "Fee is 30. Rate times months is 12m. Total is 210. Arrange them.",
        "The equation is 30 + 12m = 210. Write it back to me.",
      ],
    },
    {
      id: "solve",
      prompt: "Solve it: after how many months does the total reach $210?",
      match: (s) => hasRe(s, /m\s*=\s*15/) || hasRe(s, /15\s*months/),
      partialMatch: (s) => hasRe(s, /\b15\b/),
      partialReply:
        "15 is the number. 15 of what? Say it with its unit and the variable.",
      successReply:
        "15 months. Check: 30 + 12 x 15 = 30 + 180 = 210. The story balances.",
      hints: [
        "Undo the +30 first, then undo the times 12. The same unwrap as always.",
        "210 - 30 is 180, and 180 split by 12 per month is...?",
        "m = 15: fifteen months. Say it as m = 15 or 15 months.",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin story: a plumber charges a $50 visit fee plus $40 per hour, and the bill is $250. Equation: 50 + 40h = 250. Subtract 50: 40h = 200. Divide by 40: h = 5 hours. Fee first, rate times time second, every time.",
  mastery:
    "You did the two moves that matter on every word problem: translate the story into an equation, then unwrap it. Word problems are translation tests wearing a costume.",
};

/* --------------------------- ACT: percents ---------------------------- */

const ACT_PERCENT_OF: TestPrepProblem = {
  id: "act-percent-of",
  skill: "Percent of a number",
  intro:
    "ACT warm-up. What is 20 percent of 150? Two translations are legal here. You pick the one you trust.",
  nodes: [
    {
      id: "setup",
      prompt:
        "Percent means per hundred. Translate 20 percent into a decimal or a fraction you can multiply by. What is it?",
      match: (s) =>
        hasAny(s, ["0.2", "0.20", ".2", "1/5", "20/100", "one fifth", "a fifth"]),
      successReply:
        "0.2, or equivalently one fifth. Now it is a multiplication, not a mystery.",
      hints: [
        "Move the decimal two places left, or write it over 100 and simplify.",
        "20 per hundred simplifies to a unit fraction you know well.",
        "20 percent is 0.2 as a decimal, 1/5 as a fraction. Give me one of them.",
      ],
    },
    {
      id: "solve",
      prompt: "Multiply it out: what is 20 percent of 150?",
      match: (s) => hasRe(s, /\b30\b/),
      partialMatch: (s) => hasAny(s, ["150 / 5", "150/5", "divide"]),
      partialReply:
        "Right road: 150 split into fifths. One fifth of 150 is how much?",
      successReply:
        "30. And notice: one fifth of 150 is also 30. Two translations, one answer, zero doubt.",
      hints: [
        "0.2 times 150, or 150 divided by 5. Both are the same move wearing different clothes.",
        "A fifth of 150: 150 split into 5 equal parts.",
        "150 / 5 = 30. What is 20 percent of 150?",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: 10 percent of 240. Decimal route: 0.1 x 240 = 24. Shortcut route: 10 percent is a decimal shift, 240 becomes 24. Either road, 24.",
  mastery:
    "Solved. Percent problems fall the moment you translate the percent into something you can multiply by: a decimal or a fraction. That translation is the skill.",
};

const ACT_HALF_OFF: TestPrepProblem = {
  id: "act-half-off",
  skill: "Discount versus price paid",
  intro:
    "A $40 shirt is 50 percent off. Even the ACT starts here, because the trap it sets catches people at every level.",
  nodes: [
    {
      id: "setup",
      prompt:
        "50 percent off the price. Here is the question that matters: what fraction of the price actually leaves your wallet?",
      match: (s) =>
        hasAny(s, ["half", "50%", "50 percent", "0.5", "one half", "1/2"]),
      successReply:
        "You pay half. The discount and the price you pay are two different numbers, and mixing them up is the classic trap on every percent problem.",
      hints: [
        "If half the price is removed, what portion remains to be paid?",
        "Off and paid are complements. They add to the whole price.",
        "You pay half: 50 percent of the price, not the discount. Say the portion.",
      ],
    },
    {
      id: "solve",
      prompt: "So the sale price of the $40 shirt is what?",
      match: (s) => hasRe(s, /\$?\s*20\b/),
      successReply:
        "$20. Half of 40 is what you pay. The other $20 is the discount, the number you do not pay.",
      hints: [
        "Half of 40. That is the whole computation.",
        "The price paid is the original split in two, one part kept by you.",
        "$20 is the price paid. Say the amount.",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: a $60 game is 50 percent off. The discount is $30 and you pay $30. On percent-off problems always ask: does the question want the discount or the price paid? They are twins with different names.",
  mastery:
    "Solved, and you dodged the oldest trap in the book: the discount is not the price. Asking which of the two numbers the question wants is half the skill.",
};

const ACT_SALE_PRICE: TestPrepProblem = {
  id: "act-sale-price",
  skill: "Sale price after a percent discount",
  intro:
    "Core problem. A jacket originally costs $80 and is discounted 25 percent. What is the sale price? Careful: the first number you compute is a decoy.",
  nodes: [
    {
      id: "setup",
      prompt:
        "Two routes finish this problem: compute the discount and subtract, or compute the percent you pay and multiply. Start either way. What is 25 percent of 80, or what percent of the price do you actually pay?",
      match: (s) => hasRe(s, /\b20\b/) || hasRe(s, /\b75\b/),
      successReply:
        "Both key numbers are now on the table: the discount is $20, and equivalently you pay 75 percent of the price. Either route finishes this.",
      hints: [
        "A quarter of 80 is the discount. Or flip it: 100 minus 25 is the percent paid.",
        "25 percent is one quarter. A quarter of 80 is a number you know.",
        "The discount is $20, or you pay 75 percent. Give me either one.",
      ],
    },
    {
      id: "solve",
      prompt: "Land it: what is the sale price?",
      match: (s) => hasRe(s, /\$?\s*60\b/),
      partialMatch: (s) => hasRe(s, /\b20\b/),
      partialReply:
        "Careful, that is the trap snapping shut: $20 is the discount, the amount you save. The question asks what you pay. Original minus discount is what?",
      successReply:
        "$60. Eighty minus the twenty you saved. On the ACT, the discount is always sitting in the answer choices, because it is the number you computed first.",
      hints: [
        "Price paid equals original minus discount. You have both numbers.",
        "80 minus 20. Or 75 percent of 80. Same destination.",
        "The sale price is $60. Say the amount you pay, not the amount you save.",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: a $120 bike at 25 percent off. Discount: 25 percent of 120 is $30. Sale price: 120 - 30 = $90. Or pay 75 percent directly: 0.75 x 120 = 90. The trap answer is 30, the discount, sitting there smiling.",
  mastery:
    "Solved with the trap named out loud: on discount problems, the first number you compute, the savings, is the decoy. The price paid is the answer.",
};

const ACT_PERCENT_INCREASE: TestPrepProblem = {
  id: "act-percent-increase",
  skill: "Percent increase",
  intro:
    "A town's population grows from 2,400 to 3,000. The ACT asks: by what percent did it increase? The denominator decides everything here.",
  nodes: [
    {
      id: "setup",
      prompt:
        "Percent change always divides by the original amount. First things first: how much did the population actually grow?",
      match: (s) => hasRe(s, /\b600\b/),
      partialMatch: (s) => hasRe(s, /2,?400/) || hasAny(s, ["original"]),
      partialReply:
        "2,400 is the original, the base you will divide by, correct. But first the change itself: 3,000 minus 2,400 is how much growth?",
      successReply:
        "Growth is 600, and the original, the base, is 2,400. Percent change is change over original, never over the new number.",
      hints: [
        "New minus original. The growth is a subtraction away.",
        "3,000 take away 2,400. What is left?",
        "The growth is 600 people. Say the change.",
      ],
    },
    {
      id: "solve",
      prompt:
        "Now compute it: 600 divided by 2,400, expressed as a percent, is what?",
      match: (s) => hasRe(s, /25\s*(%|percent)/),
      partialMatch: (s) => hasRe(s, /0\.25/) || hasRe(s, /\b25\b/),
      partialReply:
        "You have the right digits. 0.25 is the decimal form. The ACT wants the percent form: 0.25 written as a percent is what?",
      successReply:
        "25 percent increase. And note the trap you avoided: dividing by 3,000 gives 20 percent, the answer the test writers left waiting for anyone who grabs the wrong base.",
      hints: [
        "600 over 2,400 simplifies. Divide top and bottom by 600.",
        "600/2,400 is one quarter. One quarter as a percent is...?",
        "It is 25 percent: 600 is exactly a quarter of 2,400. Say the percent.",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: a price rises from $50 to $65. Change: 15. Original: 50. 15 over 50 is 0.3, a 30 percent increase. Divide by 65 instead and you get about 23 percent, and the ACT would happily take your point for it.",
  mastery:
    "Percent change, owned: change over original, converted to a percent. The denominator is the whole game, and you called it before computing anything.",
};

const ACT_SUCCESSIVE: TestPrepProblem = {
  id: "act-successive",
  skill: "Successive percent changes",
  intro:
    "Reach problem, a famous trap. A price is raised 20 percent, then discounted 20 percent. Compared to the start, is the final price higher, lower, or exactly the same, and by how much?",
  nodes: [
    {
      id: "setup",
      prompt:
        "Percents acting on different bases do not cancel. Go concrete: take a $100 item. After a 20 percent raise, what does it cost?",
      match: (s) => hasRe(s, /\b120\b/),
      partialMatch: (s) => hasAny(s, ["higher", "more", "increase"]),
      partialReply:
        "Higher, yes. Put the number on it: 20 percent of 100, added to 100, gives what price?",
      successReply:
        "$120. Now the discount will act on 120, not on the original 100. That asymmetry is the entire problem.",
      hints: [
        "20 percent of 100 is 20. Add it on.",
        "A raise means the new price is 120 percent of the old one.",
        "After the raise the price is $120. Say the number.",
      ],
    },
    {
      id: "solve",
      prompt:
        "Now take 20 percent off $120. What is the final price, and how does it compare to the original $100?",
      match: (s) => hasRe(s, /\b96\b/),
      partialMatch: (s) => hasRe(s, /\b24\b/),
      partialReply:
        "$24 is the amount the discount removes, right. 120 minus 24 is the final price. What is it, and is it above or below the original 100?",
      successReply:
        "$96: a net loss of 4 percent. Up 20 then down 20 is not zero, because the downward percent acts on a bigger base.",
      hints: [
        "20 percent of 120 is more than 20 percent of 100. Compute it, then subtract.",
        "The discount is 24, not 20. The final price is 120 minus that.",
        "Final price: $96, which is below the start. Say the final number.",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: start at $50. Up 20 percent: $60. Down 20 percent of 60: $12 off, landing at $48. Fifty became forty-eight, down 4 percent again. The 4 percent is not a coincidence; it is the structure.",
  mastery:
    "Trap disarmed for good: successive percents multiply, they do not add. Up 20 then down 20 always lands 4 percent below where you started.",
};

const ACT_REVERSE: TestPrepProblem = {
  id: "act-reverse",
  skill: "Reverse percent problems",
  intro:
    "Reverse problem, the far end of percent work. After a 20 percent discount, a coat costs $64. What was the original price?",
  nodes: [
    {
      id: "setup",
      prompt:
        "Work backwards carefully. The $64 is not the discount; it is what remains after paying. After a 20 percent discount, what percent of the original price do you pay?",
      match: (s) => hasRe(s, /\b80\b/),
      partialMatch: (s) => hasAny(s, ["pay", "left", "remain"]),
      partialReply:
        "Right instinct: 64 is the paid remainder. Name it as a percent: 100 minus the 20 percent discount leaves what percent paid?",
      successReply:
        "You pay 80 percent of the original. So 64 is 80 percent of something. Now it is one division away.",
      hints: [
        "Paid percent plus discount percent equals 100 percent. The discount is 20.",
        "If a fifth is taken off, four fifths remain. As a percent that is...?",
        "You pay 80 percent of the original. Say the percent.",
      ],
    },
    {
      id: "solve",
      prompt:
        "So 64 equals 0.8 times the original price. Solve for the original.",
      match: (s) => hasRe(s, /\$?\s*80\b/),
      partialMatch: (s) => hasAny(s, ["divide", "0.8", "/ 0.8"]),
      partialReply:
        "Right relationship: original times 0.8 equals 64. Undo it by dividing: 64 divided by 0.8 is what?",
      successReply:
        "$80. Verify it forwards: 20 percent off 80 saves 16, and 80 - 16 = 64. Backwards problem, forwards check, done.",
      hints: [
        "Reverse the multiplication: divide 64 by 0.8.",
        "Think in whole numbers: 64 is 8 tenths of the answer. One tenth is 8. Ten tenths is...?",
        "The original price is $80. Say the amount.",
      ],
    },
  ],
  parallelExample:
    "Worked example, a twin: after a 25 percent discount, a bag costs $45. You paid 75 percent, so 45 = 0.75 times the original. Divide: original = $60. Check forwards: 25 percent off 60 is 15 off, and 60 - 15 = 45. Works.",
  mastery:
    "Reverse percents, solved by naming what the given number represents: not the discount, but the percent you pay. Once that is named, the problem is one division.",
};

/* ------------------------------ tracks ------------------------------- */

export const TESTPREP_TRACKS: TestPrepTrackDef[] = [
  {
    id: "sat-linear",
    label: "SAT Math: Linear Equations",
    blurb:
      "Equations, systems, and word problems in the shapes the College Board loves.",
    test: "SAT",
    tiers: [
      [SAT_TWO_STEP, SAT_FRACTION_EQ],
      [SAT_DISTRIBUTE, SAT_SYSTEM],
      [SAT_IDENTITY, SAT_WORD],
    ],
  },
  {
    id: "act-percent",
    label: "ACT Math: Percents and Word Problems",
    blurb:
      "Percents, discounts, and percent change, the ACT's bread and butter.",
    test: "ACT",
    tiers: [
      [ACT_PERCENT_OF, ACT_HALF_OFF],
      [ACT_SALE_PRICE, ACT_PERCENT_INCREASE],
      [ACT_SUCCESSIVE, ACT_REVERSE],
    ],
  },
];

/* --------------------------- session logic --------------------------- */

export type ProblemGrade = "clean" | "solid" | "struggled";

/** Grade one finished problem from its engine state. */
export function gradeProblem(state: SocraticState): ProblemGrade {
  if (state.parallelsUsed > 0 || state.hintsUsed >= 4) return "struggled";
  if (state.hintsUsed <= 1) return "clean";
  return "solid";
}

/** The tier the next problem should come from, given a grade. */
export function nextTier(currentTier: number, grade: ProblemGrade): number {
  if (grade === "clean") return Math.min(2, currentTier + 1);
  if (grade === "struggled") return Math.max(0, currentTier - 1);
  return currentTier;
}

/**
 * Pick the next problem: prefer the requested tier, then fall back to the
 * other tiers, always avoiding problems already used this session. Returns
 * null only when every problem in the track has been used.
 */
export function pickProblem(
  track: TestPrepTrackDef,
  tier: number,
  usedIds: string[]
): TestPrepProblem | null {
  const order = [tier, 0, 1, 2].filter((v, i, a) => a.indexOf(v) === i);
  for (const t of order) {
    const found = track.tiers[t].find((p) => !usedIds.includes(p.id));
    if (found) return found;
  }
  return null;
}
