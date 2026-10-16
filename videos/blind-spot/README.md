# Why Does This Dot VANISH? (Find Your Blind Spot) 👁️ — Short (31 s)

**Final file:** [`blind-spot-short.mp4`](blind-spot-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 31.2 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`blind-spot.srt`](blind-spot.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in blue pyjamas, sitting up in bed at midnight, seen from his own phone: we ARE the phone, and the X and the
red dot sit on the glass for the viewer's own test. Then inside his eye cut in half (eye-rub-stars' sensors, rewired),
the brain's room with a paint brush (eye-rub-stars' brain), and under the sea with a new octopus character.
Cinematic lighting (`publish.json` "look": "cine"): the phone's cool light from the front and the bedside lamp low on
the left as the rim in the bedroom, `LIGHTS.inside` in the eye, `LIGHTS.screen` in the brain's room, `LIGHTS.water`
under the sea (`setLights` in `src/web/scenes.js`).

## The plan (written before any code; rules of 15 Oct 2026)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: 17 Oct 2026 11:30 IST, "short"). Script: 73 words.
2. **The viewer's test:** on the screen itself. Close your left eye, stare at the X with your right eye, bring the
   phone closer: at about 15–22 cm the red dot vanishes (the X and the dot are 720 px apart, about 5 cm on a phone,
   so the dot lands 12–18° out, where the blind spot is; it sits 40 px lower than the X because the blind spot is a
   little below the line of sight). They stay on the screen for the first 9 s and come back with the loop.
   - **Hook** (The Direct Address, as the test itself): "Close your left eye, stare at the X, and bring your phone
     closer." Three candidates: The Direct Address (kept); The Impossible Claim first ("Your eye has a hole in it.
     Close your left eye and stare at the X." — fails: the instruction then pushes the answer past 5 s, and the
     claim comes before any proof); The Question ("Can you make a dot disappear?" — weaker, and it asks before it
     shows). The Impossible Claim became the answer line.
   - **Answer** (starts at 4.91 s): "The dot vanished? Your eye has a HOLE in it."
   - **Button** (runs into the hook when the Short loops): "Show-off." → "Close your left eye..."
3. **Claims table:** see "Science notes".
4. **Beats:** hook (test) 0–4.6 · answer 4.9–9.5 · mechanism: the cable plugs in where no sensor can stand 9.9–13.8 ·
   payoff: the dot's light lands on nobody 14.2–17.1 · the brain paints over it 17.7–22.1 · the weirdest fact: the
   octopus is wired from behind 22.9–27.9 · button 29.2. No science word spoken in the first 15 s ("cable", "light
   sensors"); the name "blind spot" is an on-screen label only.
5. **Picture / sound / caption emphasis:** see the shot table and the sound design.
6. **No Subscribe pill:** the button shot ends clean; nobody says "subscribe".
7. **The loop:** the last 0.4 s is the hook at negative time: his palm comes up from the duvet and lands on his eye on
   frame 1, and the X and the dot pop back onto the glass.
8. **World files:** new `bed.js` (bedroom, the hero in bed with a palm over his eye, the test card, the window on his
   eye), `eyecut.js` (eye-rub-stars' `eyeball.js` rewired: sensors along the wall, their wires bundled into a plug, the
   hole, beams of light; `behind: true` for the octopus), `brainpaint.js` (the brain from eye-rub-stars / time-flies,
   a WHAT YOU SEE screen showing the viewer's own test with a hole, a brush), `octo.js` (the sea, the octopus, its phone).
9. **Cover:** `SC.cover`, the hook frame (palm on his eye, X and dot) with FIND YOUR / BLIND SPOT.
10. **Caption question:** "Did it vanish?"

## Narration (73 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Close your left eye, stare at the X, and bring your phone closer.
> *[mischievously]* The dot vanished? Your eye has a HOLE in it.
> That's where the cable to your brain plugs in... no room for light sensors.
> So the dot landed... on nobody.
> And you didn't see a hole there... because your brain paints over it with whatever's around it.
> An octopus? Its eye is wired from behind... no hole at all.
> *[sarcastic]* Show-off.

Takes: the hook was re-voiced once without "slowly" (the answer started at 5.38 s); the octopus line was auditioned on
two seeds without its `[curious]` tag (the tagged take sat 4 dB low with "from" at −43 dB in the speech band; seed 11
kept); the button on four seeds (whisper heard "Love." on the first take; seed 37, `[sarcastic]`, kept).

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (after upload) | 17 Oct 2026 11:30 IST |
| Instagram Reels | (after queueing) | Instagram API (route B) |

**Title:** Why Does This Dot VANISH? (Find Your Blind Spot) 👁️

**Description:** in `publish.json` (the test, the cable, the brain painting over it, the octopus; "Did it vanish?";
the subscribe line; Next up: why you can feel TWO noses).

**Hashtags:** #Shorts #Science #BlindSpot #Eyes #HumanBody #FunFacts
**Tags:** blind spot, blind spot test, find your blind spot, why does the dot disappear, optic nerve, optic disc, eye
test, vision, how your eyes work, brain fills in, octopus eye, eyes, human body, science shorts, fun facts, curiopulse
**Reels caption:** "Close your left eye, stare at the X... and bring your phone closer. 👁️ The red dot VANISHES." … "Did
it vanish?" … "Follow @curio_pulse_tv for the next one: why you can feel TWO noses 🔔"
**"Next up" comment (posted by the pipeline once the Short is public):** Next up: why you can feel TWO noses 👃 Subscribe
so you don't miss it! / Did it vanish? 👁️
**Playlist:** Your Brain Is Weird
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: 31.2 s
**The viewer's test (rules of 15 Oct 2026):** close the left eye, stare at the X, bring the phone closer: the red dot
on the right vanishes, and the wall shows where it was.
**Answer line (spoken, starts by 5 s):** "The dot vanished? Your eye has a HOLE in it." at 4.91 s
**The loop:** "Show-off." → the palm lands on his eye on frame 1 → "Close your left eye..."; no pill, nobody says
"subscribe"
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (the hook's picture with FIND YOUR / BLIND SPOT).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–9.8 | Hook | His bedroom at midnight from his phone: tight on him, his palm already flat over his left eye, his right eye on the X; the X and the red dot on the glass for the viewer's test. The camera pushes in as he "brings his phone closer"; "The dot vanished?" jolts him back, wide-eyed; on "Your eye" a round window opens on his open eye with the eye cut in half inside it; the hole lights up on "HOLE"; the X and the dot pop off and the camera dives into the window. |
| 9.8–17.6 | Inside | The eye cut in half: a back wall lined with small light sensors with faces, each wire running over the inside of the wall into one plug; on "cable" the cable to the brain hums with signals (TO YOUR BRAIN), on "plugs in..." the plug goes home with a clunk; a sensor tries to squeeze in beside it (NO ROOM!; LIGHT SENSORS). Then the X's light lands on the sensor straight back (X!), and the dot's light lands on the plug: a red dot on nobody (YOUR BLIND SPOT); the neighbours turn and stare (? ?), a cricket. |
| 17.6–22.9 | Paint | The brain's room: a WHAT YOU SEE screen shows the viewer's own test, the X and a black hole where the dot was; the brain lifts a paint brush, dabs the wall beside the hole and paints it over in strokes, dips again on "whatever's around it", finishes, a sparkle. |
| 22.9–28.3 | Octopus | Under the sea: an octopus doing the same test, a tentacle over one eye, a phone in another; then two eyes cut in half, one above the other: YOU (wires in front, HOLE) and OCTOPUS (wires drawing on round the BACK of the wall: WIRED FROM BEHIND, a sensor standing where our hole is, a green tick); the octopus watches from the corner, smug. |
| 28.3–30.8 | Button | The octopus comes back, sunglasses slide down, the phone still shows its dot; "Show-off." with a glint and a flourish. |
| 30.8–31.2 | Loop | The hook at negative time: his palm rises from the duvet onto his eye; the X and the dot pop back: frame 1. |

## Sound design

- **Beds:** a low bedroom room tone with crickets outside the window; a low hum inside the eye; the brain's room; an
  underwater rumble.
- **Hits:** frame 0 a soft low pat (his palm lands); a filtered riser above 5 kHz while the phone comes closer; a low
  jolt under "The dot"; "pff" (a falling whistle) and three glints in the pause after "vanished?"; glass tinks as the
  window opens; a low dun under "HOLE"; the dive whoosh in the gap after "in it."; the cable's high buzz under its
  line; click + CLUNK in the pause after "plugs in..."; two tiny swishes as a sensor tries to squeeze in; a glint
  ripple down the wall on "light sensors"; a glint as the X lands; "plip" as the dot lands (in the pause after
  "landed..."); a cricket after "nobody."; brush swishes above 5 kHz under the paint line and a sparkle when it is
  done; a splash into the sea and a bloop as the octopus pops in; a zipping ratchet (above 5 kHz) as the wires draw
  on; ding-ding for the tick after "all."; a sparkle as the shades slide down; ba-dum tss after "Show-off."; a whoosh
  as his palm rises into frame 1.
- **Score:** a quiet pizzicato groove under the test (out for "The dot vanished?"), a low drone under "Your eye has a
  HOLE in it.", a fuller minor groove for the mechanism (out for the landing, "on nobody" and the cricket), a playful
  groove for the painting (out for the sparkle), an underwater groove for the octopus (out for the tick), a thin
  vamp into "Show-off." and silence for the button and the loop.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. Gags measured in `mix.wav` at −18.6…−23.7 dB in their windows (voice median −21.3 dB in 50 ms windows).

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| With one eye shut, a dot about 15° to the side of where you look vanishes at the right distance: its image falls on the blind spot | established | Wikipedia, "Blind spot (vision)" (citing Wandell, *Foundations of Vision*, 1995); the standard card test (Sanford Health "Finding your blind spot"; Ingenium Canada "Blind spot") |
| The blind spot sits about 12–15° to the temporal side of fixation and 1.5° below the horizontal; about 7.5° high and 5.5° wide | established | Wikipedia, "Blind spot (vision)" (Wandell 1995; MIL-STD-1472F) |
| It is where the optic nerve leaves the eye (the optic disc), and there are no light-sensing cells there | established | Wikipedia; UC Berkeley "Understanding Evolution": How your eye works |
| In our eyes the nerve fibres run over the front of the retina and gather at one spot to leave the eye ("the cable plugs in": a metaphor for the fibres exiting) | established | UC Berkeley "Understanding Evolution": How your eye works |
| You don't see a hole because the brain fills the gap in with the surrounding colour and pattern (the other eye also covers it when both are open) | established | D. Rogers-Ramachandran & V. S. Ramachandran, "Mind the Gap", *Scientific American*, May 2008; Wikipedia, "Filling-in" |
| Octopus and squid eyes are wired the other way round: the photoreceptors face the light and the nerve fibres leave from behind, so there is no blind spot | established | UC Berkeley "Understanding Evolution": How your eye works; PBS Evolution; Wikipedia, "Blind spot (vision)" |
| Not used: Mariotte's discovery (around 1660–1668, shown at the court of Louis XIV); the "headless courtiers" story could not be confirmed | – | Wikipedia, "Edme Mariotte"; Encyclopedia.com |

Test geometry (`src/web/bed.js`, `CARD`): the X at (185, 600), the dot at (905, 640), radius 50 px. A phone that shows
the 1080 px frame 6.4–7.6 cm wide puts them 4.7–5.6 cm apart (Instagram, full width: 4.3–5.1 cm), so the dot lands
on the blind spot (12.5–18°) at about 13–23 cm from the eye; the dot is about 2.2° across there, well inside the
5.5° × 7.5° spot. Not checked on a real phone by this unattended run.

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

Two rounds. qa.py 18/18 both times: 31.20 s (short arm), −14.02 LUFS, −1.91 dBTP after AAC, voice 24.2 dB over the mix
in the speech band (0 % of content words under 6 dB), whisper WER 0.0 %, the answer at 4.91 s, no "subscribe", no pill.

| Item | Round 1 | Round 2 |
|---|---|---|
| 1 The test, the hook, the answer | 8 | 8 |
| 2 Retention | 7 | 8 |
| 3 Story | 9 | 9 |
| 4 Show, don't tell | 8 | 9 |
| 5 Narration | 9 | 9 |
| 6 Comedy | 8 | 8 |
| 7 Look | 8 | 9 |
| 7b Safe area | 8 | 9 |
| 8 Sound | 9 | 9 |
| 9 Science | 9 | 9 |
| 10 Packaging | 9 | 9 |
| 11 The loop | 9 | 9 |

Round 2 changes: the held gasp on "The dot vanished?" became a double-take (his eye darts to where the dot was, back
to the X, again); the window on his eye is bigger so the hole reads; TO YOUR BRAIN leaves before NO ROOM! arrives and
three tags keep left of the button column; a gentler flash on the clunk; a slow push on the two cut-away eyes. The
round-2 MP4 was made by `src/build.sh` from the cached takes: timeline.json and mix.wav came out byte-identical.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
