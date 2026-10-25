# Can You Make Your Eyes SHAKE on Purpose? 👀 — Short (33 s)

**Final file:** [`eyes-shake-short.mp4`](eyes-shake-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 32.9 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`eyes-shake.srt`](eyes-shake.srt). Cover: [`cover.jpg`](cover.jpg).

A viewer's idea (@Neptune_8thPlan3t, in the comments of the Vulcan-salute Short), credited in the description and the
"Next up" comment. The hiker by a campfire at night (mosquito-bites' `camp.js`: pines, a tent lit from inside, a string
of bulbs), close, trying to shake his eyes: his eyes are drawn again, bigger, over the rig's (`eyes.js`, after
mirror-eyes' `meEyes`), and they only hop, slowly, while his eyebrows wiggle instead. The "parking brake" is a red brake
caliper that clamps each iris between jumps, with a red (P) dashboard lamp on his forehead. Across the fire, his friend
(camp.js' friend in the camp chair: beanie, round glasses, a mug) lets go: the calipers spring off and his eyes buzz.
A hummingbird stops to stare; framed family photos close it out. Jessica narrates, word-pop captions, the house bloom.
Cinematic lighting (`publish.json` "look": "cine"): a night outdoors under warm lamps, the fire as the rim (on the
hero's left, on his friend's right: `flipLight`), `setLights` in `src/web/scenes.js`.

## The plan (written before the build)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: the 26 Oct 2026 23:30 IST slot; the topic test
   says TEST, the pill test says PILL). 74 words.
2. **The viewer's test:** try to make your eyes shake fast, side to side; most people can't (their eyes only hop);
   then cross them a little and try again (crossing is what often sets it off in people who can). Stop if dizzy (on
   screen). Hook formula: **The Question** ("Can you SHAKE your eyes? Try it, side to side.": the title's question put to
   the viewer, then the instruction). Candidates: The Direct Address ("Try to make your eyes shake, side to side.": the
   same test, but the title's words come second), The Statistic ("Only one in twelve people can do this.": a number
   first, the test later). Last three: tongue-nose (Question), mirror-eyes (Direct Address), and the two CURIOUS Shorts
   (Impossible Claim): no formula three times in a row.
3. **Why this topic tonight:** the first line of the Queue, a viewer request the user promised (24 Oct). The second
   Short of 25 Oct (the 02:00 routine fired late: 13:22 IST; another run took the Venus topic meanwhile). No hit to
   follow: circle-line (36K, 24 Oct) is under five times the middle views per Short since 16 Oct (about 9K).
4. **Hook sentence:** "Can you SHAKE your eyes? Try it, side to side." (0.11–3.65 s; frame 0 is his face close, 830 px,
   his eyes mid-hop with effort marks at his temples). **Answer (starts 4.25 s):** "Can't? Your eyes have a parking
   BRAKE." (a red caliper clamps each iris, a handbrake ratchet and CLUNK, the (P) lamp lights on his forehead).
   **Button:** "Still can't? Blame your parents." (his own family photo: mum and dad, calipers on, lamps lit) → the
   loop: "Can you SHAKE your eyes?"
5. **Beats, and what the viewer's eyes are doing (the 8–13 s rule):** the test (0–3.7: trying) → can't: a parking
   brake (4.3–7.7: they just tried) → cross them a little and try again (8.0–10.2: crossing, trying again; STOP IF
   DIZZY) → eyes move in jumps, with the brake on in between (10.5–14.2: the camera pushes into his eye: the caliper lets
   go, the iris JUMPS, it clamps again: the viewer is still trying) → one in twelve seem to let go (14.6–17.0: the twelve
   faces, one lit; his friend's calipers SPROING off; BZZZ) → back and forth (17.6–18.4: the hero copies, one slow hop
   per word, CLANK) → fifteen times a second (18.6–20.7: the friend's eyes close, buzzing; a hummingbird stares) →
   harmless; on their own, a doctor (21.2–25.4: a party trick, applause; a stethoscope round the hero's neck) → it
   runs in families (25.9–29.3: the friend's family photo, all buzzing) → blame your parents (29.8–31.9). No science
   word is spoken; "voluntary nystagmus" is only in the description.
6. **Every mechanism line points back to the test:** the brake is on the viewer's own eyes (his eyes, close); the
   jump-clamp cycle is what their eyes did when they tried; the button sends them to their own family.
7. **The caption's one-word question:** **"Could you shake them? Yes or no?"**
8. **Ending (the pill arm):** the silent pill over the last 2.4 s (30.50–32.30), while the camera is on the photo (his
   parents' faces at y 600–1000, clear of it); the last 0.47 s is the hook at negative time: the last frame is frame 0's
   picture.
9. **Cover:** `SC.cover`: his friend's eyes buzzing behind round glasses, a hummingbird staring; CAN YOU / DO THIS?

## Narration (74 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Can you SHAKE your eyes? Try it, side to side.
> Can't? Your eyes have a parking BRAKE.
> Cross them a little... and try again.
> Eyes move in jumps, with the brake on in between.
> About one in twelve people seem to let go...
> back and forth, about fifteen times a second.
> Harmless... unless they shake on their own. Then, doctor.
> Can you? Ask around: it often runs in families.
> Still can't? Blame your parents.

One take per block, first time (395 characters). Three phrases were aligned early by v3 and moved onto their own
speech-band bursts in `make_timeline.py` ("and try again", "in jumps", "in between").

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (after upload) | 26 Oct 2026 23:30 IST |
| Instagram Reels | (Business Suite) | (the slot `yt.mjs` picks: 18:30 or 21:00 IST, never before the YouTube release) |
| Facebook Page | (fb.mjs) | the same slot as the Reel |

**Title:** Can You Make Your Eyes SHAKE on Purpose? 👀

**Description:** in [`publish.json`](publish.json) (the test, the brake, 1 in 12, harmless, see a doctor if they shake
on their own, it runs in families, "Could you shake them? Yes or no?", the viewer's credit, the subscribe line).

**Reels caption:** the hook line, the brake in one sentence, "Could you shake them? Yes or no?", the Follow line with
the next topic (can you raise just ONE finger?).
**"Next up" comment:** Next up: can you raise just ONE finger? 🖐️ Subscribe so you don't miss it! / Idea from
@Neptune_8thPlan3t 💡 Could you shake your eyes? Yes or no? 👀
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s); **subscribe arm:** pill (the pill test); **kind:** test (the topic test).
**The viewer's test:** shake your eyes side to side; cross them a little and try again.
**Answer line (spoken, starts 4.25 s):** "Can't? Your eyes have a parking BRAKE."
**The loop:** "...Blame your parents." → "Can you SHAKE your eyes?"; nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg): `SC.cover` (his friend's buzzing eyes, the hummingbird, CAN YOU / DO THIS?).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.00–10.47 | hook | his face close by the fire (head ~830 px, embers rising behind him): his eyes hop left... right... while his brows wiggle; "Can't?" a shake of the head, a sweat drop; "Your eyes have a" he looks down, trying to see his own eyes; "parking" the camera eases back and a car's handbrake lever slides in beside his face and ratchets up in four clicks while he stares at it; "BRAKE." the calipers clamp both irises, the lever slides away, the camera punches in, the (P) lamp lights; "Cross them" his pupils cross, STOP IF DIZZY; "try again" he strains and each yank is clamped back; the camera creeps toward his right eye |
| 10.47–14.53 | macro | the push goes on into the eye (16×): the caliper lets go, the iris JUMPS (a smear), it clamps again; (P) BRAKE ON |
| 14.53–17.53 | friend | across the fire, his friend with a mug, calipers on and a lamp on his beanie; twelve faces pop in, one lit green (1 IN 12); the camera pushes in; "go..." the calipers SPROING off and his eyes buzz (BZZZZ) |
| 17.53–18.57 | copy | the hero copies: "back" one slow hop, "forth" another, CLANK |
| 18.57–21.13 | buzz | the friend's eyes close behind his glasses, buzzing; a hummingbird flies in and stares; 15 A SECOND; it raises a brow |
| 21.13–25.87 | safe | the two by the fire: the friend buzzes again and grins, the hero claps (JUST A PARTY TRICK ✓); ON THEIR OWN?; a stethoscope pops round the hero's neck: SEE A DOCTOR |
| 25.87–29.77 | family | the friend holds up a framed photo: gran, mum and a kid, all buzzing; the camera pushes into it: RUNS IN FAMILIES |
| 29.77–32.43 | button | the hero holds up his own family photo; "Blame" he glares at it; "parents" the camera pushes into it: mum and dad with calipers and lit (P) lamps; CLUNK clunk (the silent pill plays over this) |
| 32.43–32.90 | loop | the hook at negative time: the last frame is frame 0's picture |

## Sound design

- **Beds:** the campfire (`fire_rumble`: its low rumble and its crackle above 5 kHz, under every shot but the eye
  close-up, where only the low is left), night air, crickets.
- **Hits:** a tiny tick at each of his hops; "Can't?" ... a downward "nuh-uh" slide; "parking" a handbrake's ratchet
  (top only), "BRAKE." ... krk, CLUNK; "a little..." boi-oing (crossed eyes); a clank at every yank (top only); in the
  eye: a hiss as the brake lets go, a tick for the jump, a clank as it clamps; twelve pops for the twelve faces;
  "go..." SPROING, then BZZZ (in the pause), the buzz going on above 5 kHz under the next lines; "forth," CLANK; the
  hummingbird's wings (above 5 kHz) and its chirp after "second."; a buzz and two claps after "Harmless..."; a heart
  monitor's beep-beep after "doctor."; glass on the photo frame; "Still can't?" a sad slide; "parents." CLUNK clunk.
- **Score:** the house groove at 112 BPM in F, a sneakier minor drive for the mechanism, sixteenth notes for the buzz,
  a low worried chord under "unless they shake on their own"; it drops out for every punchline.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. The gags sit at −16 to −24 dB in their pauses, with the voice at about −16.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Some people can make their eyes shake (oscillate) on purpose: voluntary nystagmus, or voluntary flutter | established | Zahn, "Incidence and characteristics of voluntary nystagmus", J Neurol Neurosurg Psychiatry 41(7):617–23 (1978), PMID 690639; Thomas, Dunn & Woodhouse, Case Rep Ophthalmol (2022), PMC9149443 |
| About 1 in 12: a survey found 8% of a college-age population could do it | one survey (said as "about", "seem to") | Zahn 1978; repeated by Tidsskriftet (Norwegian Medical Journal) 2019, "Troublesome eye movements" ("up to 8% of school children... use it as a party trick") |
| Back and forth about 15 times a second | established range (10–20 Hz; one case 13 Hz, reported peaks to 22–30 Hz) | Tidsskriftet 2019 (10–20 Hz); Thomas et al. 2022 (13 Hz average) |
| It is made of back-to-back quick jumps (saccades), with no slow drift | established | Thomas et al. 2022 |
| Eyes move in jumps, and between jumps a "brake" holds them still | established, simplified (pause neurons in the brainstem hold the jump generators off between saccades) | Thomas et al. 2022 (omnipause and burst neurons in the models); Zahn 1978 ("hold" mechanism) |
| Shakers "seem to let go" of that brake | a leading idea (hedged: "seem to") | Thomas et al. 2022 (proposed models: omnipause/burst neurons); Zahn 1978 |
| Crossing the eyes a little often sets it off | established (often, not always) | Thomas et al. 2022 ("often, but not always, triggered by convergent eye movements"); Tidsskriftet 2019 (it starts with a convergence movement, only with near focusing) |
| Harmless, and short (most last about 5 s, a few up to ~35 s) | established | Thomas et al. 2022 ("no relation to pathology", 4–35 s); Wikipedia "Nystagmus" (citing Tusa 1999) |
| Eyes that shake on their own need a doctor | established (pathological nystagmus lasts longer, slower, often with other signs) | Thomas et al. 2022 |
| It often runs in families | supported (hedged: "often") | Zahn 1978 (79% of those who could had relatives who could too); Neppert & Rambold, Strabismus (2006): three generations of one family |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

- **qa.py (final):** 18/18 PASS: 32.90 s (short arm), −14.04 LUFS, −1.75 dBTP after AAC, voice SNR mean 22.4 dB (min
  10.7), WER 4.1 % (brake→break twice: a homophone), answer at 4.25 s, "you"/"your" in the first words, nothing said
  about subscribing, the pill in/click/out at 2.40/1.70/0.87 s before the end, every word captioned.
- **Round 1:** every ship-bar item 8+ but retention (7): his deadpan face was held for 2.7 s under the answer line
  (4.3–7.0 s), a held reaction before 12 s, and the eyebrow wiggle (the hook's gag) sat under his hairline.
- **Round 2 (shipped):** a shake of the head on "Can't?", a look down at his own eyes on "Your eyes have a", a car's
  handbrake lever that slides in and ratchets up beside his face on "parking", the clamp and a punch-in on "BRAKE";
  brows lowered so the wiggle shows. Scores: test/hook/answer 9 · retention 8 · story 8 · show 9 · narration 8 ·
  comedy 9 · look 8 · safe area 9 · sound 8 · science 9 · packaging 8 · loop 8.
- **Rebuild:** `src/build.sh` from the cached takes reproduced the MP4 byte for byte (md5 81fff01f…).

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
