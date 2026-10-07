# Numbers: log them every run, change one thing at a time

## Every run starts here (preflight)

```sh
node ~/.claude/skills/cp/bin/yt.mjs numbers      # read-only on YouTube; ≈5 s
node ~/.claude/skills/cp/bin/yt.mjs next-slot    # the slot this Short will take, and its length arm
```

- `numbers` rewrites `numbers.md` in this skill (the length test's arms side by side, then every upload) and appends
  one line to `numbers.jsonl` (the history: views at 24 h, 72 h … can be read back from it). Never edit either by hand.
  The skill backup at the end of the run (step 19) carries both to the repo.
- Read three things in its output: the channel line (subscribers and the change since the last log), the length-test
  table, and the newest six rows of the upload table.
- Views and likes are the public counters, live. Stayed, average % viewed and subscribers come from YouTube Analytics,
  which runs about two days behind: a dash means YouTube has not processed that day yet, not that nobody watched.
- If the report says "Analytics failed", carry on: the public counters are still logged. Put the reason in the final
  report. A scope or permission error needs the user (`yt.mjs auth`, both boxes ticked): never authorize unattended.
- A run reads the numbers; it does not change the rules from them. Rules change when the user says so, or through a
  dated entry under "Readings" below that the user has seen.

## What the first week said (5 Oct 2026; 10 Shorts, 13,964 views, +39 subscribers)

| Short | Length | Views | Stayed to watch | Avg % viewed | Avg s | Subs per 1,000 | Answer or mechanism arrives |
|---|---|---|---|---|---|---|---|
| ears pop | 48 s | 1,528 | 51.9 % | 65.5 % | 31 | 3.9 | 5 s ("Your ear just burped.") |
| goosebumps | 49 s | 1,905 | 47.1 % | 59.2 % | 28 | 3.1 | 10 s |
| stomach growl | 50 s | 1,373 | 44.2 % | 55.7 % | 27 | 1.5 | 11 s (after "It's called… borborygmi.") |
| yawning | 50 s | 2,142 | 56.6 % | 54.2 % | 27 | 4.2 | 15 s |
| lightning | 66 s | 1,355 | 55.9 % | 58.0 % | 38 | 0.7 | – |
| hypnic jerk | 73 s | 1,133 | 45.4 % | 53.8 % | 39 | 0.9 | – |
| fingers wrinkle | 65 s | 1,580 | 63.3 % | 48.3 % | 31 | 2.5 | – |
| brain freeze | 75 s | 1,280 | 64.1 % | 42.8 % | 32 | 3.1 | 22 s (after the name, 12–18 s) |
| onions | 74 s | 1,277 | 63.7 % | 35.0 % | 25 | 3.1 | 10 s |

(Studio, 28 Sept – 4 Oct. Sun sneeze had only its first hours. 92.7 % of views came from the Shorts feed.)

1. **No breakout.** Every Short landed between 1.1K and 2.1K views: the feed gives each one a similar test batch and
   has pushed none further. The push ends within hours of release.
2. **The loss is right after the hook.** In the 65–75 s Shorts a third to a half of the viewers left between 10 % and
   25 % of the video, seconds 7 to 18, where the joke ends and the explanation starts. Retention curves (share still
   watching at 10 / 25 / 50 / 75 / 100 %): lightning 0.95 / 0.67 / 0.49 / 0.45 / 0.36 · hypnic jerk 0.98 / 0.61 / 0.46 /
   0.40 / 0.25 · fingers 0.97 / 0.72 / 0.43 / 0.24 / 0.13 · brain freeze 0.93 / 0.51 / 0.36 / 0.21 / 0.15 · onions
   0.78 / 0.42 / 0.24 / 0.18 / 0.04 · yawning (290 views counted) 1.00 / 0.82 / 0.52 / 0.31 / 0.12.
3. **The earlier the answer, the more gets watched.** Among the 46–50 s Shorts, average % viewed falls in the order
   the answer arrives: 5 s → 65.5 %, 10 s → 59.2 %, 11 s → 55.7 %, 15 s → 54.2 %.
4. **A spoken name costs viewers.** Brain freeze spent seconds 12–18 on "sphenopalatine ganglioneuralgia"; it went
   from 93 % of its viewers at 7 s to 51 % at 19 s, the stretch that holds the name.
5. **"You" + a physical action holds the first seconds.** Stayed to watch: onions 64–67 %, brain freeze 64 %, fingers
   63 % (chopping, slurping, soaking) against stomach growl 44 %, hypnic jerk 45 %, goosebumps 47 % (a scene being
   set, or lying still). Nine videos: a lead, to be re-read as the log grows.
6. **Viewers give about 30 s whatever the length.** Average seconds watched: 23–39, mostly 27–31. So a 32 s Short
   would be watched nearly to the end, and a 50 s one loses most people before its payoff.
7. **Almost nobody reached the end.** 4–15 % of viewers were still there in the last seconds (lightning 36 %, hypnic
   jerk 25 %), which is where the subscribe line and the pill sat. Onions went from 14 % to 4 % during its line.
8. **The subscribe hooks do work when seen.** Subscribers per 1,000 views: about 3.3 on the six Shorts that carry
   them, about 1.5 on the three made before them.
9. Shares: 4 on 14K views. The weekly long-form had 20 views after a day (too early to judge; revisit after three).

## The rules that came out of it (user: "yes", 5 Oct 2026)

| Rule | Where it lives | The gate |
|---|---|---|
| The answer starts by 5.0 s, as a plain surprising claim or metaphor | `story.md` §2, `narration.md` | qa.py: the `answer` block's first word |
| No spoken naming beat, no bridge before the answer | `story.md` §2 | ship bar items 1 and 2 |
| Open with "You…" + a physical action | `story.md` §2 | qa.py warns; ship bar item 1 |
| The subscribe aside and the pill sit mid-video, the word at 50–70 % of the runtime; ≤ 45 characters; the Short ends on the button and the loop | `narration.md`, `visual.md` | qa.py: position and length; ship bar item 11 |
| The length test: 30–35 s in a 23:30 slot, 45–50 s in an 11:30 slot | below | qa.py: the arm's band |

## The length test (`length-2026-10`, from the Short released 6 Oct 2026 23:30 IST)

- **Arms.** SHORT: 30–35 s, 66–76 words in all. STANDARD: 45–50 s, 95–110 words (the house length since 1 Oct).
  Both arms follow every other rule, so length is the only thing that differs between them.
- **Assignment.** By the YouTube slot the Short will take: a 23:30 slot is SHORT, an 11:30 slot is STANDARD. In the
  steady state the 00:00 run fills that day's 23:30 slot and the 06:00 run the next day's 11:30 slot, but the arm
  follows the slot, not the routine: after a missed night the next run simply builds whatever the free slot needs.
- **How a run uses it.** `yt.mjs next-slot` prints the slot, the arm and a `"length"` object; `new-short.sh` writes
  that object into the new Short's `publish.json`. Write the script to the arm's word budget (`narration.md`). qa.py reads the arm from `publish.json`:
  standard passes at 43–50 s and fails over 55 s; short passes at 30–35 s and fails over 37 s; anything in between is
  a warning. `yt.mjs upload` prints a note if the slot it takes no longer matches the arm (rare: the report shows the
  length and the slot of every Short either way). A Short that is resumed keeps the arm already in its
  `publish.json`; one started before 5 Oct 2026 has none and is finished by the rules it was started under.
- **The verdict is views per Short and subscribers per 1,000 views.** A shorter video scores a higher average %
  viewed by construction, so that column cannot decide it. What matters is whether the feed pushes the short ones
  further, and whether they still convert.
- **The slots are not equal.** Before the test, 11:30 Shorts drew more views than 23:30 ones (2,154, 1,932 and 1,431
  against 1,396 and 1,619; pins-needles and voice-recording still to come). `numbers.md` therefore keeps two "before"
  rows, one per slot, at the same 46–50 s length. Read each arm against its own slot's "before" row first (short arm
  vs "before · 23:30", standard arm vs "before · 11:30": the second pair shows what the new opening and the mid-video
  aside did by themselves), and only then the arms against each other.
- **When.** First reading on or after 14 Oct 2026: seven Shorts per arm released, five or more per arm with Analytics
  data. Call a difference only when the gap is 25 % or more in views per Short, or in subscribers per 1,000 views
  with views within 10 %; anything smaller is noise at seven Shorts an arm.
- **Who.** The first run on or after 14 Oct writes the reading under "Readings" below (the table's rows, the
  comparison in two sentences, what it suggests) and leads its final report with it. The user decides: keep 30–35 s
  for every slot, go back to 45–50 s, or swap the arms' slots for a second week to cancel the slot effect. A run never
  ends, swaps or extends the test by itself; until the user says otherwise the test simply continues.
- **Changing it** (after the user decides): the constants `LENGTH_TEST` and `LENGTH_ARMS` at the top of `bin/yt.mjs`
  (`null` ends the test, every slot is standard again; swapping the two slot values swaps the arms), then the length
  lines in `SKILL.md`, `brief.md`, `narration.md`, `story.md` §3 and the two routine prompts.

## Reading one Short's retention curve

```sh
node ~/.claude/skills/cp/bin/yt.mjs analytics 15 --curve <videoId>
```

It prints the share of viewers still watching at 1 / 10 / 25 / 50 / 75 / 90 / 100 % of the video (above 1.0 means
rewatches) and the steepest drop. A Short needs a few hundred counted views before its curve means anything. Read it
against the script:
- **at 10 %:** the hook. Under 0.90 means frame 1 or the first words lost them.
- **10 % → 25 %:** the answer and the start of the mechanism. This was the cliff before 5 Oct; with the answer by 5 s
  it should flatten.
- **around 50–70 %:** the subscribe aside. A step down there that is steeper than the slope before it means the aside
  reads as an outro: shorten it, or tie it harder to what comes next.
- **90 % → 100 %:** the ending. A button that loops holds; an ending that announces itself drops.

## Readings

- **5 Oct 2026 (baseline, before any Short made to the new rules).** 43 subscribers; 13,964 views and 67.1 watch hours
  in the first week; 54.7 % stayed to watch, 51.1 % average viewed, 0:30 average; 2.8 subscribers per 1,000 views.
  The table and the nine points above are this reading.
- **7 Oct 2026 (Studio, the first Short made to the 5 Oct rules).** 66 subscribers; 21,390 views, 55.8 % stayed,
  54.0 % average viewed over all time.
  - Hiccups (34 s, new rules, 6 Oct 23:30): 1,430 views counted, **63.8 % stayed, 72.7 % average viewed** (24 s), 1
    subscriber, 24 likes. The best average viewed on the channel (ears pop had 66.9 %) and level with the best
    stayed. Its views did not move: about 1,300 of them came between hour 2 and hour 5.5 after release, then a
    trickle. Déjà vu (47 s, new rules) had one hour of data: too early.
  - Every Short still lands at 1.2K–2.2K views whatever its retention (onions: 64 % stayed, 1,317 views; goosebumps:
    48 % stayed, 2,065). That is one test batch from the Shorts feed and no second one: a plateau, not a penalty.
    Better retention is necessary for a second batch; at 64 % / 73 % it has not been sufficient yet.
  - The opening frames of 13 Shorts were re-drawn from their sources and set against stayed-to-watch
    (`reference/openings.jpg`): tight shots of him eating, drinking, cutting or touching something kept 64 %; medium
    shots 53–58 %; wide, still or phone-screen openings 46–50 %. Brightness, saturation and early motion: no link
    (correlations between −0.11 and +0.13). The rule is in `story.md` §2 ("The first picture"), from the Short for
    8 Oct 23:30 on. It applies to both lengths, so the length test is not disturbed.
  - Still open: hiccups' retention curve (due 8 Oct evening) will show whether the mid-video subscribe aside costs
    viewers; its subscribers per 1,000 views so far is low (0.7) on one Short.

