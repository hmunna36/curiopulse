# Why Can't You Make a FIST With Your Wrist Bent? ✊ — Short (31.4 s)

**Final file:** [`bent-wrist-fist-short.mp4`](bent-wrist-fist-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 31.4 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`bent-wrist-fist.srt`](bent-wrist-fist.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker by his campfire at night (mosquito-bites' campsite, sleeves pushed up) holds his left forearm across his chest and
lets the hand droop at the wrist: he squeezes with everything he has and the fist stays a claw. His forearm turns to glass:
inside, the finger-closing muscle is a little puppeteer holding a marionette's control bar, and the strings run over the
wrist to the fingertips; bent down, they go slack and he hauls them in until he runs out of pull; tipped back, they snap
tight and the fist clamps shut; asleep in a nightcap, he still closes the hand round a marshmallow stick when the wrist
tips back. The same rig, narrator (Jessica), word-pop captions and bloom look as the other Shorts; the TEST kind of the
topic test, the no-pill arm of the pill test.
Cinematic lighting (`publish.json` "look": "cine"): the campsite under warm lanterns, the key from the upper left, the fire
below and to the right as the rim and a warm wash on him (`setLights` in `src/web/scenes.js`). His left forearm and hand are
one-finger's 3D hand (`fist3d.js`) with a wrist that bends, an oval forearm, strings, the puppeteer and glass (`bwhand.js`).

## The plan (rules of 15 Oct 2026; written before the build)

0. **Why this topic now:** the first `[ ]` line of the Queue (`yt.mjs next-slot`: TEST, the 4 Nov 11:30 slot, no pill);
   thumb-finger's caption and "Next up" already tease it. No hit to follow: the newest Shorts with numbers (sharks 13.4K,
   Jupiter 11.5K) are under five times the middle Short.
1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: "short"). 71 words → 31.4 s.
2. **The test:** bend your wrist all the way down (gently) and squeeze a tight fist: it won't close tight; tip the wrist
   back and it clamps shut. Safe, a few seconds, one hand, the phone in the other.
   - **Hook (formula: The Direct Address, as the test; `reference/hooks.md`):** "Bend your wrist all the way down." /
     "Now squeeze a tight fist." The first sentence is the title's bent wrist, the second its fist; "your" is word 2.
     The last three Shorts used The Direct Address (thumb-finger), The Impossible Claim (glass-rain, saturn-bathtub): no
     formula runs a fourth time.
   - Other candidates: The Question ("Can you make a fist with your wrist bent? Try it."): the title word for word, but
     the instruction comes after the question; The Impossible Claim ("Your fingers have no muscles. Bend your wrist and
     squeeze."): a stronger claim, but it is not what the title asks, so it became the answer.
   - **Answer (starts at 4.75 s):** "Can't? Your fingers have no muscles. They're... puppets." (a true, surprising claim
     and a metaphor a ten-year-old gets; it leaves "then what moves them?")
   - **Button (runs into the hook when the Short loops; sends the viewer back to the test):** "Now bend it down again...
     and watch the puppet flop." → "Bend your wrist all the way down."
3. **Claims:** the science notes below.
4. **Beats** (≈ 2.3 words/s): hook 0–4.2 · answer 4.75–8.9 · the puppeteer 9.4–12.9 · slack 13.4–16.8 · clamp
   17.3–20.3 · the paralyzed hand 20.9–25.8 · button 26.4–30.2 · the stick hits the fire 30.5 · the loop 31.0–31.4.
   What the viewer's hand is doing (the 8–13 s rule): at 5 s it is still bent and squeezing ("Can't?"); at 9.4 s they
   squeeze again ("Squeeze again."); at 10.6–11.8 s they watch their own forearm move while his turns to glass ("See your
   forearm move?"); at 12–13 s the wrist is still down while the puppeteer waves; at 13.4 s it goes all the way down
   ("Wrist down?"); at 17.3 s they tip it back and squeeze (a new version of the test). No science word is spoken: wrist,
   fist, muscles, puppets, forearm, puppeteer, strings, slack, pull, clamp, paralyzed.
5. **Picture / sound / caption per beat:** the shot table and the sound design below.
6. **The no-pill arm (11:30 slot):** no pill; the button ends on his sheepish grin in the firelight and the cut back to
   frame 1. Nobody says "subscribe".
7. **The loop:** the last 0.4 s are the hook at negative time (`SC.loop`: `bwS(t)` is valid for t < 0): his wrist bending
   down, the fingers loose; the button's camera eases back to the hook's after the FWOOSH.
8. **World files:** `camp.js` (mosquito-bites' campsite: pines, a lit tent, bulbs, the fire; `CAMPPAL`), `fist3d.js`
   (one-finger's 3D hand), new `bwhand.js` (the wrist that bends, the forearm as an oval tube, the strings with slack waves,
   glow and beads, the strings tied to the fingertips, the puppeteer with moods, a wave, a nightcap, the control bar, the
   glass, the marshmallow stick).
9. **Cover:** a frame of its own (`SC.cover`): his drooping claw hand and his straining face, "MAKE A / FIST?".
10. **The caption's question:** "Could you make a fist? Yes or no?"

## Narration (71 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Bend your wrist all the way down. · Now squeeze a tight fist. · Can't? Your fingers have no muscles. They're...
> puppets. · Squeeze again. See your forearm move? That's the puppeteer. · Wrist down? His strings go slack. No pull
> left. · Now tip your wrist back and squeeze. Clamp! · People with paralyzed fingers grab things this way. The strings
> close the hand for them. · *[mischievously]* Now bend it down again... and watch the puppet flop.

Takes: one take per block, 419 characters, no retakes. The first layout ran 29.5 s; the gaps (free) brought it to 31.4 s
with the answer at 4.75 s.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (after the upload) | 4 Nov 2026 11:30 IST |
| Instagram Reels | Business Suite, Instagram only | (after scheduling) |
| Facebook Page (CurioPulse) | `fb.mjs reel` | (after scheduling) |

**Title:** Why Can't You Make a FIST With Your Wrist Bent? ✊

**Description:** in `publish.json` (it ends its story part on "Could you make a fist? Yes or no?", then the "Next up" teaser,
the subscribe line and the hashtags).

**Hashtags:** #Shorts #Science #HumanBody #Hand #FunFacts
**Tags:** can't make a fist, fist with wrist bent, bend your wrist, wrist test, hand test, grip strength, tendons, forearm muscles, fingers have no muscles, tenodesis, try this, body test, human body, body facts, science shorts, curiopulse
**Reels caption:** Bend your wrist all the way down. Now squeeze a tight fist. ✊ / Can't? Your fingers have no muscles: they're puppets. The puppeteer sits in your forearm and pulls strings over your wrist. Bend it down and the strings go slack. Tip it back and the fist clamps shut. / Could you make a fist? Yes or no? / Follow @curio_pulse_tv for the next one: why your toes won't move one at a time 🦶 / #science #humanbody #hand #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why your toes won't move one at a time 🦶 Subscribe so you don't miss it! / Could you make a fist? Yes or no? ✊
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: the 4 Nov 2026 11:30 IST slot; no-pill arm; TEST kind.
**The viewer's test (rules of 15 Oct 2026):** bend the wrist all the way down and squeeze: the fist won't close tight; tip it
back and it clamps shut.
**Answer line (spoken, starts by 5 s):** "Can't? Your fingers have no muscles. They're... puppets." at 4.75 s.
**The loop:** "...and watch the puppet flop." runs into "Bend your wrist all the way down."; no pill (the no-pill arm), nobody
says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` ("MAKE A / FIST?").

## Story and shots

One state over time (`bwS(t)` in `src/web/scenes.js`) draws every shot, so the hand never jumps at a cut; the shots split
the captions and the light.

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–9.3 | `hook` | Tight on his face (left) and his left forearm across his chest, the hand drooping at the wrist (right): frame 1 the wrist is already bending down; "Now squeeze a tight fist": he strains (gritted teeth, shaking marks) and the fist stays a claw; "Can't?": he gives up and glares at it; "no muscles": MUSCLES: 0; "puppets.": white strings appear, tied to his fingertips and running back into his wrist, and the fingers do a little marionette jig |
| 9.3–13.3 | `glass` | "Squeeze again": he squeezes; the camera slides down his forearm and tilts, the forearm bulges and turns to rosy glass: inside, a little muscle with a face holds a marionette's control bar and pulls; the strings run from it over the wrist to the fingertips (beads ride on them); "That's the puppeteer.": he grins and waves; the hiker beams |
| 13.3–17.3 | `slack` | "Wrist down?": the wrist bends all the way; the strings go wavy (SLACK); the puppeteer worries, then hauls the bar down hand over hand until it hits his chest: "No pull left.": he pants; the fist stays open (a dashed red ring round the gap) |
| 17.3–20.9 | `clamp` | "Now tip your wrist back": the hand swings back, the strings snap straight over the wrist and lift the puppeteer off his feet; "Clamp!": the fist slams shut, the strings glow (CLAMP!) |
| 20.9–26.4 | `grab` | The view turns toward the palm; the puppeteer falls asleep in a nightcap (zzz); the hand opens and a marshmallow stick lands in it; "The strings close the hand for them.": the wrist tips back and the fingers close round the stick by themselves (WRIST BACK = GRIP) |
| 26.4–31.0 | `button` | Back on his face and hand (no glass): "Now bend it down again...": the wrist bends, the grip loosens; "...and watch the puppet flop.": the fingers flop open, the stick slides out and drops; FWOOSH! from the fire below, sparks, his sheepish grin; the camera eases back to the hook's |
| 31.0–31.4 | `loop` | The hook at negative time: his wrist bending down, into frame 1 |

## Sound design

- **Beds:** the campfire's low rumble (under 200 Hz) and a soft night band (140–380 Hz), the fire's crackle above 5.4 kHz.
- **Hits:** a low rubbery creak whenever the wrist bends, the strain under "squeeze", a feeble toy squeak in the pause
  before "Can't?", a low thud and a glint for MUSCLES: 0, glints as the strings appear and a four-note pizzicato jig after
  "puppets."; a glass shimmer, the forearm's low boing, the puppeteer's tiny "hi!" after "puppeteer."; a sad slide after
  "slack.", the haul (a ratchet above 5.2 kHz, a rope creak below 250 Hz), the bar's thud, three tiny pants; the strings'
  low twang, a thud as the fist slams shut and the vise's clank after "Clamp!"; snores under 240 Hz while he sleeps, the
  stick's tok, the grip's creak and glints, a glint for the label; the whoosh of the cut back, a floppy low boing on
  "flop", a falling whistle after it and the FWOOSH (a fire burst and a crackle) in the tail.
- **Score:** a pizzicato/marimba groove (112 BPM, C–Am) for the hook, a lighter F–G under "no muscles", a mystery groove
  (104 BPM, Am–F–C–G) for the puppeteer, low drones under the slack and the haul, an airy riser (above 5.2 kHz) into the
  clamp, a gentle C–F–G–C (96 BPM) for the sleeping puppeteer, Am–F under the button and the hook's groove after the
  FWOOSH into the loop. It drops out for every punchline: "Can't?", "They're... puppets.", "That's the puppeteer.",
  "slack.", "No pull left.", "Clamp!", "for them." and "watch the puppet flop."
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| With the wrist bent all the way down you can't squeeze a tight, strong fist; tipped back, the grip is strong | established (a textbook example of "active insufficiency"; measured: finger flexion force is lowest with the wrist flexed) | Hazelton, Smidt, Flatt & Stephens, "The influence of wrist position on the force produced by the finger flexors", J Biomech 1975;8:301–306 (total finger flexion force: ulnar deviation > neutral > radial deviation > extension > flexion; via Li 2002, J Hand Surg); O'Driscoll et al., "The relationship between wrist position, grasp size, and grip strength", J Hand Surg Am 1992;17:169–177; kinesiology texts on active insufficiency of the extrinsic finger flexors |
| "Your fingers have no muscles": the fingers hold bones, tendons, ligaments, vessels and nerves; the muscles that move them sit in the forearm and the palm | established anatomy | any anatomy text (flexor digitorum superficialis and profundus in the forearm; lumbricals and interossei in the palm); [Science ABC](https://www.scienceabc.com/humans/hand-fingers-no-muscles-phalanges-bones-tendons.html) |
| The muscles that close the fingers are in the forearm and pull long tendons ("strings") that cross the wrist; you can see the forearm move when you squeeze | established | the long finger flexors' anatomy (any anatomy text) |
| "Wrist down? His strings go slack. No pull left.": with the wrist flexed, the flexors' path is shorter, so the muscle must shorten further to close the fist and runs short of force (active insufficiency); the stretched finger extensors on the back of the wrist also pull the fingers open | established (the simplification "slack strings" is the textbook's own picture) | kinesiology texts; Hazelton 1975; the tenodesis effect below |
| Tip the wrist back and the fingers curl even with no effort ("the strings close the hand") | established (the tenodesis effect) | [Tenodesis grasp (Wikipedia, with references)](https://en.wikipedia.org/wiki/Tenodesis_grasp); Johanson & Murray, "The unoperated hand: the role of passive forces in hand function after tetraplegia", Hand Clin 2002;18(3):391–398 |
| "People with paralyzed fingers grab things this way": people with tetraplegia at the C6 level (wrist extension working, finger muscles not) grasp by tipping the wrist back | established (taught in rehabilitation; the grip is weak) | Mateo et al., "Kinematic characteristics of tenodesis grasp in C6 quadriplegia", Spinal Cord 2013;51(2):144–149 (doi 10.1038/sc.2012.101); Harvey, "Principles of conservative management for a non-orthotic tenodesis grip in tetraplegics", J Hand Ther 1996;9:238–242 |
| The safety of the test: bending the wrist gently and squeezing is harmless; nobody is told to force it | — | "all the way down" is said with no force; the description says "gently" is implied by the picture (he just lets the hand droop) |

## Ship review

Three rounds (`.work/qa/ship-review.md`, summarised); the final MP4 is build.sh's into a fresh work folder (timeline.json and
mix.wav byte-identical with the work folder's). qa.py 18/18: 31.40 s, −14.02 LUFS, −1.89 dBTP, voice mean 22.8 dB (min 10.8),
WER 0.0 %, answer at 4.75 s, no pill (the no-pill arm). The gags in their gaps: squeak −22, jig −18, "hi!" −25, sad slide −24,
pant −24, clank −21, whistle −24, FWOOSH −19 dB (the narrator about −16).

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

Changes: round 1 → 2: "See" moved onto its vowel (v3 had aligned it to its "s", a hiss above 4 kHz: qa.py read −14.6 dB in
the speech band); the hook recomposed (zoom 3.0, the wrist and elbow closer to his face: his head and the open fingertips were
outside the key zone); the "puppets" strings now rise from the fingertips like a marionette's (drawn along the fingers they read
as glowing fingers); the puppeteer bigger and anchored (the bar comes down to his chest), the glass cameras closer; the stick
shorter. Round 2 → 3: the glass cameras left (the puppeteer sat at the zone's left edge); the cover closer.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
