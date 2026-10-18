# Why Do You Feel TWO Noses? (Cross Your Fingers) 🤞 — Short (34 s)

**Final file:** [`two-noses-short.mp4`](two-noses-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 34.2 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`two-noses.srt`](two-noses.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in blue pyjamas at his bathroom mirror (the mirror is the camera, borrowed from blocked-nostril), his middle
finger crossed over his index and the tip of his nose in the gap; then the brain's purple room, where a screen shows the
hand the brain still believes in. Same narrator, captions, watermark and bloom look as every CurioPulse Short.
Lit in the cinematic look (`publish.json` "look": "cine"): the bathroom by its morning window (`MORN_LIGHT`, the key from
the left), the brain's room by its screen (`ROOM_LIGHT`); set in `setLights` at the end of `src/web/scenes.js`.

## Plan (written before any code; story.md §5)

1. **Length:** the short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: 17 Oct 2026 23:30 IST). Script: 74 words.
2. **The test:** cross your middle finger over your index finger and rub the tip of your nose in the gap between the
   fingertips: most people feel two noses. Safe, two seconds, phone in the other hand.
   - Hook formula (hooks.md): **The Impossible Claim**, proved on the spot by the test. "You've got TWO noses. / Cross
     your fingers and rub your nose in the gap." It confirms the title (TWO noses) in the first sentence. Not The
     Direct Address: the last three Shorts used it. Candidates weighed: The Direct Address ("Cross your fingers and
     rub your nose in the gap... TWO noses?!": strongest test, but a fourth in a row), The Question ("How many noses
     do you have?": the answer is not a surprise until they try), Contrarian Flip ("You've got ONE nose, right?":
     slower, the answer would start after 5 s).
   - Answer (starts by 5 s): "Your fingers swapped seats... and nobody told your brain."
   - Button (runs into the claim when the Short loops): "Still two? Keep your fingers crossed." / "You've got TWO
     noses." The idiom is also the study's method.
   - Caption question: **One nose or two?**
3. **Claims table:** below, under Science notes.
4. **Beats** (≈ 2.15 words/s with the gaps): claim 0–1.4 · test 1.5–4.2 · answer ≈ 4.5–7.5 · map ≈ 7.8–9.8 ·
   edges ≈ 10–13 · payoff ≈ 13.3–17.5 · weird ≈ 18–25 · button ≈ 25.5–28 + the cut back to frame 1. Every mechanism
   line points back to the viewer's fingers; no science word is spoken (the name, Aristotle's illusion, is a label).
5. **Pictures:**
   - claim + test: the bathroom seen from its mirror (blocked-nostril's `mirror.js`), tight on him, his right hand up,
     middle finger crossed over the index, the tip of his nose in the V of the fingertips, rubbing; on "TWO" a second,
     dashed "felt" nose pops beside the real one and his eyes cross down at it.
   - answer: name badges INDEX and MIDDLE on the two fingertips, two arrows swap them (they swapped seats); on
     "nobody told your brain" a round window opens on his forehead: the brain inside, asleep at its desk.
   - map: the dive through the window into the brain's room: a screen marked YOUR FINGERS shows its picture of the
     hand, the two fingers side by side, uncrossed, under their badges; him still rubbing in a round inset.
   - edges: on the screen, the two OUTSIDE edges glow and two marbles touch them at once: "2 THINGS".
   - payoff: back on his real crossed fingers, close: the same two glowing edges both touch ONE nose; the brain's
     screen draws its version, a nose against each outside edge, and then his face with two noses. Label: ARISTOTLE'S
     ILLUSION (he described it about 2,350 years ago).
   - weird: a volunteer (him, in a lab) with two fingers taped crossed, living with it: a month counter flips 1 to 6
     while the screen's map slowly redraws the fingers crossed; the brain's light comes on.
   - button: back at the mirror; deadpan; he holds up his crossed fingers for luck, then back onto his nose: frame 1.
6. **No Subscribe pill:** the button shot ends clean.
7. **The loop:** the last 0.4 s are the hook at negative time: the hand arrives at his nose; frame 1 is him rubbing.
8. **World files:** `mirror.js` (blocked-nostril, borrowed), the brain (`erBrain`, from blind-spot's
   `brainpaint.js`), new: `fingers.js` (the crossed fingers at his nose, the badges, the felt nose), `fingermap.js`
   (the brain's screen of the hand), `lab.js` (the taped volunteer and the month counter).
9. **Cover:** him in the mirror, crossed fingers on his nose, the felt second nose beside it, with TWO NOSES?
10. **Caption question:** One nose or two?

## Narration (74 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> You've got two noses. / Cross your fingers and rub your nose in the gap. / Your fingers swapped seats... and nobody
> told your brain. / It still thinks they're side by side. / Both OUTSIDE edges touched at once? Always two things. /
> Cross them, and both edges touch ONE nose... so your brain counts TWO. / Volunteers once kept two fingers crossed for
> up to SIX MONTHS... until their brains caught on. / Still two? Keep your fingers crossed.

The claim's take is an audition (seed 5, no tag): the tagged takes ran 2.3–3.0 s and put the answer after 5 s; this one
runs 1.4 s with the widest pitch range of five. The payoff's take is an audition too (seed 8, "TWO" in capitals): its
"nose..." and "TWO." hold up in the speech band (qc_inband).

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/vW0AeAfgNe0 | 17 Oct 2026 23:30 IST (scheduled by the Data API; custom thumbnail checked in Studio; playlist Your Brain Is Weird) |
| Instagram Reels | (the publishing job writes the link when it goes out) | 20 Oct 2026 18:30 IST (queued by the Instagram API, route B) |
| Facebook Page CurioPulse | – | 20 Oct 2026 18:30 IST, scheduled by the Page API on 17 Oct (video 2181418382439445) |

**Title:** Why Do You Feel TWO Noses? (Cross Your Fingers) 🤞

**Description:**
Cross your fingers and rub the tip of your nose in the gap between them: most people feel two noses. Your fingers
swapped places, and nobody told your brain. It still treats them as side by side, and a touch on both OUTSIDE edges at
once has always meant two separate things. Crossed, those two edges both touch your one nose... so your brain counts
two. Aristotle described this trick more than 2,000 years ago, and in a 1991 study volunteers kept two fingers crossed
for up to six months, until their brains finally learned the new layout. One nose or two?

Subscribe for a new strange question every day.

**Hashtags:** #Shorts #Science #AristotlesIllusion #Brain #HumanBody #FunFacts
**Tags:** two noses illusion, aristotle illusion, crossed fingers nose, cross your fingers touch your nose, tactile illusion, touch illusion, brain tricks, why do i feel two noses, body illusion, illusion you can try, science shorts, brain facts, human body facts, fun science, curiopulse
**Reels caption:** Cross your fingers and rub your nose in the gap... two noses? 🤞👃 / Your fingers swapped places and your brain never got the memo: a touch on both outside edges at once has always meant two things. / One nose or two? / Follow @curio_pulse_tv for the next one: can you roll your tongue? 🔔 / #science #humanbody #brain #illusion #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: can you roll your tongue? 👅 Subscribe so you don't miss it! / One nose or two? 👃
**Playlist:** Your Brain Is Weird
**Length arm:** short (30–35 s, every Short since 16 Oct 2026), from `yt.mjs next-slot`: 34.2 s
**The viewer's test (rules of 15 Oct 2026):** cross your middle finger over your index finger and rub the tip of your nose in the gap between the fingertips: most people feel two noses.
**Answer line (spoken, starts by 5 s):** "Your fingers swapped seats... and nobody told your brain." (4.75 s)
**The loop:** "Still two? Keep your fingers crossed." / "You've got two noses." The last 0.4 s bring his crossed fingers from beside his cheek back onto his nose: frame 1. No Subscribe pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), a frame of its own (`SC.cover`): him at the mirror with the felt second nose beside his real one, TWO / NOSES?

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–8.8 | hook | The mirror, tight (his head about 700 px): his crossed fingers already rubbing his nose on frame 0. On "two" a see-through second nose with a dashed outline pops beside the real one, his eyes cross down at it, TWO?! An arrow shows the middle finger going over. Badges INDEX and MIDDLE stand at their old seats with leaders crossing to the fingertips, then slide past each other ("swapped seats"). On "nobody told your brain" a round window opens on his forehead: the brain asleep at its desk under a screen of the fingers side by side |
| 8.8–15.0 | room | The dive through the window. The brain's room: its screen YOUR FINGERS shows the hand it believes in, middle left, index right; the brain wakes and points. The OUTSIDE edges glow, two marbles touch them at once: 2 THINGS. Him still rubbing in a round inset |
| 15.0–22.7 | macro | Back on his real hand, very close, the two outside edges glowing: the fingers start side by side, cross on "Cross them," and slide up onto his nose: both glowing edges on ONE NOSE. Label: ARISTOTLE'S ILLUSION, ~350 BC. A thought bubble shows what the brain makes of it: the fingers side by side with a nose against each outside edge, 2 NOSES; the felt nose pops again |
| 22.7–30.6 | months | The mirror, wider: his two fingers taped crossed, held up beside his cheek; a wall calendar tears off MONTH 1 to 6, the room goes day, night, day, his face bored, annoyed, sleepy, grim. On "until their brains caught on" the window on his forehead shows the screen's drawing cross and a light bulb come on; his fingers go to his nose: ONE NOSE, a tick |
| 30.6–33.8 | button | The morning mirror, tight: deadpan, rubbing; "Still two?" brings the felt nose back; on "Keep your fingers crossed" he lifts the crossed fingers beside his cheek, for luck |
| 33.8–34.2 | loop | The hook at negative time: the fingers come down onto his nose, so the cut to frame 1 is one move |

## Sound design

- **Beds:** the bathroom's room tone (brown noise under 230 Hz); the brain's room, a low hum under 170 Hz.
- **The rub:** a soft skin hiss above 5.2 kHz on the picture's own clock (the speed of his hand), so it runs under the
  words from frame 0.
- **Hits:** a low dun under "two" and a sparkle as the felt nose appears, a cork pop after "noses."; swishes for the
  arrow; the badges' glints, a ratchet (top only) as they slide and a slide-whistle note after "seats..."; glints as the
  window opens, a snore under "told your brain" (under 420 Hz), a whoosh into his head; the brain's wake bloop; a top
  buzz as the edges light; two glass tinks after "once?" and a ding after "things."; a squeak as the fingers cross, a
  low thud as they land, glints on "ONE", boing-boing after "TWO."; a page tearing off each month (top only), a
  ticking clock, a riser into "until", a bright ding and a sparkle after "caught on."; a deadpan wah after "Still
  two?", a sparkle for luck after "crossed.", a whoosh as the hand comes back down into frame 1.
- **Score:** a bouncy F groove under the claim and the test, a lighter one back after the answer's first words, a low
  drone under "nobody told your brain"; an arpeggiated D minor groove in the brain's room; a snapping groove on his hand;
  a faster one (124 BPM) through the months, a drone into "caught on"; a light groove for "Still two?". It stops for
  every punchline: after "noses.", after "things.", from "counts TWO" to the months, after "caught on.", and from "Keep"
  to the end (the loop).
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after
  AAC. The gags sit −18 to −23 dB in their gaps with the words at about −16 (mix RMS over the words). `src/qa.py`: see
  the ship review.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Cross your fingers, touch one small thing (a pea, the tip of your nose) in the gap between the fingertips, and you feel two (Aristotle's illusion). Most people feel it; some feel it weakly or as one wide nose | established | Hayward V. (2008), "A brief taxonomy of tactile illusions and demonstrations that can be done in a hardware store", Brain Research Bulletin 75:742–752 ("try it on your nose"); Gustavus psychology blog, "A Hands-Down Simple Illusion: The Aristotle Illusion" (2020); Popular Science, "Three ancient optical illusions explained by modern science" |
| Why: the brain reads touch as if the fingers were uncrossed. The two OUTSIDE edges of two neighbouring fingers (the index's thumb side, the middle's ring side) are normally touched at the same moment only by two separate things, so it reports two | established (the leading explanation, tested) | Benedetti F. (1985), "Processing of tactile spatial information with crossed fingers", J Exp Psychol Hum Percept Perform 11:517–525: "tactile stimuli are always perceived as if fingers were uncrossed"; Hayward 2008 |
| Aristotle described it, about 350 BC: "when the fingers are crossed, the one object [placed between them] is felt as two" | established | Aristotle, On Dreams (De Insomniis) 460b20, trans. J. I. Beare (MIT Internet Classics Archive); also Metaphysics IV. Shown as a label (~350 BC), not spoken |
| Six volunteers kept their 2nd and 3rd fingers crossed for up to six months; after a variable time their spatial perception with crossed fingers became correct | established, one small study (6 people) | Benedetti F. (1991), "Perceptual learning following a long-lasting tactile reversal", J Exp Psychol Hum Percept Perform 17:267–277. Spoken as "up to SIX MONTHS... until their brains caught on"; the picture's ONE NOSE at the end of that shot is the illusion going away, which is what correct spatial perception with crossed fingers means |

## Ship review

Two rounds; `src/qa.py` 18/18 both times (34.17 s, −14.02 LUFS, −1.22 dBTP, voice 20.4 dB clear of the mix, WER 2.7 %:
whisper writes "two" as "too"/"to").

| # | Item | Round 1 | Round 2 |
|---|---|---|---|
| 1 | Test, hook, answer | 8.5 | 8.5 |
| 2 | Retention | 7.5 | 8.5 |
| 3 | Story | 8.5 | 8.5 |
| 4 | Show, don't tell | 9 | 9 |
| 5 | Narration | 8 | 8 |
| 6 | Comedy | 8.5 | 8.5 |
| 7 | Look | 7.5 | 8 |
| 7b | Safe area | 8.5 | 9 |
| 8 | Sound | 8.5 | 8.5 |
| 9 | Science | 9 | 9 |
| 10 | Packaging | 9 | 9 |
| 11 | Loop | 8.5 | 8.5 |

What changed in round 2: the round inset of him rubbing stays on screen through the whole brain's-room shot (the
viewer's test in sight while the lesson runs); smaller nostrils and a grin for "Keep your fingers crossed" (his nose
and a flat mouth read as a snout); the "caught on" window 1.8 times larger, the camera in on his forehead, the bulb
beside the brain; a softer flash on the marbles; the thought bubble shows his own face with two noses; an opaque disc
under every window, because drawing inside a clip is not in the light's shape map and his head's shading showed through.
Before the first render: the INDEX/MIDDLE badges moved up beside his face (they sat on the captions), the fingers'
knuckles spread so the X shows mid-finger, each finger outlined and a shade apart, the ghost nose drawn as a see-through
copy of his nose. `src/build.sh` from the cached takes reproduced timeline.json, mix.wav and the MP4 byte for byte.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
