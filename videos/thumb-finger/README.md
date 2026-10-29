# Does Your Finger Move When You Bend Your THUMB? 👍 — Short (33.6 s)

**Final file:** [`thumb-finger-short.mp4`](thumb-finger-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 33.6 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`thumb-finger.srt`](thumb-finger.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in a brick-red T-shirt, at night in his living room seen from the TV (wrist-tendon's and vulcan-salute's room),
holds his left hand up, palm to us, and folds his thumb across his palm: his pointer finger's tip curls along with it. It
grows a little face (the clingy sidekick), his hand turns to glass (two strings and the strap that ties them), and a
gorilla who was standing behind him all along shows its own hand: one string that forks. The same rig, narrator (Jessica),
word-pop captions and bloom look as the other Shorts; the TEST kind of the topic test, the pill arm of the pill test.
Cinematic lighting (`publish.json` "look": "cine"): the TV in front of him is the key, cool and flickering, the floor lamp
far left behind him the warm rim; the gorilla is drawn on his layer behind him (`pre`), lit as a character
(`setLights` in `src/web/scenes.js`).

## The plan (rules of 15 Oct 2026; written before the build)

0. **Why this topic now:** the first `[ ]` line of the Queue (`yt.mjs next-slot`: TEST, the 3 Nov 23:30 slot); the lemon
   Short's caption and "Next up" comment already tease it. No hit to follow: the newest Shorts with numbers (sharks
   12.6K, Jupiter 11.2K) are under five times the middle Short (8,420).
1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: "short"). 74 words → 33.6 s.
2. **The test:** bend only your thumb all the way across your palm (the phone in the other hand); in some hands the
   pointer finger's tip bends too. Safe, two seconds, no force (it is the doctors' own test without the doctor holding the
   fingers down).
   - **Hook (formula: The Direct Address, as the test, then the title's question to the viewer; `reference/hooks.md`):**
     "Bend just your thumb all the way across your palm." / "Did your pointer finger move?" The first sentence is the
     title's thumb, bending; "your" is word 3. The last three Shorts used The Impossible Claim (glass-rain, saturn-bathtub)
     and The Direct Address (lemon), so no formula runs a fourth time.
   - Other candidates: The Question ("Does your finger move when you bend your thumb? Try it: palm up, thumb across."):
     the title word for word, but the instruction comes after the question (one-finger's lesson: instruction first);
     The Statistic ("One in five of you can't bend this thumb alone."): the counts run from 9 % to over 50 % by study and
     ancestry, so the number would be shaky.
   - **Answer (starts at 4.86 s):** "Moved? Your thumb's got a clingy little SIDEKICK." (a metaphor a ten-year-old gets;
     it leaves "wait, how?")
   - **Button (runs into the hook when the Short loops; sends the viewer back to the test a new way):** "Now try your
     OTHER hand. It might be less ape." → "Bend just your thumb all the way across your palm."
3. **Claims:** the science notes below.
4. **Beats** (≈ 2.2 words/s): hook 0–4.5 · answer 4.9–8.4 · strings 8.8–11.3 · strap 11.6–13.6 · pull 13.8–16.4 · solo
   16.7–19.0 · gorillas 19.4–23.4 · leftover ape 23.8–28.0 · button 28.5–32.6 · the loop 33.2–33.6.
   What the viewer's hand is doing (the 8–13 s rule): at 5 s their thumb is still across the palm, eyes on the pointer
   ("Moved?"); at 8 s they bend it again ("Bend it again..."); at 10 s they watch their own pointer while the strings show
   on his glass hand ("see those strings?"); at 12.5 s the thumb is still bent while the strap appears on the wrist ("A
   tiny strap"); at 13.8 s they pull again ("Thumb pulls... pointer follows."). No science word is spoken: thumb,
   pointer, strings, strap, sidekick, solo, branch, ape.
5. **Picture / sound / caption per beat:** the shot table and the sound design below.
6. **The pill arm (23:30 slot):** the silent pill over the last 2.4 s (timeline_lib.py); the button shot is a two-shot
   with his face at y ≈ 880 and both hands above y 1000, the captions lifted to y 1150 under the pill. Nobody says
   "subscribe".
7. **The loop:** the last 0.4 s are the hook at negative time (`SC.loop`): his left hand up, the thumb starting to fold,
   under the hook's camera (the button hands its camera over in its last 0.8 s while the other hand goes down).
8. **World files:** `wtroom.js` (wrist-tendon's living room and his raised forearms, a brick-red T-shirt, a `pre` step
   for what stands behind him); new `tfhand.js` (wrist-tendon's hand, extended: the thumb that folds across the palm in
   three bones, the pointer in three bones whose tip curls and foreshortens, the sidekick's face on the pointer's tip
   with moods, the glass with two muscles, the thumb's string (orange) and the pointer's (cyan) with beads that slide
   when pulled, the strap (a little yellow belt with a buckle; a dashed ghost when there is none) and the gorilla's ONE
   string that forks); new `gorilla.js` (a cartoon western lowland gorilla from the front: crest, brow ridge, leathery
   face and nostrils, a grin, a huff, a chest drum, a raised hand through `wtHand` in a dark palette).
9. **Cover:** a frame of its own (`SC.cover`): his hand with the thumb folded across and the pointer curled in a ring,
   his wide eyes, "DID IT / MOVE?".
10. **The caption's question:** "Did your finger move? Yes or no?"

## Narration (74 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Bend just your thumb all the way across your palm. · Did your pointer finger move? · Moved? Your thumb's got a clingy
> little SIDEKICK. · Bend it again... see those strings? · A tiny strap ties them together. · Thumb pulls... pointer
> follows. · No strap? Your thumb goes solo. · Gorillas? Their thumb's string is just a branch of the pointer's. ·
> *[mischievously]* So that strap? Maybe a little leftover... ape. · Now try your OTHER hand. It might be less ape.

Takes: one take per block (430 characters); the first layout ran 34.8 s with the answer at 5.17 s, so the gaps, `tighten`
and `tempo` (all free) brought it to 33.6 s and the answer to 4.86 s. The `ape` line was re-taken once (62 characters):
"APE." in capitals was spelled out letter by letter ("A-P-E"); the lowercase "ape." is said as a word.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (after upload) | 3 Nov 2026 23:30 IST |
| Instagram Reels | Business Suite, Instagram only | (after scheduling) |
| Facebook Page (CurioPulse) | `fb.mjs reel` | (after scheduling) |

**Title:** Does Your Finger Move When You Bend Your THUMB? 👍

**Description:** in `publish.json` (it ends its story part on "Did your finger move? Yes or no?", then the subscribe line
and the hashtags).

**Hashtags:** #Shorts #Science #HumanBody #Thumb #FunFacts
**Tags:** thumb test, finger moves when i bend my thumb, bend your thumb, linburg comstock, thumb and index finger, tendon test,
hand test, try this, body test, human body, body facts, gorilla, science shorts, mind blowing facts, curiopulse
**Reels caption:** "Bend just your thumb all the way across your palm. 👍" / "Did your pointer finger move too? A tiny strap can tie
their two strings together: thumb pulls, pointer follows. In gorillas they're one string." / "Did your finger move? Yes or
no?" / Follow @curio_pulse_tv for the next one: why you can't make a fist with your wrist bent ✊
**"Next up" comment (posted by the pipeline once the Short is public):** 👍 Bonus: doctors call it the Linburg–Comstock
variation... / Next up: why you can't make a fist with your wrist bent ✊ Subscribe so you don't miss it! / Did your finger
move? Yes or no? 👍
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: the 3 Nov 2026 23:30 IST slot; pill arm; TEST kind.
**The viewer's test (rules of 15 Oct 2026):** bend only the thumb all the way across the palm; in some hands the pointer
finger's tip bends with it (in most it doesn't, which is the other answer).
**Answer line (spoken, starts by 5 s):** "Moved? Your thumb's got a clingy little SIDEKICK." at 4.86 s.
**The loop:** "...It might be less ape." runs into "Bend just your thumb..."; the silent pill (pill arm), nobody says
"subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` ("DID IT / MOVE?").

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.8 | `hook` | Tight on his raised left hand (palm to us, about 470 px) with his face at the left: frame 1 the thumb is already folding across the palm and the pointer's tip curls with it (motion marks); he lets go and does it again with the viewer on "...all the way across your palm."; "Did your pointer finger move?": the camera pushes in, a cyan ring round the pointer's tip |
| 4.8–8.8 | `sidekick` | Closer on the pointer: after "Moved?" it opens two eyes and a grin (the sidekick); he lets the thumb go and folds it again, and the pointer comes along: a bubble ME TOO!; a heart after "SIDEKICK." |
| 8.8–13.8 | `glass` | "Bend it again...": the camera pulls back to his forearm, which turns to glass from the wrist: the thumb's muscle and its orange string, the pointer's muscle and its cyan string (THUMB, POINTER tags); "A tiny strap": the camera dives to the wrist, a little yellow belt buckles round both strings (STRAP) |
| 13.8–16.6 | `pull` | The thumb's muscle squeezes, its string slides (beads), the strap tilts, then the pointer's string gives and the pointer curls (marks); the sidekick's "whee" |
| 16.6–19.3 | `solo` | "No strap?": the strap is a dashed ghost (NO STRAP), the thumb folds alone under a spotlight (SOLO!), the pointer stays up and its face goes sad |
| 19.3–23.8 | `gorilla` | A gorilla was standing behind him: its hand comes up (GORILLA), its glass shows ONE cyan string; on "branch" an orange branch grows out of it to the thumb; after "pointer's." it folds its thumb and the pointer folds too, and grins |
| 23.8–28.5 | `ape` | His glass wrist again, the strap glowing in a ring; the camera pulls back to the two of them; "leftover...": he folds his thumb, the sidekick goes "whee"; after "ape." the gorilla drums its chest (THUMP!) |
| 28.5–33.2 | `button` | He puts up his OTHER hand: its thumb folds alone, the pointer stays straight (a green ring): less ape; his grin, the gorilla's huff; the silent pill pops in, clicks and goes; the other hand goes down and the camera goes back to the hook's |
| 33.2–33.6 | `loop` | The hook at negative time: his left hand, the thumb starting to fold, into frame 1 |

## Sound design

- **Beds:** wrist-tendon's room tone (under 230 Hz) and the TV's hiss (above 6 kHz) all through.
- **Hits:** a rubbery creak as the thumb folds (low, under the words), a tick as the pointer curls (above 5 kHz), the ring's
  glint, the sidekick's eyes popping open (two bloops after "Moved?"), the ME TOO! pop (high), a little three-note
  chime for the heart; a glass shimmer, the two strings plucked after "strings?", the strap's buckle (edges of a lock snap
  and a zip above 5.2 kHz), the rope creak of the pull, a BOING in the pause after "pulls...", the sidekick's tiny "whee",
  a poof (above 5 kHz) for the strap that isn't there, a spotlight's clunk and a fuzzy three-note rock riff after "solo.";
  the gorilla's low grunt on the cut (under 300 Hz), a shimmer as its string forks, boop-boop as both fingers fold,
  hoo-hoo, the chest drum after "ape." (four hollow low thumps); the other hand's glint, the gorilla's huff (low), a
  sparkle on his grin, and the creak again into the loop.
- **Score:** a pizzicato/marimba groove (112 BPM, C–Am) for the hook, a lighter one under the answer, a mystery groove
  (104 BPM, Am–F–C–G) for the strings and strap, a drone under the pull, a sad Dm–Am for the solo, a drum-led groove for
  the gorilla, a little Am–Dm under "leftover", and the hook's groove for the button and the loop. It drops out for every
  punchline: "Moved?", "SIDEKICK.", "pointer follows.", "solo.", "pointer's.", "ape." and "It might be less ape."
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| In some people the pointer finger's tip bends when only the thumb bends (they can't bend the thumb's tip joint without the pointer's tip joint) | established (the clinical sign) | Linburg & Comstock, "Anomalous tendon slips from the flexor pollicis longus to the flexor digitorum profundus", J Hand Surg Am 1979;4(1):79–83; [Linburg–Comstock variation (Wikipedia, with references)](https://en.wikipedia.org/wiki/Linburg%E2%80%93Comstock_variation); the French epidemiological study (PubMed 10904829) |
| The muscles that bend the thumb and the fingers sit in the forearm and pull long tendons ("strings") | established anatomy | flexor pollicis longus, flexor digitorum profundus (any anatomy text) |
| "A tiny strap ties them together": a tendinous slip (sometimes a thickened sheath) links the thumb's long flexor tendon to the pointer's deep flexor tendon near the wrist | established that it exists in some people; its form varies (a true tendon slip, a muscle slip, or a thickened synovial sheath) | Linburg & Comstock 1979; Karalezli et al., "Linburg–Comstock anomaly in musicians", J Plast Reconstr Aesthet Surg 2006 (MRI showed the connection in every positive test); Yurasakpong et al., Surg Radiol Anat 2018 (130 limbs: a link in 25 %, mostly a thickened sheath, a true slip in 1 %) |
| How common: not said in the narration; the description says "roughly 1 in 5 hands (the counts vary a lot)" | debated numbers | Yammine & Erić, "Linburg–Comstock variation and syndrome. A meta-analysis", Surg Radiol Anat 2018 (14 studies, 4,132 hands; about 21 % pooled; 8.8 % in African ancestry to 34.5 % in Hispanic); other studies 37 % to over 50 % |
| It can be in just one hand ("It might be less ape.", hedged with "might") | supported, with mixed data | the original study: one hand in 31 % of 194 patients, both in 14 %; other studies found it mostly in both hands |
| In gorillas the thumb's long flexor is only a thin branch of the pointer finger's deep flexor ("just a branch of the pointer's") | established for the specimens dissected (small samples) | Saito et al., Bulletin of the National Museum of Nature and Science, Ser. A, 47(3) (a western gorilla's forelimb: an underdeveloped flexor pollicis longus branching off the index finger's flexor digitorum profundus); [Bergman's Encyclopedia of Human Anatomic Variation, flexor pollicis longus](https://anatomyatlases.org/AnatomicVariants/MuscularSystem/Text/F/22Flexor.shtml) ("uniquely human"; "in other primates there is only one common deep flexor that provides a tendon to the thumb"; fused with the index tendon "as in the gorilla and chimpanzee") |
| The strap may be a leftover of that shared flexor ("Maybe a little leftover... ape.") | hypothesis (hedged: "maybe") | Wikipedia's Linburg–Comstock article (development: "a persistent evolutionary structure"; the two muscles come from one mass in the embryo) |
| The bonus in the comment: mostly harmless; it can ache in some musicians; surgeons can free the tendons | established (case series) | Karalezli et al. 2006; Badhe et al., "Operative treatment of Linburg–Comstock syndrome", J Bone Joint Surg Br 2010 |

## Ship review

Three rounds (`.work/qa/ship-review.md`, summarised); the final MP4 is build.sh's into a fresh work folder (timeline.json and
mix.wav byte-identical with the work folder's). qa.py 18/18: 33.60 s, −14.01 LUFS, −1.88 dBTP, voice mean 24.2 dB (min 8.9),
WER 5.4 % (whisper splits "sidekick" and "leftover" and drops "ape" at its piece boundary), answer at 4.86 s, the pill at
2.40 / 1.70 / 0.87 s before the end.

| # | Item | Score |
|---|---|---|
| 1 | The test, the hook, the answer | 8 |
| 2 | Retention | 8 |
| 3 | Story | 9 |
| 4 | Show, don't tell | 9 |
| 5 | Narration | 8 |
| 6 | Comedy | 8 |
| 7 | Look | 8 |
| 7b | Safe area | 8 |
| 8 | Sound | 8 |
| 9 | Science | 9 |
| 10 | Packaging | 8 |
| 11 | The loop | 9 |

Changes: round 1 → 2: "see those strings?" retimed onto its own bursts (v3 had put "see" in the silence before it: qa.py read
−13 dB); two possessive pairs in qa.py's SPELL ("thumb's", "pointer's"; also in the skill's template); closer cameras on the
strings, the pull, the solo and the two-shot; the chest drum 4.5 dB down and the effects bus 5 dB down (every gag −16…−20 dB
in its gap); a whoosh that sat on "Now" removed. Round 2 → 3: the gorilla shot's camera lower (its fingertips touched the top
band), the hook's camera lower (and the loop's), the button's camera hand-over 0.1 s earlier (the last caption crossed his face).

## Rebuild

`src/build.sh` rebuilds everything from the cached voice takes in `src/voice/` (voice → timeline → audio → render → srt);
`src/cover.sh` renders the cover.
