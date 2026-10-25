# If You Fell Into JUPITER, You'd Never Hit the Ground 🪐 — Short (34 s)

**Final file:** [`jupiter-no-ground-short.mp4`](jupiter-no-ground-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 34.43 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`jupiter-no-ground.srt`](jupiter-no-ground.srt). Cover: [`cover.jpg`](cover.jpg).

**The third CURIOUS Short** (the topic test, 25 Oct–8 Nov 2026; `reference/story.md` §6). The hero goes there: he skydives
into Jupiter in a blue spacesuit and venus-day's glass helmet, a red scarf streaming up from his collar, filming a selfie on
a stick... and never lands. Same narrator, captions and bloom look. The look is cinematic (`publish.json` "look": "cine"): in
space the Sun is the key and Jupiter's lit clouds give a warm rim from below (`SPACE_LIGHT`); over the cloud tops, daylight
from high up (`TOPS_LIGHT`); between the decks a soft light from above that warms and dims as he sinks (`gasLight`); the soup,
syrup and ocean turn the rim from warm-above to red-below (the heat); deep down, the key flickers with the lightning far
above (`deepLight`).

**A world built for the topic** (`src/web/jupiter.js`, `jpprops.js`, `jphero.js`):
- **Jupiter, painted once, pixel by pixel** (`jpPaintDisc`, 2,400 px): eighteen belts and zones whose edges ripple with
  turbulence stretched east-west by the winds, blue-grey festoons on the edge of the equatorial zone, the Great Red Spot with
  its swirls and pale collar, a string of white ovals, the Sun's light from the right, a soft terminator, a gas giant's limb
  darkening and a thin bluish haze on the lit limb. Stars painted once; the Sun in the glow layer.
- **The fall INTO it, in perspective** (`jpDeckWorld`): a camera that falls with him through NASA's three cloud decks
  (ammonia ice on top, ammonium hydrosulfide, water ice), each a field of about 1,100 puffs on a jittered grid whose cell
  grows with distance (tops seen from above, flatter undersides from below), sprites pre-fogged at seven depths, a far
  cloud sea to the horizon, and zonal winds that slide each deck its own way. The decks are cut open at 5.4 units (the
  cake-slice view: a wall of puffs on the cut face), so the camera never goes into a cloud: we watch him sink through it.
  Above the top deck: high cirrus streaks, a small hard Sun and far storm towers (cumulonimbus with anvils) in the haze.
- **The hole he leaves:** his spread-eagle silhouette punched in each deck's underside, glowing with the light above, a
  soft shaft down onto him (the camera tilts up to it after each POOF).
- **The thickening** (`jpMedium`, `medBits`): the gas backdrop by stage (0 gas, 1 soup, 2 syrup, 3 a hot dark ocean,
  glowing from below with slow silvery ripples), and 260 things in 3D round him that rise past as he sinks: haze motes, then
  noodles, carrot coins, peas and pasta letters (J-U-P-I-T-E-R), then syrup bubbles, then embers.
- **Props:** NASA's probe (the Galileo descent module: a gold-foil drum under a striped parachute; `crush` crumples it),
  a brilliant-cut diamond with facets and a glint, a stack of pancakes, the gauge AIR / SOUP / SYRUP / OCEAN with a little
  helmet marker, comic bursts, pills, speed lines, lightning inside a deck.

## Narration (68 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> If you fell into Jupiter, you'd never hit the GROUND. / Jupiter has no floor. Just sky... and more sky. / The deeper you
> fall, the thicker that sky gets. / Like soup... then syrup... then a hot, dark ocean. Still no splash. / NASA actually
> dropped a probe in. / It lasted fifty-eight minutes... then got crushed. / Oh, and deeper down? Some scientists think it
> might rain... DIAMONDS. / Still want to jump?

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/lVK_uraLavc | 27 Oct 2026 23:30 IST (scheduled; the pill arm; playlist Strange Nature; thumbnail and captions set by the API; Studio's vertical thumbnail slot not checked: Studio's edit page said "Oops, something went wrong" for this video in Chrome) |
| Instagram Reels | @curio_pulse_tv | 30 Oct 2026 21:00 IST (scheduled in Business Suite, Instagram only, cover.jpg as the cover; Content → Scheduled lists it with the caption as its title) |
| Facebook Page | CurioPulse (video 1763128764800387) | 30 Oct 2026 21:00 IST (`fb.mjs reel`: scheduled for 15:30 UTC; the caption's Follow line reads "Follow CurioPulse") |

**Title:** If You Fell Into JUPITER, You'd Never Hit the Ground 🪐

**Description:** see `publish.json` (the story, the 1995 probe, the diamond rain as an idea, "Would you jump? Yes or no?", the
subscribe line, hashtags).

**Hashtags:** #Shorts #Science #Jupiter #Space #SolarSystem #FunFacts
**Reels caption:** "If you fell into Jupiter, you'd never hit the ground. 🪐" ... "Would you jump? Yes or no?" ... the Follow line
**"Next up" comment:** ☄️ Bonus: the probe hit Jupiter's air at about 47 km per second and slowed to a drift in under 2
minutes / Next up: SHARKS are older than TREES 🦈 Subscribe so you don't miss it! / Would you jump? Yes or no? 🪐
**Playlist:** Strange Nature
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: 2026-10-27 23:30 IST. **Subscribe arm:** pill (the pill test's
23:30 arm: the silent pill over the last 2.4 s; nobody says "subscribe").
**Topic kind:** CURIOUS (the topic test `kind-2026-10`). The next slot (28 Oct 11:30) is curious too, so the teaser is the
next line of the Curious queue.
**Hook formula:** The Impossible Claim, said to "you" (after The Question, The Question, The Impossible Claim). Candidates
weighed: The Question ("What happens if you jump into Jupiter? You never land.": two sentences for one idea), The Warning
("Never skydive on Jupiter: you'd never land.": the cost is not one the viewer is about to pay). Kept: "If you fell into
Jupiter, you'd never hit the GROUND." (the title, word for word, in the first sentence).
**Answer line (spoken, starts at 4.30 s):** "Jupiter has no floor. Just sky... and more sky."
**The loop:** "Still want to jump?" He nods, the camera whips up through every layer, the selfie phone CLICKS, and frame 1 is
him skydiving above Jupiter with the selfie stick again: the button and the hook read as one thought ("Still want to jump?
If you fell into Jupiter, you'd never hit the ground."). The pill (23:30 arm) plays over "Still want to jump?", his face and
the diamond above y 1050.
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover`: him falling with a shocked face in front of Jupiter's belts and the Great Red
Spot, JUPITER HAS / NO GROUND! in the middle square.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–1.0 | Hook: the selfie | TIGHT on him skydiving above Jupiter's belts (his head ~420 px), grinning up at the selfie phone on its stick (top left), thumbs-up, the scarf streaming up |
| 1.0–2.0 | Hook: "Jupiter" | the whip out to the whole planet, the Great Red Spot, him a speck with a YOU pill; CLICK (the selfie) |
| 2.0–4.2 | Hook: "you'd never hit the GROUND" | the dive back in, a cloud whoosh, then above the ammonia deck: high cirrus, storm towers, the Sun; he takes a landing stance on "GROUND" |
| 4.2–9.1 | Answer: POOF, POOF, ...pf | "no floor.": his boots touch the deck and he sinks through it (POOF); under it, his him-shaped hole glows above; "Just sky...": he tries landing on the next deck (POOF); "and more sky.": arms crossed, unimpressed, through the third (pf) |
| 9.1–12.4 | Thicker (the one picture) | under the water deck (lightning in its underside, the hole above), the haze closes in, his fall slows, the gauge AIR→SOUP→SYRUP→OCEAN pops in, its helmet marker sinking |
| 12.4–19.3 | Soup, syrup, ocean | noodles, carrots, peas and pasta letters drift up (a noodle lands on his helmet: splat); syrup: amber, slow motion, pancakes float by (bloop); the hot dark ocean: red glow from below, embers, sweat in his helmet; "Still no splash.": he braces and pinches the glass where his nose is... nothing; one eye opens; plip; a cricket |
| 19.3–26.6 | The probe | between the decks, NASA's probe sinks past him on its parachute (NASA PROBE 1995); he waves; "fifty-eight minutes": the clock runs to 58 MIN while red arrows squeeze it; "crushed.": CRUNCH, boo-oop |
| 26.6–32.4 | Deeper: diamonds | the camera sinks with him into the dark; lightning flickers in the decks far above; glints, then a shower of diamonds; DIAMOND RAIN? with a MAYBE stamp; one bonks his helmet (TINK), diamonds in his eyes, he catches one |
| 32.4–34.0 | Button | the selfie again, the diamond held up: "Still want to jump?" He nods (ding); the whip up |
| 34.0–34.4 | Loop | the hook's picture at negative time: the selfie above Jupiter, CLICK |

## Sound design

- **Beds:** space: a soft cosmic hum; the fall: a wind under 420 Hz with an air flutter above 5.2 kHz, as loud as he is
  fast (it follows the same keys as the picture's fall); the thick gas: a slow low swell; soup: a bubbling gurgle under
  300 Hz; the ocean and the deep: a heat roar under 140 Hz.
- **Hits:** the whip out (a top swish), CLICK (the selfie, in the gap after "Jupiter,"), YOU (glints), the dive (low) and
  the cloud (top); POOF, POOF and a small pf in the pauses after "floor.", "sky..." and "sky."; glints for the light through
  each hole; thunder (low) and a crackle (top) with every lightning flash; the gauge (low); splat (the noodle), bloop
  (syrup), a sizzle (top) on "hot", a sharp breath in (the brace), plip, one cricket; the parachute's rustle, the probe's
  lamp pips (top), the clock (a ratchet above 5 kHz), a creak under the squeeze, CRUNCH and a sad boo-oop; a low whoosh down;
  the diamonds' glints (top), the MAYBE stamp (low), TINK on the helmet, a music-box sparkle; a ding on his nod, the whip up,
  CLICK into the loop.
- **Score:** a bright D-major bounce for the jump, a wonder pad on the whole planet, a riser into the dive, the bounce on
  the cloud tops, a half-speed E minor for "and more sky", a dark descending drone for "thicker", a stew groove for the
  soup, a slow-motion groove for the syrup, a low heat drone for the ocean, a light groove for the probe and a drone with a
  top riser under the squeeze, a mystery pad going deeper, the bounce again on the button. It drops out for every
  punchline and for "Still no splash."
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. Gags measured in their gaps against the narrator (−16 dB): CLICK −28 (then +5 dB), POOFs −24/−25, pf −27,
  splat −23, bloop −22, plip −22, cricket −22, CRUNCH −20, boo-oop −21, TINK −24, sparkle −20, ding −19, whip −21.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Jupiter has no solid surface ("doesn't have a true surface"); you would never hit the ground | established | NASA Science, Jupiter Facts (science.nasa.gov/jupiter/jupiter-facts); B. Roulston (Clarkson Univ.), "Jupiter has no surface", The Conversation (2024, via ScienceAlert) |
| Deeper down, pressure and temperature rise and squeeze the hydrogen gas into a liquid; the change is gradual, with no sharp boundary or surface (so: no splash) | established | NASA Jupiter Facts ("compressing the hydrogen gas into a liquid"); Roulston ("At no point is there a sharp boundary, solid material or surface") |
| Soup / syrup / a hot, dark ocean | a metaphor for the rising density; deeper still the liquid hydrogen conducts like a metal and the interior is tens of thousands of degrees | NASA Jupiter Facts (metallic hydrogen); Roulston (~20,000 °C at the core) |
| The core is not solid either (partly dissolved, no clear edge) | leading result (Juno's gravity data) | NASA Jupiter Facts |
| Three cloud decks: ammonia ice on top, ammonium hydrosulfide in the middle, water ice and vapour below | established (likely composition) | NASA Jupiter Facts |
| NASA dropped a probe into Jupiter (the Galileo probe, 7 Dec 1995); it sent data for about 58 minutes (57.6), down to roughly 150 km below the cloud tops, about 22 to 24 bar and 150 °C, before the heat and pressure destroyed it | established | Galileo Probe Mission "Quick-look" Science Summary (NASA/Ames, 1996); Freedman & Kaufmann, *Universe*, 12-5; NASA artist's caption ("57.6 minutes before pressure destroyed it") |
| The probe entered at about 47 km/s and slowed to subsonic in under two minutes (the pinned comment's bonus) | established | the probe mission summaries above |
| Lightning flickers in Jupiter's water clouds | established | Galileo and Juno observations (NASA) |
| "Some scientists think it might rain... DIAMONDS" | hypothesis, hedged twice in the words and stamped MAYBE on screen: K. Baines (JPL) and M. Delitsky, DPS meeting 2013: lightning turns methane into soot, which hardens into graphite and then diamond as it sinks, melting deeper down; not observed | Astronomy.com / EarthSky / NOVA reports of the 2013 DPS presentation |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

**Two rounds.** qa.py 18/18 both times: 34.43 s (short arm), −14.03 LUFS, −1.89 dBTP after AAC, voice 26.5 dB over the mix
in the speech band (lowest word 12.1 dB), whisper WER 0.0 %, the answer at 4.30 s, the pill at 2.40 / 1.70 / 0.87 s before
the end, no frozen stretch, look cine.

| Item | Round 1 | Round 2 |
|---|---|---|
| 1 Claim, hook, answer | 9 | 9 |
| 2 Retention | 7 (27–30.5 s: one pose, one face, nothing new) | 8 |
| 3 Story | 9 | 9 |
| 4 Show, don't tell | 9 | 9 |
| 5 Narration | 8 | 8 |
| 6 Comedy | 8 | 8 |
| 7 Look | 8 | 8 |
| 7b Safe area | 9 | 9 |
| 8 Sound | 9 | 9 |
| 9 Science | 9 | 9 |
| 10 Packaging | 9 | 9 |
| 11 The loop | 9 | 9 |

What changed in round 2: every lightning flash in the deep sheds soot that falls and sparkles into tiny diamonds (the 2013
idea's mechanism, shown and never said), his eyes and head follow it through "Some scientists think...", he drifts, and the
push into the deep doubled; the glowing hole in the first deck fades in as the camera drops away (no flash over him at
6.0 s); CRUNCH! moved off his helmet; four glints in the sound for the sparkling specks. Before round 1 (on the stills): the
far cloud sea came out black (`mixHex` returns rgb(), not hex), the selfie phone was off-frame, the storm towers looked like
mushrooms, the landing pose read as a T-pose, the hole's light washed him out, the gauge and the probe's label crossed the
safe area, and a brown band crossed his cheek on the close-up (`form` 0.3 in the space light fixed it). The render of record
is `src/build.sh`'s own, from the cached takes (no ElevenLabs call), so the folder rebuilds.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
