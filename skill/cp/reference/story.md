# Story: from a topic to a 30–50 second experience

## 1. Research first (15–20 minutes; it prevents re-voicing)

- Read 3–5 solid sources: review articles, university or medical pages (NIH/NINDS, Mayo, Cleveland Clinic, Sleep
  Foundation), a science journalist's explainer (BBC Future, Scientific American), and the Wikipedia article for its
  references. Use WebSearch/WebFetch.
- Write the claims table for the README's science notes before writing a word of script:
  - the claim;
  - its status: established, leading idea, debated, or myth;
  - its source.
  Anything below "established" is said as a hedge ("Scientists think…", "One idea…", "Some studies say… another says
  meh").
- Find the three things a curious friend would say "wait, what?" to:
  - the counter-intuitive mechanism (your body does it ON PURPOSE);
  - the proof (people with damaged finger nerves don't wrinkle);
  - the weird bonus fact (same pattern every time; hiccups are the same kind of twitch).
  The first becomes the answer line, the second the payoff, the third the weirdest fact.

## 2. The opening: a hook, then the answer by second 5

Rewritten on 5 Oct 2026 from the channel's first-week numbers (the evidence is in `analytics.md`). qa.py checks the
two timings; the ship bar checks the rest.

- **The strongest curiosity angle is almost always an experience the viewer has had**, told in the second person.
- **The hook (0–3 s): "You…" plus something physical, then the strange thing.**
  - The first word is "You" or "Your", and within the first few words you are doing something with your hands, mouth
    or body, to an everyday object: "You're chopping an onion like a TV chef… and suddenly you're SOBBING." / "You
    take ONE giant slurp of milkshake… and your forehead FREEZES!"
  - Not a scene being set ("Silent exam…", "Scary movie… creepy music…") and not lying still ("You're drifting off…").
    The three Shorts that opened on an action kept 63–67 % of viewers past the first seconds; those three kept
    44–47 %. (Nine videos: a working rule, re-read as the numbers grow.)
  - The line is under 3 seconds, starts mid-action and ends on a jolt, a reveal or a question. Frame 1 shows the
    action itself, close; picture and sound hit on the same frame.
- **The first picture: a tight shot of him already eating, drinking, cutting or touching the thing** (7 Oct 2026,
  from the opening frames of 13 Shorts set against how many viewers stayed; `reference/openings.jpg` shows them).
  - The four openings that kept the most viewers (64 % each: brain freeze, onions, hiccups, fingers) all start, on
    frame 0, with him close (his head 350–450 px tall in the 1080×1920 frame; in fingers it is his hand, larger
    still) and a real thing at his mouth or in his hand: a straw in a milkshake, a knife in an onion, a glass at his
    lips, a hand going into water. The action is already happening.
  - The five that opened on a medium shot (his head about 240 px tall, nothing in his mouth or hands being used)
    kept 53–58 % (yoga studio, cinema door, bus, plane seat, café door). The four that kept the fewest (46–50 %)
    opened wide (an exam hall), still (a sleepy face), full-body on a couch (popcorn flying, but small), or on a
    phone screen (a thumb on PLAY: tight and moving, but a screen, and it kept only 50 %).
  - Closeness alone is not it: hypnic jerk opened on his face at 760 px, lying still, and kept 46 %. What the top
    four share is the doing: mouth or hands on a real thing, mid-action.
  - So: frame 0 to about second 1.5 is that tight shot. No establishing shot, no calm pose, no phone or computer
    screen as the first picture. The room, the other people and the wide view come after second 2, once the strange
    thing has happened.
  - Pick the topic's opening for this. Every topic has one: knuckles (two hands, bending, close), mosquitoes (the bite
    landing on his forearm), fireflies (his hands closing a jar on a glow), dreams (his hand slapping a ringing alarm clock).
  - Brightness, colour and how much the picture changes in the first half second showed no link with who stayed
    (measured on the same 13 openings), so don't chase those; it is what he is doing, and how close we are.
  - Thirteen Shorts, grouped after the fact: a strong lead, re-read as `numbers.md` grows.
- **The answer (the `answer` block; it STARTS by 5.0 s).** Straight after the hook, say what is going on, as a plain,
  surprising claim or a metaphor a ten-year-old would get: "Relax. Your ear just burped."
  - It is usually the first joke as well: the old "reaction" beat and the answer are now one line.
  - It must leave a "wait, how?" behind it. The rest of the Short is the proof of that one line.
  - Nothing sits between the hook and the answer: no "Here's the thing.", no "So what's going on?", no "Why?".
  - Why: among the 46–50 s Shorts, the earlier the answer arrived, the more of the video got watched: 5 s → 65.5 %,
    10 s → 59.2 %, 11 s → 55.7 %, 15 s → 54.2 %. In the longer Shorts a third to a half of the viewers left between
    seconds 7 and 18, while they were still waiting for it.
- **No naming beat.** Never spend spoken seconds on what the thing is called ("Doctors call it… sphenopalatine
  ganglioneuralgia.", "It's called… borborygmi.", "That's a hypnic jerk."). Brain freeze fell from 93 % to 51 % of its
  viewers across the stretch that held the name.
  - If the name is worth having, it pops up as an on-screen label while the narration keeps moving, or it comes late
    as a throwaway joke.
  - The same goes for a number that only labels the thing ("About half of adults catch it."): keep it only if it is
    the weird fact.

Old openings redone to the rule (they show the shape; don't reuse them as scripts):

| Short | It opened with | By the rule |
|---|---|---|
| ears pop (the model: 65.5 % viewed) | "Your plane takes off… and your ears go… POP!" / "Relax. Your ear just burped." | as it is |
| stomach growl | "Silent exam… then your stomach goes…" / "Cool. Very cool." / "It's called… borborygmi." | "You're sitting a silent exam… and your stomach ROARS." / "Relax. That's your gut… taking out the trash." |
| brain freeze | "You take ONE giant slurp of milkshake… and then your forehead… FREEZES!" / "Your forehead. The milkshake went in your MOUTH." / "Doctors call it…" | the same hook / "Your mouth just pulled the fire alarm… and your forehead got the bill." (the name, if at all, is a label) |
| goosebumps | "Scary movie… creepy music… and your arm does… this." / "Congrats. You're a plucked goose." | "You press play on a horror movie… and your arm hair stands UP." / "That's your body trying to look bigger. It's not working." |

## 3. The shape (the same beats at both lengths)

`yt.mjs next-slot` says which length this Short is: STANDARD (45–50 s) or SHORT (30–35 s, the length test in
`analytics.md`). The beats are identical; the short arm spends fewer words on each.

| Beat | Block | 45–50 s | 30–35 s | What it does |
|---|---|---|---|---|
| Hook | `hook` | 0–3 s | 0–3 s | "You…" + a physical action, then the strange thing |
| Answer | `answer` | starts by 5.0 s | starts by 5.0 s | the plain, surprising claim or metaphor; the first laugh |
| Mechanism, shown | 2–4 blocks | to ≈ 25 s | to ≈ 17 s | ONE mechanism, step by step; the camera travels to each thing as it is named |
| Payoff | `payoff` | ≈ 25–29 s | ≈ 17–20 s | the moment it clicks: the proof, or "that's why…" |
| Subscribe aside | `sub` | ≈ 27–32 s | ≈ 18–22 s | ≤ 45 characters; the word "subscribe" at 50–70 % of the runtime; the pill plays on it |
| The weirdest true fact | 1–2 blocks | to ≈ 42 s | to ≈ 29 s | stranger than everything before it; hedged when science isn't sure |
| Button and loop | `button` | to 45–50 s | to 30–35 s | the line that reframes or undercuts; the picture cuts back to frame 1 |

- One idea per block and one visual per idea. Every 3–5 s there is a new question or reveal. A question that leads
  into a beat ("How do we know?", "And the weirdest part?") is folded into the line that answers it; it is never a
  block by itself, and never comes before the answer.
- Escalate. Each reveal should be stranger or bigger than the last. The weirdest true fact comes after the aside, so
  the aside has something to promise.
- Comedy comes from situation and timing, not from wacky voices:
  - a deadpan understatement after a big moment;
  - a callback (raisin → raisins → "turn into a raisin");
  - an anticlimax ("Unproven… but cool.");
  - the body as a clumsy coworker.
  Two to three laugh beats at 45–50 s; two at 30–35 s (the answer line and the button).
- **The ending is the button and the loop.** A last line that reframes the whole thing ("that's just your body putting
  on snow tires") or undercuts it ("Probably."), a final visual gag, and the last shot ends on the picture of frame 1
  so the Short restarts cleanly. No ask, no "Next up", no outro: an ending that announces itself is the viewer's cue
  to swipe.
- What a 30–35 s Short drops: the hedged debate, the second example, the bonus fact (each can be another day's
  topic). Never the answer line, the aside, or the comedic gaps (tighter, but there).

The first Shorts (64–75 s, up to onion tears) followed an older shape: hook → reaction → name → mechanism →
twist/proof → debate → bonus → button → subscribe line. `reference/examples/` holds finger-wrinkles and hypnic-jerk in
that shape: use those files for craft (timeline, scenes, audio, how a script is directed), not for structure.

## 4. Picking topics

A good CurioPulse topic:
- is a question people Google or ask out loud;
- is about the body, the brain or everyday physics;
- has a mechanism you can SHOW inside something (a body, a cell, a cloud);
- has a funny human situation to hang it on, one where the hiker is DOING something on frame 1.

`topics.md` holds the queue. Before adding one, check it isn't already on the channel (`videos.md`) or in the
queue. Prefer topics where the hiker can be the one it happens to.

## 5. The one-page plan (write it in the video README before any code)

1. The length arm (`yt.mjs next-slot`), and with it the word budget.
2. The hook sentence, the answer line and the button line.
3. The claims table (science notes).
4. The beat list, with a time estimate each (≈ 2.15 words/s at Jessica's pace including the gaps): the answer must
   start by 5.0 s and the word "subscribe" must land at 50–70 % of the total.
5. For every beat:
   - the picture (world, camera move, what changes);
   - the sound (hit, bed, music state);
   - the caption emphasis.
6. The shot that will be under the subscribe pill (about 3 s around the aside): its hero and key action stay above
   y ≈ 1050 (`visual.md`).
7. How the last shot gets back to the picture of frame 1.
8. The world files needed:
   - reuse from past videos where possible (`engine.md`, "Borrowing from past videos");
   - list what must be built new.
9. The cover frame: which moment, what text.
