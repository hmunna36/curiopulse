# Why Do Your Ears RUMBLE When You Yawn? 👂 — Short (31 s)

**Final file:** [`ear-rumble-short.mp4`](ear-rumble-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 31.2 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`ear-rumble.srt`](ear-rumble.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker at a campsite at night (mosquito-bites' camp: pines, a lit tent, a string of bulbs, the fire), mid-yawn, TIGHT, his
ears rumbling; a window on his ear shows the tiny muscle doing a bodybuilder flex; his friend in a camp chair tries it and pulls
a weird face; we dive into the ear in section (ears-pop's ear) where the muscle tugs the hammer bone and pulls the eardrum tight;
earmuffs, a volume knob and two crisps; then, zipped into a sleeping bag with an ear camera, he types HI with two rumbles and
answers YES. Same narrator (Jessica), same caption, bloom and light as the other CurioPulse Shorts.
The look is the cinematic lighting (`publish.json` "look": "cine"): the camp under `LIGHTS.lanterns` with the fire as the warm
rim from the right, the ear under `LIGHTS.inside` (`setLights` in `src/web/scenes.js`).

## The plan (written before the build)

- **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: 2026-10-29 11:30 IST, "short", the no-pill arm of the pill
  test, topic kind TEST). Built: 74 words, 31.2 s.
- **The test the viewer does:** yawn, a big one: most people hear a low rumble in their ears at the top of the yawn. Then the
  same test a new way, by 8–13 s: do it WITHOUT the yawn (up to half of people can). Safe, a few seconds, phone in hand.
- **Hook formula:** The Direct Address, the instruction itself (after The Direct Address on pat-head, The Comparison on sharks,
  The Impossible Claim on Jupiter). Candidates: (1) Direct Address "Yawn. A big one. Your ears RUMBLE, right?" (kept: the test
  in the first word, everyone can do it, "your ears RUMBLE" confirms the title in the first sentence); (2) The Question "Can you
  make your ears RUMBLE? Try it, no yawning." (only up to half can: a hook half the viewers fail); (3) The Impossible Claim
  "There's a muscle in your ear you can flex. Try it." (the claim first, the test second: slower).
- **The strange thing by 3 s:** the rumble lands on "RUMBLE" (2.74 s), at the top of the yawn, with rings shaking out of his ears.
- **Answer line (starts at 4.63 s):** "Congrats. You just flexed your EAR." A plain claim that leaves "wait, a muscle? where?".
- **5–13 s, what the viewer's face is doing:** 5 s: finishing the yawn, hearing it fade; 8 s: "Now do it WITHOUT the yawn":
  straining to rumble; 10 s: "Up to half of you can": still trying, or smug; 12–13 s: "The rest... just pulled a weird face":
  caught mid-face. The mechanism is ONE picture on their own ear (the muscle pulling the drum tight), from 14 s.
- **Mechanism, pointing back to the test:** "That muscle pulls your eardrum tight... like a drum." "Sound went muffled? It's a
  volume knob, for your own chewing." No science word spoken (the muscle's name is a label only).
- **The weirdest true fact:** "Scientists are testing it so people who can barely move... can type with a rumble." (EarSwitch.)
- **Button (sends them back to the test):** "Go on. Rumble twice for yes." → loops into "Yawn. A big one."
- **The loop:** the last 0.45 s is the hook at negative time (`hookA(tt)`, `hookCam(tt)`): mid-yawn, arms going out: frame 1.
- **Caption question:** "Could you do it without yawning? Yes or no?"
- **Worlds:** mosquito-bites' `camp.js` (campFriend takes `o.post`, campChar `o.pre`), ears-pop's `ear.js` (`noTubeMuscle`);
  new: `rumble.js` (rings, big ears, the flexing muscle in a window, the eardrum's muscle `erTT`, tight-drum ticks, a
  drumstick, earmuffs, the knob, crisps and a bag, a sleeping bag, the ear camera, its view of the eardrum, the tablet with a
  scanning keyboard and YES / NO, confetti, the no-yawn badge, the friend's weird face).
- **Cover:** a frame of its own (`SC.cover`): mid-yawn with the rings, EARS / RUMBLE?!

## Narration (74 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Yawn. A big one. Your ears RUMBLE, right?
> Congrats. You just flexed your EAR.
> Now do it WITHOUT the yawn.
> Up to half of you can.
> The rest... just pulled a weird face.
> That muscle pulls your eardrum tight... like a drum.
> Sound went muffled? It's a volume knob, for your own chewing.
> Scientists are testing it so people who can barely move... can type with a rumble.
> Go on. Rumble twice for yes.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/6QOky2URd9k | 29 Oct 2026, 11:30 IST (scheduled; thumbnail, captions, playlist "Why Does Your Body Do That?"; cover.jpg also set in Studio's vertical slot, which showed an automatic frame) |
| Instagram Reels | @curio_pulse_tv | 1 Nov 2026, 18:30 IST (scheduled in Meta Business Suite, Instagram only, cover.jpg as the cover; Content → Scheduled shows the row with the caption) |
| Facebook Page | CurioPulse | 1 Nov 2026, 18:30 IST (scheduled by `fb.mjs reel`, video 2820187861686358) |

**Title:** Why Do Your Ears RUMBLE When You Yawn? 👂 (40 characters)

**Description:** see `publish.json` (the story, the one-word question "Could you do it without yawning? Yes or no?", the
subscribe line, `#Shorts #Science #Ears #HumanBody #FunFacts`).
**Reels caption:** "Yawn. A big one. Your ears RUMBLE, right? 👂" / That's a tiny muscle in your ear flexing: it pulls your eardrum
tight, like a volume knob for your own chewing. Up to half of people can do it without the yawn. / Could you do it without
yawning? Yes or no? / Follow @curio_pulse_tv for the next one: a teaspoon that weighs more than a mountain 🥄 / #science
#humanbody #ears #funfacts #reels
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** a bonus line (the muscle also
tightens when you chew, shout, or expect a bang) / Next up: … Subscribe so you don't miss it! / Could you do it without
yawning? Yes or no? 👂
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: the 2026-10-29 11:30 IST slot (pill test: no pill).
**The viewer's test (rules of 15 Oct 2026):** a big yawn: a rumble in the ears; then the same without the yawn.
**Answer line (spoken, starts at 4.63 s):** "Congrats. You just flexed your EAR."
**The loop:** "Go on. Rumble twice for yes." runs into "Yawn. A big one."; no pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (rendered by `src/cover.sh`).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.00–4.57 | hook | TIGHT on him by the fire (head ≈ 470 px), already mid-yawn, fists pushed out sideways (clear of his ears); on "RUMBLE" gold rings shake out of both ears and the camera shakes; the yawn closes on "right?" and his eyes pop open |
| 4.57–7.57 | flex | "Congrats.": confetti bursts from his ear (a party horn); a round window opens on it: a tiny red muscle in a sweatband flexes its arms on "EAR" (a rubbery squeak) while he looks round at his own ear, proud |
| 7.57–9.80 | retry | his face again, mouth SHUT, straining (sweat, eyes up, a tremble), a crossed-out yawn badge; then small rings: he gets it, eyes wide |
| 9.80–11.47 | half | a two-shot across the fire: him smug, hands on hips, rumbling; his friend in a camp chair watching; CAN ✓ |
| 11.47–14.17 | face | the camera pans to the friend: he tries, cheeks puff, eyes cross, and on "weird face" his tongue pops out (pbbbt) |
| 14.17–17.67 | drum | a window on his ear, the dive into the ear in section: the muscle (label TENSOR TYMPANI) shortens, its tendon tugs the hammer bone, the eardrum (label) is pulled in, tight ticks on it; "like a drum": a drumstick comes down the canal: TOK!; his face rumbling in a round frame |
| 17.67–21.73 | payoff | back at the fire with a bag of crisps: "Sound went muffled?": fluffy earmuffs pop on and his bite comes out a soft "crnch"; "volume knob": a VOL knob at his ear; "for your own chewing": a big CRUNCH! that the knob turns down while it sounds |
| 21.73–27.07 | weird | zipped into a mummy sleeping bag (only his face shows), an EAR CAMERA in his ear, what it sees (the eardrum, twitching), a tablet whose keyboard scans; each rumble picks a letter: H, I (ding-ding) |
| 27.07–30.73 | button | tighter: the tablet asks YES / NO; after "yes" two rumbles, YES lights green, he grins |
| 30.73–31.20 | loop | the hook at negative time: the last frame is frame 1 a moment earlier |

## Sound design

- **Beds:** the campsite (the fire's low rumble and crackle, a breeze, far-off crickets) that dips while he rumbles (a tensed
  eardrum muffles low sounds); inside the ear a warm throb.
- **The rumble:** `ear_rumble()` in `src/audio.py`: a buzz near 31 Hz saturated so its harmonics reach ~260 Hz (a phone plays
  them), rolling like far-off thunder; under the words it stays under 270 Hz; the two YES rumbles (no words) add a growl at
  280–700 Hz.
- **Hits (each in the pause after its word):** a low yawn groan and breath under the hook, "?!" after "right?", a party horn
  after "Congrats.", confetti (top), the window's sparkle, a rubbery squeak after "EAR.", the badge tick, a ding for CAN ✓, a
  raspberry after "face.", the dive, the muscle's creak, TOK after "drum.", a muffled crnch after "muffled?", the knob's clicks
  and a CRUNCH turned down as it sounds after "chewing.", the camera's sparkle, the scan ticks, a beep for H, ding-ding for HI,
  the YES chime.
- **Score:** a lazy groove for the yawn, a bouncier one for the flex, a sneaky one for the tries, a busier sixteenth groove
  inside the ear, the knob groove, a warm pad under the ear camera, a gentle groove into the button; it drops out for every
  punchline.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after AAC.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Some people can contract the tensor tympani at will ("ear rumbling"): the eardrum visibly moves and they hear a dull rumble | established | Hoyle et al., "Exploring the 'EarSwitch' concept", J NeuroEngineering Rehabil 21:210 (2024), doi:10.1186/s12984-024-01500-z; Wikipedia, Tensor tympani muscle (voluntary control; Angeli et al. 2013) |
| A deep yawn (or tensing the jaw) sets the rumble off in many people | widely reported | Wikipedia, Tensor tympani muscle (North Alabama ENT, 2020); University of Bath, EarSwitch announcement (6 May 2021): concentrating while yawning, people notice "a fullness or rumbling" and that it is harder to hear |
| "Up to half of you can" (at will, without moving the face) | upper bound, self-report: hedged ("up to") | Hoyle et al. 2024: 55 % of 1,853 surveyed said they could rumble without accompanying movements (an upper bound; 80 % of a subset checked by otoscope reported accurately); Röddiger et al., EarRumble, CHI 2021: 43.2 % of 192 |
| The muscle pulls the hammer bone inward and so tightens the eardrum, damping its vibration | established | Wikipedia, Tensor tympani muscle; standard anatomy (it inserts on the handle of the malleus) |
| A tightened drum passes less low sound ("Sound went muffled?") | established (small study) | Wickens, Floyd & Bance 2017: voluntary contraction gave a low-frequency conductive hearing loss in five volunteers (via Wikipedia) |
| Its everyday job: turning down sounds you make yourself, like chewing | textbook function | Wikipedia, Tensor tympani muscle ("dampens the noise produced by chewing"; also shouting, startle, anticipation: Jones, Greene & Ahroon 2018) |
| Scientists are testing it so people who can barely move can type with a rumble | established (a device in trials) | University of Bath (EarSwitch: a camera in a silicone earpiece sees the eardrum move and drives an on-screen keyboard; for MND and similar conditions); ClinicalTrials.gov NCT05784727 (EarSwitch Phase A, University of Bath, NIHR i4i); Hoyle et al. 2024: 20 % of 95 people with MND reported the ability |
| The pictures | simplified | the muscle is drawn in a bony canal above the eustachian tube, its tendon turning round a little hook of bone (the cochleariform process) to the hammer's neck; the rumble rings and the flexing bean are cartoons |

## Ship review

Two rounds (`.work/qa/ship-review.md`). qa.py 18/18 both times: 31.20 s, −14.03 LUFS, −1.74 dBTP, content-word SNR 20.2 dB,
WER 0.0 % over 74 words, the answer at 4.63 s, no pill (the no-pill arm), nobody says "subscribe".

| # | Item | Final |
|---|---|---|
| 1 | Test, hook, answer | 9 |
| 2 | Retention | 8 |
| 3 | Story | 8.5 |
| 4 | Show, don't tell | 8.5 |
| 5 | Narration | 8 |
| 6 | Comedy | 8.5 |
| 7 | Look | 8 |
| 7b | Safe area | 8.5 |
| 8 | Sound | 8 |
| 9 | Science | 9 |
| 10 | Packaging | 8.5 |
| 11 | Loop | 8.5 |

What changed while building: the hook was framed tighter (head ≈ 470 px) and his stretch moved out sideways, so his elbows no
longer covered his ears; the arms drop fast after the yawn (they passed through a T-pose); the flexing muscle's window grew; the
two-shot was brought closer, then (round 2) pulled back a little so the friend's head left the covered right edge; the
friend's tongue waits for "weird face"; the ear section was reframed and the eardrum's muscle moved above the tube (ear.js's
tube muscle left out); "Sound went muffled?" got its picture (earmuffs) and the two crunches were reordered (a muffled crnch,
then a CRUNCH the knob turns down); the crunch words, the knob and the camera view moved inside the safe area; "half" was
retaken once (whisper heard "Ken").

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
