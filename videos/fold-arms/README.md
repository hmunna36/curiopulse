# Fold Your Arms the OTHER Way. Feels WRONG? 🙅 — Short (29 s)

**Final file:** [`fold-arms-short.mp4`](fold-arms-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 29.03 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`fold-arms.srt`](fold-arms.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker on a summit above a sea of clouds, posing for his self-timer camera, folds his arms the other way and ties them in a pretzel; a window on top of his head opens on the cockpit that flies his arms (a brain pilot in a cap), and his identical twin folds the opposite way. Same rig, narrator (Jessica), caption and bloom look as the channel's other Shorts.
Cinematic look (`publish.json` "look": "cine"): the summit in high daylight with a soft pool on him (`SUM_LIGHT`), the cockpit in screen light with a pink rim (`CPIT_LIGHT`); the answer switches from one to the other at the dive (`setLights` in src/web/scenes.js).

## Plan (written before any code, story.md §5)

1. **Length:** tight arm (25–30 s, 55–64 words; `yt.mjs next-slot`: the 17 Nov 2026 23:30 IST slot, topic kind TEST,
   no pill). Script: 59 words.
2. **The test:** fold your arms; now fold them the other way. It feels wrong and most people fumble (put the same arm on
   top again, or get stuck). **Hook (The Direct Address, as the test):** "Fold your arms. Now fold them the OTHER way."
   Candidates: The Question ("Which arm's on top when you fold your arms? Now swap."), The Impossible Claim ("You can't
   fold your arms the other way. Try it."), The Direct Address (kept: the instruction itself, "your" in the first two
   words, and it confirms the title word for word). Last three formulas: The Direct Address (m-mouth-open), The
   Impossible Claim (gps-einstein), The Question (tongue-clover).
   **Answer (starts by 5 s):** "Feels wrong? You just switched OFF your autopilot."
   **Button:** "Now try the wrong way... FASTER." It sends the viewer back into the test and runs into "Fold your arms."
3. **Claims:** the table in Science notes.
4. **Beats (≈2.15 words/s):** hook 0–3 s (the knot by ~2.8 s) · answer ~3.4–6 s · "Switch back... Ahh. Autopilot." ~6.4–8.4 s
   (the viewer switches back: it feels right) · "You've folded that way thousands of times... it flies itself." ~8.5–11.5 s
   (the viewer holds the usual fold) · "The other way? Your brain flies it... by hand." ~11.8–14.3 s (the viewer tries the
   other way again) · "Weirdest part? Identical twins... almost half fold opposite ways." ~14.8–18.2 s · "Same DNA...
   different pilot." ~18.6–20.2 s · button ~20.6–22.5 s. No science word in the first 15 s (autopilot is an everyday word).
   The viewer's hands: 5 s holding the wrong fold, 8 s switching back, 10 s holding the usual fold, 13 s trying the wrong
   way again.
5. **Shots:** hook: the summit, close (his head ~380 px, his arms swinging into the fold), eye level, day · answer: a
   higher camera, the knot held; a window opens on the top of his head; the dive into the cockpit (spot mood: the alarm) ·
   back: a low camera, him against the sky on the left, the tripod on the right (whip in; day) · usual: the cockpit wide
   (warm) · hand: the cockpit closer, a dutch tilt (storm) · twins: a wide two-shot from eye level (whip in; day) · pilot:
   a push-in on the two heads, windows pop out of both (warm) · loop: close again, the camera eases back to frame 1's
   framing (whip in; day). Hitstops on OFF and FASTER; punch-ins on "Ahh" and FASTER; brow beats on "Now", "Switch",
   "Identical", "try".
6. **Subscribe arm:** none (the pill test ended 8 Nov); the button shot ends clean.
7. **The loop:** in the last 0.62 s the super-pretzel springs open and the arms rise into his usual fold; the camera
   eases to frame 1's framing; frame 1 is the arms mid-fold.
8. **Worlds:** new: `fa_world.js` (the summit above a sea of clouds: far plate with parallax, the rocky top, a cairn with
   a flag, prayer flags, the SUMMIT sign, his backpack and thermos, a camera on a tripod with a self-timer lamp and
   flash), `fa_arms.js` (folded arms for the rig: either arm on top, open, fumbling, the pretzel and the super-pretzel),
   `fa_cockpit.js` (the cockpit in his head: time-flies' brain as the pilot with a cap, a headset or a moustache, the
   AUTOPILOT sign, the ARMS monitor, two arm levers, the FOLDS counter, alarm beacons).
9. **Cover:** the pretzel, OTHER WAY?
10. **Caption question:** "Which arm's on top: left or right?"

## Narration (59 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Fold your arms. Now fold them the OTHER way.
> *(0.44 s)* Feels wrong? You just switched OFF your autopilot.
> *(0.28 s)* Switch back... Ahh. Autopilot.
> You've folded that way thousands of times... it flies itself.
> The other way? Your brain flies it... by hand.
> *(0.40 s)* Weirdest part? Identical twins... almost half fold opposite ways.
> Same DNA... different pilot.
> Now try the wrong way... FASTER.

No v3 tags: the takes were already performed (answer and hand were retaken once each, when "wrong?" and "hand." fell
8–10 dB under the narration in the speech band; both retakes hold up).

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/… | … 11:30 IST |
| Instagram Reels | https://www.instagram.com/reel/… | … 06:30 or 18:30 IST |

**Title:** Fold Your Arms the OTHER Way. Feels WRONG? 🙅

**Description:**
Fold your arms. Now fold them the OTHER way. Feels wrong? You just switched off your autopilot. You've folded your usual way thousands of times, so it runs by itself. The other way has no habit behind it, so your brain has to fly it by hand. Weirdest part: it isn't in your genes. Almost half of identical twin pairs fold their arms opposite ways. Same DNA, different pilot.  
Which arm's on top: left or right?  
  
The science: most people have a fixed way to fold their arms, and only a few per cent don't care which arm goes on top. A movement you have done thousands of times becomes a habit that runs almost automatically; a new one needs your attention (that's the "autopilot" here: habit research in general, not a study of arm folding itself). In two twin studies, 109 of 237 identical twin pairs (46 %) folded opposite ways, not far from the 56 % of non-identical pairs, so the old idea of a single arm-folding gene doesn't hold up (Reiss & Reiss 1998, via John McDonald's Myths of Human Genetics).  
  
Bonus: crossing your arms may dull pain a little. In a 2011 study at University College London, a laser zap on the hand felt weaker with the arms crossed (Gallace et al., Pain, 2011).  
  
Next up: can you make SAD eyebrows on purpose?  
  
Subscribe for a new strange question every day.  
  
#Shorts #Science #HumanBody #BodyTest #FunFacts #Brain

**Hashtags:** #Shorts #Science #HumanBody #BodyTest #FunFacts #Brain
**Tags:** fold your arms, arm folding, fold arms other way, crossing arms, arms crossed, body test, brain autopilot, habits, motor habits, identical twins, human body facts, science facts, fun facts, curiopulse
**Reels caption:** Fold your arms. Now fold them the OTHER way. 🙅 / Feels wrong? You just switched off your autopilot: your usual fold runs by itself, the other way your brain flies by hand. And almost half of identical twins fold opposite ways! / Which arm's on top: left or right? / Follow @curio_pulse_tv for the next one: can you make SAD eyebrows on purpose? 🔔 / #science #humanbody #bodytest #funfacts #brain #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** 🙅 Bonus: crossing your arms may dull pain a little. In a 2011 study, a laser zap on the hand felt weaker with the arms crossed. / Next up: can you make SAD eyebrows on purpose? 😟 Subscribe so you don't miss it! / Which arm's on top: left or right? 🤔
**Playlist:** Your Brain Is Weird
**Length arm:** tight (25–30 s, every Short for a slot from 10 Nov 2026), from `yt.mjs next-slot`: the 17 Nov 2026 23:30 IST slot, no pill, topic kind TEST.
**The viewer's test (rules of 15 Oct 2026):** fold your arms, then fold them the other way: it feels wrong, and many put the same arm on top again. While the lesson runs they switch back (it feels right), hold the usual fold, and try the other way once more; the button sends them back to try it faster.
**Answer line (spoken, starts by 5 s):** "Feels wrong? You just switched OFF your autopilot." (starts at 4.08 s)
**The loop:** the last line "Now try the wrong way... FASTER." runs straight into "Fold your arms.": the super-pretzel springs open and his arms rise into frame 1's fold; nothing after it (≤ 1.0 s to the loop); no Subscribe pill, nobody says "subscribe"
**Cover:** [`cover.jpg`](cover.jpg), drawn on its own (`SC.cover`): the pretzel, close, under OTHER WAY?

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.00–4.00 | Hook (the test) | The summit, a medium close shot, eye level: his arms rise into his usual fold for the self-timer (frame 1); "Now fold them" unfolds them, "the OTHER way" fumbles them into a pretzel (3.6 s); the self-timer flashes |
| 4.00–8.07 | Answer | A higher camera on the knot; a round window opens on top of his head; the camera dives through it into the cockpit that flies his arms: AUTOPILOT OFF (hitstop), alarms, the brain pilot throws his coffee |
| 8.07–10.87 | Switch back | Whip in; a low camera, him against the sky, the tripod on the right: the knot pops on "Switch", the usual fold snaps home on "back", "Ahh" (bliss, punch-in); a thought window: AUTOPILOT ON, the pilot dozing with his coffee |
| 10.87–14.57 | Usual | The cockpit, warm: the FOLDS counter rolls to 9,999+, the pilot dozes with his hands behind his head while the levers and the ARMS monitor fold his arms by themselves |
| 14.57–18.40 | By hand | The cockpit closer, a dutch tilt, the alarm: the pilot grabs both levers and yanks; the monitor's arms fumble into the knot on "hand" |
| 18.40–23.73 | Twins | Whip in; a two-shot on the summit: he and his identical twin fold at once, mirror images; IDENTICAL TWINS, 46%, FOLD OPPOSITE, arrows at each top forearm; they look at each other's arms, then at each other |
| 23.73–26.10 | Different pilot | A low angle, closer, the two heads against the sky: SAME DNA; a window pops out of each head: a blue-cap pilot and a red-cap pilot with a moustache salute |
| 26.10–29.03 | The button + loop | Whip in; close again: "Now try the wrong way" whirls his arms, FASTER ties the super-pretzel (punch-in, hitstop); it springs open and the camera eases back to frame 1 |

## Sound design

- **Beds:** summit wind under 380 Hz with slow gusts and prayer flags flapping above 5 kHz (only on the summit), the cockpit's low hum (only in the cockpit), the self-timer's high tick until its flash.
- **Hits:** the jacket's swish on every fold, rubbery creaks for the fumble, a BOING and a squeak as the knot ties, the shutter; a hatch clunk, the dive's whoosh, the klaxon (its edges under the words, a whole blast in the pause), the OFF switch's CLUNK with the hitstop's layered hit, a coffee splash; the knot's pop (a high click and a low thud under "Switch"), the fold's thud, a warm chime after "Ahh.", a ding for the green sign; the FOLDS ratchet and a ding at 9,999+, the levers' servo (high); lever clunks (low) and a boing after "hand."; pill pops (high), a thud for 46%, the shutter and a gust for the stare; two window pops and two dings for the salutes; the whirl, the super-pretzel BOING with the hitstop after "FASTER.", the spring-open pop and the swish into frame 1.
- **Score:** a 112 BPM groove in F (F–Bb–C–F) under the test; a low drone under the answer line; F–C for "switch back"; a half-time lounge groove (92 BPM, Bb–Gm–C–F) while the autopilot flies; a tense sixteenth-note Dm groove (128 BPM) for "by hand"; the F groove again for the twins. It drops out for every punchline (the knot, OFF, "Ahh", the twins' stare, "pilot.") and stays out from FASTER to the loop, so frame 1 brings it back.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qa.py`: 20/20; content-word SNR mean 15.8 dB (min 4.5 dB), WER 3.4 %, true peak −1.77 dBTP.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Folding the arms the other way feels very wrong, and many people fumble it (the same arm ends up on top again) | established (surveys, everyday experience) | McDonald, *Myths of Human Genetics*, "Arm folding" (Univ. of Delaware, 2011); Wiener 1932, *American Naturalist* 66:365-370 |
| Only a few per cent have no preference | established (surveys) | McDonald 2011, citing Reiss & Reiss 1998, *Psychologia* 41:81-87 |
| "Autopilot": a movement done thousands of times runs as an automatic habit; a new one needs conscious control ("by hand") | leading idea, simplified; not tested on arm folding itself, so the Short says it as a picture, not a finding | Wood & Rünger 2016, *Annual Review of Psychology* 67:289-314; Yin & Knowlton 2006, *Nature Reviews Neuroscience* 7:464-476 |
| "Thousands of times" | estimate (a few folds a day for years) | arithmetic |
| Almost half of identical twin pairs fold opposite ways | established (two twin studies) | Reiss & Reiss 1998 (via McDonald 2011): 109 of 237 identical pairs (46 %) differed, 78 of 139 fraternal pairs (56 %) |
| So it is not one gene ("same DNA, different pilot") | established: the old one-gene story does not hold | McDonald 2011; Wiener 1932 |
| Bonus (description and pinned comment only): crossing the arms may dull pain a little | one study, hedged ("may") | Gallace, Torta, Moseley & Iannetti 2011, *Pain* 152:1418-1423 |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

### Round 0 (stills, before the full render)

Found on the first 38 stills and fixed:
- Frame 1 was a full-length shot (head to shoes, the "wide" opening that kept 46-50 % in openings.jpg): the hook and
  loop cameras now hold a medium close shot (zoom 3.3-3.5, his head and the fold fill the frame), the self-timer
  camera moved in (x 745) so its lens stays in frame for the flash.
- The answer's window shot was wide too: now a high medium shot (zoom 2.75).
- "Switch back": a black band over the sky on the low camera (the far plate ran out): the plate now sits on the top
  sky colour; the shot is a medium-wide low angle (zoom 2.0) instead of a wide; the thought window moved beside his
  head (it sat under the top of the frame and the watermark) and shows the sign and the pilot (scale 0.29).
- The AUTOPILOT sign's ON/OFF badge sat on the last T: the word and the badge are measured now.
- The cockpit sign sat on the watermark's row in "usual" and under the top of the frame in "by hand": the cockpit is
  framed lower (cy 900 / 800); in "by hand" the captions sit at y 1560 so they clear the pilot's face.
- The twins' FOLD OPPOSITE pill and 46% covered their faces: a tighter, lower two-shot (zoom 1.72) puts the heads
  under the labels.
- A drifting cloud sat on a twin's head like a chef's hat in the pilot shot: no drifting clouds in that shot.
- The self-timer's flash whited out the frame for three frames: a burst round the lens instead.
- Sound: the coffee splash and the klaxon's blast rang into "Switch" (SNR -1.8 dB): both fit the 0.3 s pause now;
  the knot's pop is a high click plus a low thud; the groove stops when the answer starts (a low drone under it);
  the 9,999+ ding, the salute dings and the loop's whoosh moved off "it" and "Now"; the score stays out from FASTER to
  the loop. Every word now sits 3 dB or more above the background.

### Round 1 (first full render, 29.03 s)

qa.py: 20/20 pass (length 29.03 s, -14.03 LUFS, true peak -1.77 dBTP, content-word SNR mean 15.8 dB / min 4.5 dB,
WER 3.4 %, answer at 4.08 s, 0.69 s from the last word to the loop).

Ship bar, round 1 (scored on qa.py's sheets and the safe_sheet):
1 test/hook/answer 9 · 2 retention 8 · 3 story 9 · 4 show 9 · 5 narration 8 · 6 comedy 8 · 7 look 8 · 7c camera 7 ·
7d acting 8 · 7b safe area 6 · 8 sound 8 · 9 science 9 · 10 packaging 8 · 11 loop 9.

Below 8, with causes:
- 7b (6): safe_sheet.png showed his gripping fist (frame 0, 1 s) and his hanging right hand (2 s, 26.7 s) under the
  like/comment column (x >= 880 below y 1050), the right twin's arm and elbow there too (19-23 s), and the pretzel
  knot (3.6 s, the answer, FASTER) about 300 rig units wide, past both edges.
- 7c (7): the twins' two-shot and the "different pilot" shot were both eye-level two-shots, one after the other.

Fixes for round 2:
- The fold spans about 260 rig units, so the hook holds zoom 2.85-2.98 (his head about 460 px tall, still tight) with
  him left of centre (camera x 561): the fold fills x 60-870 and the captions now sit under his arms, not on them.
- The open arms hang closer to his sides (wrists +-96); the knot's elbows pulled in (-112/+104), so the pretzel is no
  wider than the fold; the answer's camera and the button's (which pulls back to 2.5 as the super-pretzel grows) follow
  the same fit, and the FASTER punch-in is 1.12 (it scales about his face).
- The twins stand closer (x 420/680) in a slightly wider two-shot (zoom 1.5) with the labels centred over them; the
  pilot shot is now a low angle (horizon dropped), closer (zoom 1.85), the windows over the heads.

### Round 2 (29.03 s)

qa.py: 20/20 pass (same numbers as round 1: the sound did not change).

Ship bar, round 2:
| # | Item | Score | Evidence |
|---|---|---|---|
| 1 | Test, hook, answer | 9 | "Fold your arms." on frame 0, a medium close shot (head about 460 px tall) of him folding his arms for the self-timer; "Now fold them the OTHER way" fumbles them from 1.65 s into the pretzel at 3.62 s; the answer "Feels wrong? You just switched OFF your autopilot." at 4.08 s (a window on his head, the dive, AUTOPILOT OFF) |
| 2 | Retention | 8 | the viewer's hands: 5 s holding the wrong fold ("Feels wrong?"), 8 s switching back ("Switch back... Ahh."), 10 s holding the usual fold ("Autopilot."), 13 s still holding it ("thousands of times... it flies itself"), 14.6 s trying the other way again; the mechanism is one picture (a pilot flying his arms: dozing on autopilot, yanking levers by hand); no science word; a new reveal every 2-4 s; escalation to the twins (46 %) |
| 3 | Story | 9 | test -> answer -> mechanism (autopilot / by hand) -> the weirdest fact (twins) -> sting ("Same DNA... different pilot.") -> button back into the test ("Now try the wrong way... FASTER.") |
| 4 | Show, don't tell | 9 | every line has its picture: the cockpit sign, FOLDS 9,999+, the dozing pilot, the levers, 46 %, two different pilots |
| 5 | Narration | 8 | performed; answer and hand retaken once for faint endings; WER 3.4 % |
| 6 | Comedy | 8 | the answer (window opens on his head, coffee flies off on OFF), the dozing pilot with his hands behind his head, the salute of two pilots, the super-pretzel on FASTER |
| 7 | Look | 8 | summit daylight, cockpit screen light with a pink rim, colours vivid; the flash is a burst round the lens |
| 7c | Camera and light | 8 | cuts: MCU eye level (left of centre) -> high MCU -> dive into the cockpit (wide) -> whip, low-angle medium on the summit -> cockpit wide (warm) -> cockpit close, dutch tilt (storm) -> whip, eye-level two-shot -> low-angle closer two-shot (warm) -> whip, MCU; 3 whips (8.07, 18.40, 26.10 s); punch-ins on "Ahh" and FASTER; mood day -> spot -> day -> warm -> storm -> day -> warm -> day; foreground layer in 4 shots, particles in 8; the summit dressed (cairn, flags, SUMMIT sign, backpack, thermos, tripod camera) |
| 7d | Acting and timing | 8 | blinks and eye darts, brow beats on "Now", "Switch", "Identical", "try"; snapRamp on every fold; hitstops with the layered hit on OFF and FASTER |
| 7b | Safe area | 8 | safe_sheet.png: the fold, the knot, the window, the twins and every caption inside the key zone; left outside on purpose: the sign at the top of the "by hand" shot (background there) and the right twin's folded elbow in the pilot shot (the windows over their heads are that shot's action) |
| 8 | Sound | 8 | every beat has its sound; the score drops for every punchline and stays out from FASTER to the loop; content-word SNR mean 15.8 dB, min 4.5 dB |
| 9 | Science | 9 | the claims table in the README; "autopilot" is general habit research, said as a picture and hedged in the description |
| 10 | Packaging | 8 | title 44 characters; the cover (the pretzel, OTHER WAY?) reads at thumbnail size; description and caption end on "Which arm's on top: left or right?" |
| 11 | The loop | 9 | no "subscribe", no pill; the last frame is his arms rising into frame 0's fold; "...FASTER." runs into "Fold your arms."; 0.69 s from the last word to the loop |

Satisfied: qa.py clean, every item 8 or more.

### Rebuild proof

`WORK=../.work-build bash src/build.sh` from the cached takes: timeline.json and mix.wav identical to .work's, the MP4
byte-identical to round 2's; qa.py on it: 20/20.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
