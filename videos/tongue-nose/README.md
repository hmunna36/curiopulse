# Why Can't Your Tongue Touch Your NOSE? 👅 — Short (32 s)

**Final file:** [`tongue-nose-short.mp4`](tongue-nose-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 32.2 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`tongue-nose.srt`](tongue-nose.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in blue pyjamas at his bathroom mirror (the camera is the mirror: blocked-nostril's `mirror.js`), jaw dropped,
tongue out and curled up at his nose, a little red summit flag on the tip of it, a hair short; then his head from the
side as glass (`side.js`): the tongue tied down at the front and the back, no bone inside, rings squeezing it skinny.
Jessica narrates, word-pop captions, the house bloom.
Cinematic lighting (`publish.json` "look": "cine"): the morning bathroom lit from its window on the left, a soft diagram
light with a cool rim for the glass head, a flat chart light for the faces (`setLights` in `src/web/scenes.js`).

## The plan (written before the build)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: the 24 Oct 2026 23:30 IST slot). 72 words → 32.2 s.
2. **The viewer's test:** stick your tongue out and try to touch the tip of your nose with it, right now; about one in
   ten can. Anyone can try it in two seconds, it fails in a funny way, and everyone has a "made it / didn't" to say in
   the comments. Hook formula: **The Question** ("Can you touch your nose with your tongue? Try it."), the exact
   question people type into search; candidates: The Direct Address ("Stick out your tongue and touch your nose.": a
   third Direct Address in a row after circle-line and voice-deeper), The Statistic ("Nine out of ten of you can't do
   this...": 4+ s before the test starts). The answer is a metaphor: "Close, right? Your tongue's on a LEASH."
3. **Why this topic tonight:** the Vulcan-salute Reel went out on Instagram on 22 Oct 20:00 IST and had 823,921 views
   by 24 Oct 00:05 (the next Reels: 1.6K and 3.1K): a hit by the rule of `story.md` §4, so its closest kin goes first.
   The tongue-to-nose test is the same kind of test ("can you make this part of you do it?"; only a few can). The
   mirror topic, which circle-line's Reel caption already promises as "the next one", stays straight after it.
4. **Hook sentence:** "Can you touch your nose with your tongue? Try it." (0.11–2.61 s; on frame 0 his tongue is
   already up at his nose, a hair short of the flag; on "Try it." he looks up at us, tongue still out, and lunges).
   **Answer (starts 3.13 s):** "Close, right? Your tongue's on a LEASH." (a red dog leash clips on under his tongue and
   yanks it back).
   **Button:** "Made it? Show-off. Didn't? One more try." → the loop: "Can you touch your nose with your tongue?"
5. **Beats:** the test (0–2.6) → close; on a leash (3.1–6.4) → lift your tongue: feel the tug underneath (6.8–9.1) →
   tied down, front and back (9.3–11.4, the side view) → no bones inside (11.8–13.0) → it stretches by squeezing itself
   skinny (13.3–16.0) → that's why yours went pointy (16.3–18.6) → only long, stretchy tongues make it: one in ten
   (18.9–22.7) → doctors named it; half of people born super-bendy can (23.4–26.9) → made it? show-off; didn't? one
   more try (27.5–31.2). No science word is spoken: leash, strap, tied, squeezing, skinny, pointy, super-bendy; the
   name is a label (GORLIN'S SIGN).
6. **Every mechanism line points back to the test:** "Lift your tongue... feel that tug underneath?" is a second, tiny
   test; "That's why yours went POINTY" is what the viewer just saw in their own mirror or felt.
7. **The caption's one-word question:** **"Did your tongue reach? Yes or no?"**
8. **Ending:** no pill; on "One more try." his tongue goes back up and the last 0.45 s is the hook at negative time:
   the last frame is frame 0's picture.
9. **Cover:** `SC.cover`: him straining, the tongue a hair short of the flag on his nose; ONLY 1 IN 10 / CAN DO THIS.

## Narration (72 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Can you touch your nose with your tongue? Try it.
> Close, right? Your tongue's on a LEASH.
> Lift your tongue... feel that tug underneath? It's tied down, front and back.
> No bones inside, so it stretches by squeezing itself skinny. That's why yours went POINTY.
> Only long, stretchy tongues make it... about one in ten.
> *[excited]* Doctors even named it! Half of people born super-bendy can.
> Made it? Show-off.
> Didn't? One more try.

One take per block, no retakes (419 characters). v3's alignment put "It's tied down, front and back." up to 0.6 s early
(the speech-band envelope and whisper agree); `make_timeline.py` re-times those six words from the take's own bursts
of speech-band energy, and "One" of "One more try." the same way.

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/N1vgcsMvZjI | 24 Oct 2026 23:30 IST (scheduled; cover.jpg set again in Studio's vertical slot) |
| Instagram Reels | — | 27 Oct 2026 21:00 IST (scheduled in Business Suite, Instagram only, cover.jpg as the cover; read back in Content → Scheduled) |
| Facebook Page | — | 27 Oct 2026 21:00 IST, scheduled by the Page API (`fb.mjs reel`, video 1408682721153792: ready, scheduled) |

**Title:** Why Can't Your Tongue Touch Your NOSE? 👅

**Description:** see `publish.json` (the story part ends on "Did your tongue reach? Yes or no?", then the subscribe line).

**Hashtags:** #Shorts #Science #Tongue #HumanBody #BodyTest #FunFacts
**Tags:** tongue touch nose, can you touch your nose with your tongue, gorlins sign, tongue test, lingual frenulum, …
**Reels caption:** "Can you touch your nose with your tongue? Try it right now. 👅" … "Did your tongue reach? Yes or no?" … the Follow line (next: why you can't see your own eyes move in a mirror)
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: why you can't see your own eyes move in a mirror 👀 Subscribe so you don't miss it! / Did your tongue reach? Yes or no? 👅
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: 2026-10-24T23:30:00+05:30.
**The viewer's test (rules of 15 Oct 2026):** stick your tongue out and try to touch your nose with it, while watching.
**Answer line (spoken, starts at 3.13 s):** "Close, right? Your tongue's on a LEASH."
**The loop:** "Didn't? One more try." runs into "Can you touch your nose with your tongue?"; no pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (rendered by `src/cover.sh`).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–9.4 | hook | From the mirror, tight (his head ≈ 760 px): jaw dropped, tongue up at his nose (we see its underside: two blue veins, the fold, the strap), a little red flag on his nose tip, eyes crossed down at it, a sweat drop; little lunges, a hair short. "Try it." he looks up at us, then the big lunge; "Close" a yellow measuring mark between tip and nose; "Your tongue's" a red leash clips on under his tongue (snick, a dog tag's jingle); "LEASH" it yanks, the tongue springs back, his eyes go wide, the camera bumps; "Lift your tongue" it goes back up and the camera pushes into his mouth; "tug" the leash fades into the real strap, which glows and pulls tight; "underneath" a round window opens on his cheek with the side view inside, and the camera dives through it |
| 9.4–16.3 | side | His head from the side as glass (hair, eye, ear, a pyjama collar): the tongue out and curled up at his nose; "tied down" the camera pulls back to the whole head; FRONT: the strap under the tongue and the fan of muscle from the inside of his chin light up; BACK: the cords to the little bone in his throat; "No bones" a dashed bone in the tongue, struck out (0 BONES); "squeezing itself skinny" yellow rings tighten along it, it gets thinner and longer toward the nose (LONGER) and the ties pull tight: still short |
| 16.3–18.9 | pointy | Back at the mirror, close: his tongue narrows to a point as he strains; a dashed outline of how wide it was and two arrows squeezing in |
| 18.9–27.4 | crowd | A board of ten faces, all trying: most fall short, one reaches (a spark on the nose, a tick): 1 IN 10; "Doctors" a clip snaps on the board, GORLIN'S SIGN; "Half" the faces flip over to ten more, BORN SUPER-BENDY, rubbery; "can" five of them reach: 5 IN 10 |
| 27.4–31.7 | button | The mirror: "Made it?" eyebrows up at us, tongue in; "Show-off." a suspicious squint; "Didn't?" kind; "One more try." the jaw drops and the tongue goes back up, the camera pushes to frame 0's framing |
| 31.7–32.2 | loop | The hook at negative time: frame 0's picture |

## Sound design

- **Beds:** the bathroom's room tone (under 230 Hz) in the mirror shots; a low hum inside the glass head; a quiet room for
  the board; a faint low tremble while he strains, on the picture's tremble clock (`loopW`), so the loop is seamless.
- **Hits:** a wet blep on frame 1 and on his lunges (only the edges under words); a wee-up slide on the big lunge; a tiny
  strained squeak after "right?"; the leash: a clip's snick, a dog tag's jingle (top only), a yank and a boing after
  "LEASH."; a creak as he lifts; a rope twang after "down," and after "back."; a bonk after "inside," (no bone); soft
  squelches as the rings squeeze (top only); a boi-oing slide after "skinny."; a ting after "POINTY."; pops as ten faces
  appear; a ding after "make it..." and "ten."; a card flip; five boings after "can."; a "hm?" and a "hmph" slide around
  "Show-off."; a blep into the loop. Gags measured in `mix.wav` (`src/qc_gags.py`): −18 … −25 dB in their gaps, the
  narration at −16.
- **Score:** a bouncy pizzicato groove (112 BPM) under the test; a sneaky minor groove under "Lift your tongue"; a
  held, curious chord inside the head; a drive for the squeeze; a bright groove for the board with a riser into "can";
  the hook's groove again from "Didn't?" into the loop. It stops for "Close, right?... LEASH.", the yank, "make it...",
  "one in ten", "can." and "Made it? Show-off."
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC (music bus −14, effects bus −13, music ducked 74 %).

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| About 1 in 10 people can touch the tip of their nose with their tongue ("8–10 % in the normal population") | established as a clinical figure (often quoted; no large survey behind it) | Létourneau, Pérusse & Buithieu, "Oral manifestations of Ehlers-Danlos syndrome", J Can Dent Assoc 2001;67:330–4, as cited by Kaurani et al., "Ehlers Danlos Syndrome – A Case Report", J Clin Diagn Res 2014;8(3); Kassam & Cascarini, "Gorlin's sign", BMJ 2014;348:g1786 (≈10 %) |
| About half of people with Ehlers-Danlos syndrome (inherited, super-stretchy joints and skin) can ("born super-bendy") | established as a clinical figure | the same three sources ("approximately 50 %") |
| Doctors have a name for it: Gorlin's sign (after the pathologist Robert J. Gorlin) | established | Kassam & Cascarini, BMJ 2014; Wikipedia "Gorlin sign" (shown as a label only, never said) |
| The tongue has no bone; it gets longer by contracting the muscles that run across it and up-and-down, which makes it thinner (a "muscular hydrostat"); so a reaching tongue goes narrow and pointy | established (the textbook model of protrusion; whether it holds in every detail of swallowing is debated: Orsbon et al., Sci Rep 2020) | Kier & Smith, "Tongues, tentacles and trunks", Zool J Linn Soc 1985;83:307–24; Sanders & Mu, "A three-dimensional atlas of human tongue muscles", Anat Rec 2013 (PMC3687025) |
| It is tied down at the back: its root to a small bone in the throat (the hyoid) and to the jaw (the fan of muscle from the inside of the chin, genioglossus) | established anatomy | Sanders & Mu 2013; standard anatomy texts (genioglossus: origin at the genial tubercles of the mandible, lowest fibres to the hyoid) |
| ...and underneath at the front by a strap (the lingual frenulum), a fold of the fascia of the floor of the mouth that rises and tightens when the tongue is lifted; a short one (tongue-tie) limits lifting and sticking out | established | Mills, Geddes, Amirapu & Mirjalili, "Understanding the Lingual Frenulum", Int J Otolaryngol 2020 (PMC7391099) |
| Only long, stretchy tongues make it | our plain reading of the above (reach depends on how far the tongue can extend; the stretchy-tissue link points to stretch) | — |

Left out: the claim that people with Ehlers-Danlos often lack the strap (De Felice et al., Lancet 2001): later studies
disputed it. The world-record tongue (Nick Stoeberl, 10.1 cm from the tip to the middle of the closed top lip, Guinness
World Records 2012): no room in 32 s.

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

Two rounds (`.work/qa/ship-review.md`, not committed; the summary is here).

- **Round 1:** qa.py 18/18 with one warning: the cut into the side view (9.40 s) fell inside the caption "IT'S TIED / DOWN,",
  which flashed for 0.12 s and left 9.4–10.65 s uncaptioned (retention 7.5). Fix: the side shot starts just before "It's"
  (9.27 s) and the dive starts 0.18 s earlier.
- **Round 2 (shipped):** qa.py 18/18, no warnings: 32.17 s, −14.02 LUFS, −1.76 dBTP, voice mean 26.3 dB (min 10.4), WER 0.0 %,
  the answer at 3.13 s. Ship bar: test/hook/answer 8.5 · retention 8.5 · story 8.5 · show 8.5 · narration 8 · comedy 8 ·
  look 8 · safe area 9 · sound 8.5 · science 9 · packaging 8.5 · loop 9.
- Built before the first full render (stills): the tongue redrawn twice (a pink blob in the mouth → a dropped jaw, a longer,
  narrower tongue over the upper lip with the veins, the fold, the strap and a lighter tip), strain marks that read as cat
  whiskers replaced by a sweat drop, the side view reframed to show his whole head first, the chin fan lit with FRONT (it
  anchors at the front of the jaw) and only the cords to the throat bone with BACK, the faces made larger and the misses
  made clearly short, the effort rumble cut down (it was the loudest thing on the effects bus and pushed every gag down).
- Rebuild: `src/build.sh` in a fresh work folder gave a byte-identical MP4, timeline.json, mix.wav and SRT. About 3.8
  minutes a render.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
