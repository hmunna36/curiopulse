# Hook rules (the user's hook library, 9 Oct 2026: "change all the active content youtube pipelines with these rules")

These rules bind every video this pipeline makes. Where an older line of this skill says something different about
the opening, this page wins; the rules that came from the channel's own numbers (in `analytics.md`, where the skill
has one) stay in force next to it.

A hook is the opening: the first 15 seconds of a long video, the first 3 to 5 seconds of a Short. It does three jobs:
1. it confirms the click the title promised;
2. it raises a question the viewer cannot close;
3. it proves the payoff exists.
A hook that only does the third is a summary, and it leaks viewers.

## The five rules

1. **Confirm the title in the first sentence.** A hook that ignores its own title is why people leave at 0:08. The
   first spoken sentence and the first picture are about the exact thing the title names.
2. **One idea.** A hook carrying two promises keeps neither.
3. **Specific beats big.** "400 to 200,000 in seven months" outperforms "massive growth". Use the number, the name,
   the place, with its source in the claims table.
4. **Show the artifact inside 20 seconds if you promised one.** If the hook promises a thing (the answer, the
   machine, the proof, the picture on the thumbnail), it is on screen within 20 seconds; in a Short, within 5.
5. **Never open with who you are.** No channel name, no greeting, no "in this video", no subscribe pitch: it has not
   been earned yet.

## The 21 formulas (pick ONE per video; write its name in the README's plan)

| Formula | Shape | It fails when |
|---|---|---|
| The Statistic | a number the viewer did not know, stated flat, then the consequence | the number is vague or unverifiable: say the source |
| Someone Else's Result | a named person's outcome, then the mechanism | the number is invented, or the person cannot be named |
| The Mistake | name the error the viewer is probably making right now | the mistake is rare, or the viewer cannot check it in one second |
| Contrarian Flip | state the accepted advice or belief, then reject it | the evidence does not come in the next 15 seconds |
| The Reveal | promise a specific thing will be shown, then show it | it is shown late: a reveal at 8:00 is a cliff at 1:00 |
| The Superlative | the single best, worst, fastest of a category | it does not name what it beat |
| The Clock | bound the payoff in time | the clock is not true |
| I Tried It | a first-person experiment with a stated cost | there is no real cost (time, money, risk) |
| The Question | the exact question the viewer typed into search | it is the maker's question, not the viewer's |
| Before and After | two states, one cut between them | there is no visual for both states |
| The Teardown | take a real thing apart in public | it does not say what was pulled and how many |
| The Stack | two named things combined into one outcome | the outcome does not need both |
| The Warning | a cost the viewer is about to pay | the cost is small: then the hook is a lie |
| The List | a counted set, with the count in the first line | the count is not exact, or the items are the same in kind |
| The Receipt | show the artifact first, explain second | there is no real artifact to show |
| The Insider | information from inside a system | the access is claimed, not real |
| The Impossible Claim | something that sounds untrue, then the proof | the proof does not start within 20 seconds |
| The Comparison | two named options, one winner | the loser is not said out loud |
| The Origin | where a result actually came from | it is used more than once per channel |
| The Deadline | something is changing on a date | the date is not real and checkable |
| The Direct Address | name the exact viewer in the first six words | it is broad: "if you make videos" addresses nobody |

## How a run uses it

- In the story step, write three candidate hooks in three different formulas, check each against its "fails when"
  and the five rules, and keep the strongest. Put the formula's name and the hook line into the README's plan.
- Do not use the same formula for more than three videos in a row: read the last three READMEs (or the video log).
- Never bend a fact to fit a formula. If no number is sourced, The Statistic is not available; if nothing changes on
  a date, The Deadline is not available.
- The hook item of the ship bar is scored against this page: name the formula, quote the first sentence, and say how
  it confirms the title.

## In this pipeline (CurioPulse Shorts)

- The hook is seconds 0 to 3; the answer line (by 5.0 s) is the artifact of rule 4.
- The channel's own rules stay: frame 0 is a tight shot of him doing something physical, and the opening is one
  continuous shot through the answer (`story.md` §2). The formula shapes the SENTENCE, not the picture.
- "You..." stays the default first word (The Direct Address, or The Question put to the viewer). When another formula
  carries the Short (The Statistic: "One in four people sneeze at the sun."; Contrarian Flip: "Everyone says cracking
  your knuckles gives you arthritis."; The Mistake; The Impossible Claim), "you" or "your" still lands within the
  first six words or in the very next sentence; qa.py's "opens with You" stays a warning, not a failure.
- Not for a 30 to 50 s animated Short: The Receipt, The Teardown, The Stack, The Origin, The Deadline, The Insider.
