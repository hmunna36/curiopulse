# Why Is There a SAUSAGE Between Your Fingers? 🌭 — Short (34 s)

**Final file:** [`finger-sausage-short.mp4`](finger-sausage-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 34.2 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`finger-sausage.srt`](finger-sausage.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker on a night bus, tight, his two index fingertips touching under his chin; then the world through his own
eyes (his hands coming up from the bottom corners, the bus across the aisle) and the brain's control room from the
dominant-eye Short (two monitors, LEFT EYE and RIGHT EYE). Same narrator, captions, bloom and synthesized sound.
The look is the cinematic one (`publish.json` "look": "cine"): the bus is lit from its ceiling strip with a warm rim
from the street lamps behind, the brain's room by its monitors (`setLights` in `src/web/scenes.js`).

## The plan (written before any code)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: 2026-10-20 23:30 IST). Built: 74 words, 34.2 s.
2. **The test:** touch your index fingertips together near your eyes and look past them at the far wall: a little
   sausage floats between the tips. Close one eye and it is gone.
   - Hook (The Direct Address, as the test; the last three Shorts used Direct Address, Question, Direct Address):
     "Touch your fingertips together near your eyes, and look PAST them." Candidates checked against `hooks.md`:
     The Impossible Claim ("Your fingers are hiding a sausage. Tips together, near your eyes... look PAST them.":
     5+ s, the answer would land late), The Question ("Ever seen a floating sausage? Touch your fingertips...": a
     second sentence before the test). Picked from 6 auditioned takes of 4 wordings: 3.96 s.
   - Answer (starts 4.25 s): "That floating sausage? Congrats... you are seeing double."
   - Button: "It's been hiding sausages your whole life." It runs into the hook when the Short loops.
3. **Claims:** the table below.
4. **Beats:** hook 0–3.9 · answer 4.2–8.1 · each eye from its own side 8.6–11.5 · look past, the views split
   11.6–14.7 · the brain stacks them anyway, two fingertips overlap into one sausage 14.9–19.9 · payoff: close one
   eye, sausage gone 20.4–23.2 · the weirdest fact: everything behind your phone is double, your brain doesn't
   mention it 23.9–29.1 · button 30.3–33.2 · tail and loop to 34.2. Every mechanism line names the viewer's own
   fingers or the test; no science word is spoken anywhere.
5. **Caption question:** "Did you see it?"
6. **No Subscribe pill; the last 0.4 s is the hook at negative time** (his hands rising into frame 0).

## Narration (74 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Touch your fingertips together near your eyes, and look PAST them.
> That floating sausage? Congrats... you are seeing double.
> Each eye sees your fingers from its own side. Look past them, and the two views split.
> Your brain stacks them anyway... and two fingertips overlap into one sausage.
> Close one eye... Sausage gone.
> *[curious]* Right now, everything behind your phone is double... your brain just doesn't mention it.
> It's been hiding sausages your whole life.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (filled in after the upload) | 2026-10-20 23:30 IST |
| Instagram Reels | queued by the API | the next free 18:30 / 21:00 IST slot after the YouTube release |
| Facebook Page | scheduled by `fb.mjs reel` | the same slot as Instagram |

**Title:** Why Is There a SAUSAGE Between Your Fingers? 🌭

**Description:** see `publish.json` (the test, the mechanism in everyday words, the 1928 name, "Did you see it?", then
the subscribe line and "Next up: why you can't tickle yourself 🤭").

**Hashtags:** #Shorts #Science #OpticalIllusion #Brain #Eyes
**Tags:** floating finger sausage, finger sausage illusion, floating finger illusion, sausage between fingers, optical
illusion, illusion you can try, double vision, binocular vision, seeing double, eyes, brain, human body, science
shorts, fun facts, curiopulse
**Reels caption:** "Touch your fingertips together near your eyes... now look PAST them. 🌭" … "Did you see it?" … Follow line
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why you
can't tickle yourself (try it) 🤭 Subscribe so you don't miss it! / Did you see it? 🌭
**Playlist:** Your Brain Is Weird
**Length arm:** short (30–35 s, every Short since 16 Oct 2026), from `yt.mjs next-slot`: slot 2026-10-20 23:30 IST.
**The viewer's test (rules of 15 Oct 2026):** fingertips together near the eyes, look past them: the sausage floats
between the tips; close one eye and it vanishes.
**Answer line (spoken, starts by 5 s):** "That floating sausage? Congrats... you are seeing double." at 4.25 s.
**The loop:** "...your whole life." runs into "Touch your fingertips together..."; no Subscribe pill, nobody says
"subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover`: his view with the sausage outlined, SEE THE / SAUSAGE?

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–2.7 | hook | the night bus, tight on him (head ≈ 420 px): both fists up under his chin, the index fingertips closing to touch (a little "boop" on "together"), his eyes crossed down at them |
| 2.7–8.5 | pov | his own view: the bus across the aisle blurred and his fingers sharp; on "PAST" the focus pulls to the far side, his fingers blur and go double, and a sausage floats between the tips over the dark windows (outlined in yellow on "floating"); a deadpan party popper after "Congrats..."; on "seeing double" the two copies tint teal and orange with LEFT EYE / RIGHT EYE tags on the ghost gaps; the passengers across stare back |
| 8.5–20.4 | room | back on his face, a round window opens on his forehead and the camera dives in: the brain under two monitors, LEFT EYE and RIGHT EYE, each showing his fingers from its own side; "look past them": each eye's fingers slide further apart (arrows); "stacks them anyway": the brain slams a STACK button and the monitors run together on their rail, CLUNK, into one BOTH EYES screen with the double fingers; the shrug; the push in as the two fingertips' overlap lights up: SAUSAGE! |
| 20.4–22.1 | wink | the bus: he shuts one eye; the granny beside him stares, gasps and scoots away down the bench |
| 22.1–23.8 | gone | his view with two eye icons: one shuts, one copy of the fingers is left, and the sausage goes POOF |
| 23.8–30.2 | phone | his view of his phone (it plays this Short), sharp; the bus behind it goes double and soft (two of everyone), tinted teal/orange on "is double"; the brain in a round window, sweating, finger to its lips: SHH! |
| 30.2–33.8 | button | the brain at its desk pulls open a drawer marked DOUBLES, stuffed with finger sausages; one springs out with a face; the brain shoves it shut: SLAM! |
| 33.8–34.2 | loop | the hook at negative time: his hands rise into frame 0 |

## Sound design

- **Beds:** the bus (`bus_hum`, all under the speech band) on every bus shot; a low room hum in the brain's room.
- **Hits:** a high flick as the hands land on frame 0; two glints on the touch; the focus pull as a ratchet above
  5 kHz; a bloop when the sausage appears (in the gap after "them."); a cork pop and a short party horn after
  "Congrats..."; screen glints; a whoosh as the views split; a boing after "split."; the STACK click, the rail ratchet
  and a low CLUNK; a shrug "wah" after "anyway..."; a shimmer on "overlap"; a piano ta-da after "sausage."; the wink
  sparkle, a bench squeak and a scoot; the poof, then a wah-wah after "gone."; ding-ding after "double..."; a blip
  for the brain's window and a SHH after "it."; the drawer creak, the spring and the SLAM.
- **Score:** a light pizzicato/marimba groove in his view (after the sausage appears), fuller in the brain's room, a
  sneaky walk for the phone, a thin one for the drawer; it drops out for "Congrats...", the CLUNK, the boing, the
  shrug, the ding-ding and the slam, and stops before the loop.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. Gags measured in `mix.wav` against the voice (median −16.1 dB over words): −18.5…−23 dB in their gaps.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| Hold the index fingertips together (almost touching) 20–30 cm from the eyes, look past them at the background: a "sausage" floats between them; its length changes with the gap | established (a classic demonstration) | Michael Bach, Optical Illusions: the "Frankfurter illusion" page (michaelbach.de/ot/sze-Frankfurter); W. L. Sharp, "The floating-finger illusion", *Psychological Review* 35(2):171–173 (1928) |
| Each eye sees the fingers from a slightly different position; looking at something far, the near fingers land on non-matching spots in the two eyes, so they are seen double | established (physiological diplopia) | Bach (as above); GPnotebook, "Physiological diplopia"; Wikipedia, "Diplopia" (looking at an object behind another, the front one doubles) |
| The sausage is where the doubled fingertips overlap: one eye's fingertip lies on the other eye's, so both eyes report a finger there, with a fingertip at each end; on both sides of it only one eye sees a finger (the gaps) | established geometry; Bach adds that at the fingertips the eyes' conflicting views compete (rivalry/suppression) | Bach (double images plus rivalry); the drawing in `src/web/fspov.js` computes it the same way (each eye's copy offset, the overlap solid) |
| Close one eye and the sausage disappears | established | classroom demonstrations of the illusion (e.g. "close one eye or the other and the illusion will disappear"); follows from the above |
| Everything nearer or farther than what you look at is seen double, all the time, and normally not noticed: "everything behind your phone is double" | established (physiological diplopia is "present in normal binocular vision", suppressed and unnoticed unless you look for it) | GPnotebook / Primary Care Notebook, "Physiological diplopia"; Bach |
| "It's been hiding sausages your whole life" | the joke on the claim above | — |

Numbers on screen: none. The 1928 name is in the description only.

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

- **Round 1** (qa.py 18/18, one warning): retention 7.5: the phone shot sat still for its last three seconds and the drawer
  stood open with nothing new; "AND LOOK PAST THEM" was on screen 0.08 s before the first cut.
- **Round 2** (qa.py 18/18, no warnings; the MP4 is build.sh's, from the cached takes): the cut to his view moved to "and";
  the far bus snaps back to one picture as the brain says "shh"; the phone bobs in his hand and the push is stronger; the
  brain hides the drawer of sausages under its arms, looks at us, then shoves it shut; the cover pushed in on the sausage.
  Scores: test/hook/answer 8.5 · retention 8 · story 8.5 · show 8.5 · narration 8 · comedy 8 · look 8 · safe area 8.5 ·
  sound 8 · science 9 · packaging 8.5 · loop 8.5.
- qa.py: 34.17 s, −14.02 LUFS, −1.75 dBTP, voice SNR mean 24.5 dB (min 10.4), WER 0.0 %, answer at 4.25 s.
- Voice: 332 characters for the six other takes, about 570 for the auditions (hook: 4 wordings, 6 takes; answer: 2).

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
