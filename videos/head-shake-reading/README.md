# Why Can You Read While Shaking Your HEAD? 👀 — Short (31 s)

**Final file:** [`head-shake-reading-short.mp4`](head-shake-reading-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 31.1 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`head-shake-reading.srt`](head-shake-reading.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in blue pyjamas, sitting up in bed at midnight, seen from his own phone (blind-spot's bedroom, `bed.js`): we
ARE the phone, so when he shakes it the whole frame swings and smears, and when he shakes his head "no" the frame holds
still and his eyes stay locked on us. His head is drawn again turning on a sphere (`shake.js`: a face projected onto a
ball, the pupils turned along a gaze in world angles), so the reflex is visible from outside: the face swings, the
pupils don't. A round window on his ear shows the inner ear as a little pink driver with three coloured loops for hair
at a steering wheel, two glowing cords to his pupils; inside it, the driver flat out with a stopwatch at 0.01 s; then
1948 in sepia (`ward.js`): him as the doctor in an iron hospital bed, his head jammed between two bars, and his own view
of a page that says HOLD STILL and jumps on every heartbeat. Jessica narrates, word-pop captions, the house bloom.
Cinematic lighting (`publish.json` "look": "cine"): the phone's cool light from the front with the bedside lamp as a
warm rim, soft pink inside the ear, the ward lit from its tall window on the left (`setLights` in `src/web/scenes.js`).

## The plan (written before the build; the rules of 15 Oct 2026)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: the 30 Oct 2026 23:30 IST slot, the PILL arm of
   the pill test, a TEST day-slot of the topic test). Script: 73 words; 31.1 s.
2. **The viewer's test:** shake the phone while reading the captions (they smear), then hold it still and gently shake
   your head (they stay sharp). Both are safe and take a second; "gently" is in the instruction.
   - **Hook formula: The Direct Address, as the test itself**: "Shake your phone. Blurry, right? Now gently shake your
     HEAD." Candidates: The Question ("Why can you read while shaking your head, but not your phone?": the title's own
     question, but nobody is doing anything yet), The Impossible Claim ("Your ears are moving your eyes right now.":
     strong, but the test would push the answer past 5 s; it became the answer line). Last three formulas: ear-rumble
     (Direct Address), neutron-star-teaspoon (The Question), octopus-hearts (The Impossible Claim): not three in a row.
   - **Answer** (starts 4.35 s): "Sharp again? Your EARS are steering your eyes."
   - **Button** (runs into the hook when the Short loops): "Still reading? Nod yes." → "Shake your phone..." (nodding
     while reading is the same test a new way: it stays sharp too).
3. **Why this topic tonight:** the first `[ ]` line of the Queue on a TEST slot; octopus-hearts' "Next up" comment and
   Reel caption already promise it. No hit in the last 3 days (Venus 14.0K is under five times the middle).
4. **Beats** (what the viewer is doing at each point of the 8–13 s rule): test (0–3.9, shaking the phone, then the
   head) → answer (4.3–8.1, still shaking the head; the window opens on his ear at 5.7, the cords on "steering") →
   "Keep going. Head goes right... your ear rolls your eyes LEFT." (8.4–12.8: still shaking; HEAD and EYES arrows round
   his head; at 10 s and 12 s the viewer's head is still moving) → "In a HUNDREDTH of a second!" (13.1–15.2, the driver
   flat out, 0.01 s) → "Shake the phone? Your ears feel nothing, so your eyes chase it. Too slow." (15.6–20.3: the viewer
   shakes the phone again; the driver dozes, the pupils swing a beat late, then cross) → the doctor of 1948
   (20.7–27.7) → button (28.2–30.1). No science word spoken: ears, eyes, steering, chase; the reflex's name is only in
   the description.
5. **One picture for the mechanism:** the ear holds both eyes on cords and turns them against every turn of the head.
6. **The caption's one-word question:** **"Which one blurred, head or phone?"**
7. **Ending:** the pill arm: the silent pill over the last 2.4 s (timeline_lib.py), his face above y 1050; the last
   0.5 s is the hook at negative time (the phone starts to swing again, his face goes back to the strain), so the last
   frame is frame 0's picture.
8. **World files:** `bed.js` (blind-spot's, with the head turn passed through), new `shake.js` (the turned head, the
   driver, the cords, the labels) and `ward.js` (1948).
9. **Cover:** `SC.cover`: his head turned, the pupils on you, the driver in the window, YOUR EARS / MOVE YOUR EYES.

## Narration (73 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Shake your phone. Blurry, right? Now gently shake your HEAD.
> Sharp again? Your EARS are steering your eyes.
> Keep going. Head goes right... your ear rolls your eyes LEFT.
> In a HUNDREDTH of a second!
> Shake the phone? Your ears feel nothing, so your eyes chase it. Too slow.
> A doctor who lost this read with his head jammed between bed bars. Even his heartbeat made the words jump.
> Still reading? Nod yes.

One take per block, plus one retake: "In a hundredth of a second." ended in a mumble ("second." 9 dB under the median in
the speech band); "In a HUNDREDTH of a second!" fixed it. 423 characters in all.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/aNBQO2osfZ4 | 30 Oct 2026 23:30 IST (scheduled; playlist Why Does Your Body Do That?; cover uploaded in Studio) |
| Instagram Reels | @curio_pulse_tv (Business Suite, Instagram only, cover set) | 2 Nov 2026 21:00 IST (scheduled) |
| Facebook Page | CurioPulse (fb.mjs, video 2328255954632658, ready/scheduled) | 2 Nov 2026 21:00 IST (scheduled) |

**Title:** Why Can You Read While Shaking Your HEAD? 👀

**Description:** in [`publish.json`](publish.json): the test, the inner ear's reflex in a hundredth of a second, the
eyes chasing a shaking phone about ten times slower, the doctor of 1948, then "Which one blurred, head or phone?" and
the subscribe line.

**Hashtags:** #Shorts #Science #Eyes #Brain #HumanBody #FunFacts
**Tags:** read while shaking head, why can i read while shaking my head, shake your phone blurry, why is text blurry when
phone shakes, vestibulo-ocular reflex, VOR, inner ear, eyes and ears, balance, eye reflex, body test, human body facts,
science shorts, try this, curiopulse
**Reels caption:** "Shake your phone. Blurry, right? Now gently shake your HEAD. 👀" … "Which one blurred, head or phone?"
then "Follow @curio_pulse_tv for the next one: a green dot that isn't there 🟢"
**"Next up" comment (posted by the pipeline once the Short is public):** a bonus (the reflex works in the dark, eyes
closed), "Next up: a green dot that isn't there 🟢 Subscribe so you don't miss it!", "Which one blurred, head or phone? 👀"
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: the 30 Oct 2026 23:30 IST slot.
**Subscribe arm:** pill (the pill test pill-2026-10): the silent pill 28.67–30.47 s; nobody says "subscribe".
**Topic kind:** test (the topic test kind-2026-10).
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (`src/cover.sh`).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.3 | hook | his face, close, seen from the phone: the frame swings and smears with the phone, his pupils chase it a beat late and he squints; on "Now" it stops; on "gently" he shakes his head "no" and the frame holds still, his eyes stay on us |
| 4.3–8.4 | ears | SHARP! pops; the camera eases out; on "EARS" a round window opens on his ear: the driver at the wheel (INNER EAR); on "steering" two cords zip out to his pupils; the wheel turns against every turn of his head |
| 8.4–13.0 | again | the camera pushes round his head; on "Head goes right..." he turns and holds, a yellow HEAD arrow over the top; on "rolls" a spark runs down the cords; on "LEFT." a cyan EYES arrow under his chin; then the dive into the window |
| 13.0–15.5 | speed | inside: the driver flat out, sweating, the wheel a blur, his two eyes on the cords at the top snapping the other way; a stopwatch and 0.01 s on "HUNDREDTH", FASTER THAN A BLINK on "second" |
| 15.5–20.7 | payoff | back in bed: the phone swings again; in the window the driver dozes (z z z), FEELS NOTHING; his pupils swing late and smear; on "Too slow." the shaking stops dead, his eyes cross, TOO SLOW! |
| 20.7–25.5 | weird | 1948 in sepia and old film: the ward, him in an iron bed with a doctor's head mirror, a book; 1948 stamped, A DOCTOR; on "jammed" two bars squeeze his head (clank) |
| 25.5–28.1 | weird | his view of the page: CHAPTER 3, HOLD STILL., jumping and smearing on every heartbeat, a heart thumping in the corner |
| 28.1–31.1 | button | back in bed: "Still reading?" a smug look; "Nod yes." he nods twice with his eyes on us and grins; the silent pill 28.7–30.5; the last 0.5 s is the hook again |

## Sound design

- **Beds:** the bedroom's room tone and one far cricket (top only); a warm throb inside the ear; the ward's quiet air and
  an old projector under 1948.
- **Hits:** an air swish on every swing of the phone and every swing of his head (top band, so they run under the
  words); a focus ding after "HEAD."; glints on SHARP; the window's pop; the cords zipping out; meep-meep from the driver
  after "eyes."; the wheel's clicks; a low whoosh on the turn; the spark down the cords; a zip as the eyes roll after
  "LEFT."; the dive; the stopwatch click on "HUNDREDTH" and a ding after "second!"; a snore after "nothing,"; a
  scratch as the shaking stops before "Too slow.", a waah after it; the 1948 stamp; a clank (low knock plus a ring above
  5 kHz) on "jammed"; three heartbeats with a page flap on each; a soft knock on each nod and a two-note "yes".
- **Score:** a jittery sixteenth-note groove for the shaking phone; silence for "Now gently shake your HEAD." (only the
  head swishes and the ding); a light groove for the answer, a minor drive for the steering, a flat-out 152 BPM groove
  inside the ear, the jittery groove again for the chase, an old upright piano (rag) under 1948, a light groove into
  the loop. The music drops for the ding, meep-meep, the zip, the stopwatch ding, "Too slow." and the "yes" notes.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP after
  AAC. The gags measured in mix.wav sit at −17 to −24 dB, the voice at −16.5.

## Science notes

Every claim in the script, how sure science is, and where it comes from.

| Claim | Status | Source |
|---|---|---|
| Shaking your head while reading keeps the words sharp; moving the page (or a thumb) at the same speed blurs them | established (a classic demonstration) | Scientific American, "Try This at Home: Let Your Ears Move Your Eyes" (a thumb at arm's length, head shaken about twice a second: sharp; the arm swung: blurry) |
| The inner ear's balance organs sense the head's turn and move the eyes the opposite way so the image stays still on the retina (the vestibulo-ocular reflex); it works even in the dark, with the eyes closed | established | Wikipedia, "Vestibulo-ocular reflex"; Scientific American (above) |
| It acts in about a hundredth of a second | established: latency about 7.5–10 ms in humans | Collewijn & Smeets, J Neurophysiol 2000 (mean 8.6 ms, repub.eur.nl/pub/9424); Aw et al. 1996 (7.5 ms yaw, high-acceleration impulses) |
| "Faster than a blink" (on screen) | established: a blink lasts about 100–400 ms | standard physiology; the reflex's ~0.01 s is far under it |
| A moving phone has to be seen first, then chased: the eyes' visual tracking starts about 100 ms after the movement, roughly ten times slower | established (open-loop pursuit latency ~100 ms) | Lisberger and colleagues' pursuit studies (e.g. monkey and human open-loop pursuit ~100 ms); Scientific American (the visual system is "too slow" for the fast swing) |
| A doctor who lost this reflex (to streptomycin, an antibiotic) could read in bed only with his head braced between two metal bars of the bed frame; even his pulse made things seem to move | established: his own published account | J.C. (John Crawford), "Living without a balancing mechanism", N Engl J Med 1952;246:458–460, reprinted Br J Ophthalmol 1964;48:357–360 (PMC505972); summarised in MedLink's bilateral vestibulopathy and ototoxicity reviews (a 30-year-old physician treated in 1948; braced his head between two metal bars to read; "even the cardioballistic effects of the pulse produced disturbing perceptions of motion") |
| 1948 (on screen) | established | the treatment year in the MedLink summaries; the account was published in 1952 |

## Ship review

Two QA rounds; `qa.py` 18/18 both times (31.07 s, −14.02 LUFS, −1.78 dBTP after AAC, voice SNR mean 21.7 dB with
none under 10 dB, WER 1.4 % (read→red, a homophone), the answer at 4.35 s, the pill 2.40 / 1.70 / 0.87 s before the end).

| # | Item | Round 1 | Round 2 |
|---|---|---|---|
| 1 | The test, the hook and the answer | 8 | 9 |
| 2 | Retention | 7 | 8 |
| 3 | Story | 8 | 8 |
| 4 | Show, don't tell | 8 | 9 |
| 5 | Narration | 8 | 8 |
| 6 | Comedy | 8 | 8 |
| 7 | Look | 8 | 8 |
| 7b | Safe area | 9 | 9 |
| 8 | Sound | 8 | 8 |
| 9 | Science | 9 | 9 |
| 10 | Packaging | 8 | 9 |
| 11 | The loop | 9 | 9 |

What changed in round 2: his right arm reaches out to the phone (we are the phone: the hand is pinned just past the
frame's bottom-left corner, so the arm swings with every shake of the phone), so frame 0 shows him doing the test; in
1948 he lifts the book on "read" and his head wobbles on "his head" until the bars clamp it on "jammed" (the wide shot
had held 2.4 s with only the camera moving); the page shot got a slow push and a bigger heart; the cover was restaged
closer with its words clear of the window. Before the render: the frame-0 blur was cut by half and frame 1 placed near
the end of a swing (sharp), the pupils' geometry fixed (they sat a little cross-eyed when looking at us), the far cord
routed over his brow so it never crosses the other eye, the ear window and the driver made bigger, the 1948 bars stopped
at his shoulders (they read as jail bars), FEELS NOTHING moved under the window. The rebuild from the cached takes gave
the same length and an identical mix.wav (the MP4 5 bytes apart: encoder timestamps).

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
