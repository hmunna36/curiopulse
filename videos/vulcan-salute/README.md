# Why Is the Vulcan Salute So HARD? 🖖 — Short (31 s)

**Final file:** [`vulcan-salute-short.mp4`](vulcan-salute-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · 31.4 s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`vulcan-salute.srt`](vulcan-salute.srt). Cover: [`cover.jpg`](cover.jpg).

The hiker in burgundy pyjamas, at night in his living room, tries the Vulcan salute at the TV; the same rig, narrator
(Jessica), word-pop captions and bloom look as the other Shorts. The closest kin of the ring-finger hit (16 Oct 2026).
Cinematic lighting (`publish.json` "look": "cine"): the TV in front of him is the key, cool and flickering, the floor
lamp far left behind him the warm rim; the brain's room and the lab are lit by their screens; the 1960s studio by its
lamps from above (`setLights` in `src/web/scenes.js`).

## The plan (written before the build)

1. **Length:** short arm, 30–35 s, 66–76 words (`yt.mjs next-slot`: the 20 Oct 11:30 IST slot, "short"). 75 words, 31.4 s.
2. **The test:** split your fingers between the middle and ring fingers, two and two (the Vulcan salute). Many people
   can't, or the wrong finger goes.
   - **Hook (formula: The Direct Address, the instruction itself; `reference/hooks.md`):** "Try the Vulcan salute: split
     your fingers, two and TWO." The first sentence names the title's salute; "your" is word 6.
   - **Answer (starts at 4.55 s):** "Can't? Your middle and ring fingers are holding hands... under your skin."
   - **Button (runs into the hook):** "Using your other hand now, aren't you?" → "Try the Vulcan salute..."
   - Other candidates: The Question ("Can you do the Vulcan salute? Split your fingers..."), The Impossible Claim ("Two of
     your fingers are holding hands. Try the Vulcan salute."). The Direct Address won: the ring-finger hit used it, and
     the instruction is the test itself.
3. **Claims:** see Science notes.
4. **Beats** (≈ 2.15 words/s): hook 0–4.1 · answer 4.55–10.1 · cords + strap 10.5–13.1 · brain 13.4–15.9 · lab 16.4–19.7 ·
   "dead last" 20.0–22.0 · the weirdest fact 22.6–27.5 · button 28.3–30.3 · the loop 31.0–31.4. Every mechanism line points
   at the viewer's own fingers; no science word is spoken (the tendons are "cords", the junctura is "a little strap").
5. **Picture, sound, caption per beat:** the shot table below.
6. **No Subscribe pill:** the button shot ends clean; he lets go and the fingers spring back together.
7. **The loop:** the last 0.4 s are the hook at negative time (`SC.loop`): palm to us, fingers together, the tongue out;
   the cut to frame 1 is one move.
8. **World files:** new `room.js` (the living room seen from the TV, the hero with his own arms, the hand at his wrist),
   `hand.js` (the raised hand in 2D: spread, the salute, the wrong splits, the turn, glass with cords and the strap, faces
   on the nails, a sensor glove, the helping hand); borrowed `brainroom.js` (two-noses' fingermap.js: the brain's room and
   `erBrain`); in `scenes.js` the lever panel, the lab monitor, the 1960s studio, the old TV camera, the clapperboard.
9. **Cover:** a frame of its own (`SC.cover`): the salute done, his strained face, an arrow into the V, "CAN YOU?".
10. **The caption's question:** "Can you split your fingers?"

## Narration (75 words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> Try the Vulcan salute: split your fingers, two and TWO. · Can't? Your middle and ring fingers are holding hands...
> under your skin. · Their cords are tied together by a little strap. · And your brain usually moves them as a team. ·
> In lab tests, they're the worst at moving alone. · The ring finger? Dead last. · Even Star Trek actors reportedly set
> their fingers with the other hand... off camera. · Using your other hand now, aren't you?

Takes: the answer is seed 23 and the button seed 37, picked from three auditions each for their last words in the speech
band ("skin." and "you?" held up best); the team block was re-taken once (the first ran at 252 wpm).

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | (filled in after the upload) | 20 Oct 2026 11:30 IST |
| Instagram Reels | (the API queue: GitHub Actions publishes it) | (filled in after the upload) |
| Facebook Page | (`fb.mjs reel`) | the same slot as Instagram |

**Title:** Why Is the Vulcan Salute So HARD? 🖖

**Description:** in `publish.json` (ends on "Can you split your fingers?", then the subscribe line and "Next up: the floating
finger sausage").

**Hashtags:** #Shorts #Science #VulcanSalute #HumanBody #FunFacts
**Reels caption:** "Try the Vulcan salute: split your fingers, two and two. 🖖 … Can you split your fingers?" then the Follow line
**"Next up" comment (posted by the pipeline once the Short is public; pinning is the user's tap):** Next up: the floating
finger sausage you can make right now 🌭 Subscribe so you don't miss it! / Can you split your fingers? 🖖
**Playlist:** Why Does Your Body Do That?
**Length arm:** short (30–35 s), from `yt.mjs next-slot`: 31.4 s.
**The viewer's test (rules of 15 Oct 2026):** split the fingers two and two; most feel the ring finger follow the middle one.
**Answer line (spoken, starts at 4.55 s):** "Can't? Your middle and ring fingers are holding hands... under your skin."
**The loop:** "Using your other hand now, aren't you?" runs into "Try the Vulcan salute..."; no Subscribe pill, nobody says "subscribe".
**Cover:** [`cover.jpg`](cover.jpg), `SC.cover` (src/cover.sh).

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–4.5 | hook | His hand up beside his face, palm to us, tight (frame 0: head ≈ 460 px, hand ≈ 600 px), tongue out, straining. "split your fingers": all four splay (jazz hands, sproing); "two": the little finger goes alone (NOPE, buzzer); "and TWO": the ring finger follows the middle (3 + 1), sweat; bonk, they give up |
| 4.5–10.4 | hook (on) | "Can't?" he turns the hand round to look at its back (whoosh); the middle and ring fingers glow orange and yellow as they are named; faces pop on their nails, they lean together, a heart; "under your skin": the back of the hand turns to glass from the knuckles down (glints): four cords, and between the middle and ring cords a strap made of two little hands holding |
| 10.4–13.3 | cords | Closer on the glass hand: the cords pluck; "tied together": he tries again and the strap drags the ring cord after the middle one; STRAP tag; twang |
| 13.3–16.3 | brain | The camera goes up to a round window on his forehead and through it: the brain's room; on its screen his hand; four levers, MIDDLE and RING taped together; the brain pulls one, both go, the two fingers on the screen move as one; TEAM on the tape |
| 16.3–22.5 | lab | A lab monitor: MOVE ONE FINGER ALONE (Häger-Ross & Schieber, 2000); his gloved hand live: the ring finger wiggles and the middle and pinky move with it (red marks); the ranking pops in: thumb, index, pinky with medals, middle 4th and ring 5th go red (bwomp); "The ring finger?" the camera goes in on its row (hmm?); "Dead last.": the ring finger's nail goes X-eyed and a tombstone, RIP, pops up on its row (a sad slide) |
| 22.5–28.3 | studio | A 1960s TV studio: TAKE 27 on a clapperboard; him in a silver costume, straining; an old studio camera (TV-1, red light on) and its dashed frame round his head and hand, REC; "set their fingers": his other hand comes up from below the frame and pulls the two fingers over: the V (click); "off camera": the hand ducks out under the frame line, the V shines on camera (ding)... and creeps shut (deflating slide) |
| 28.3–31.0 | button | Back at the TV, close: caught holding the V with his other hand, eyes on us, sweat; a sheepish grin on "aren't you?"; he lets go and the fingers spring back together (boing) |
| 31.0–31.4 | loop | The hook at negative time: palm to us, fingers together, the tongue comes out: frame 1 |

## Sound design

- **Beds:** the living room (low room tone, a faint TV hiss above 7 kHz); a low hush inside his head; the lab's fans; the
  studio, with the old camera's motor hum (100/200 Hz). All under the speech band.
- **Hits:** knuckles straining on frame 0; sproing (jazz hands); a buzzer (the little finger alone); bonk (they give up);
  a whoosh (he turns the hand); glints as the two fingers light up, faces pop and the skin turns to glass; two marimba
  notes for the heart; plucks for the cords; a stretch above 5 kHz under "tied together"; twang (the strap); the dive;
  low clunks for the levers; ta-da for TEAM; the monitor's beep; the glove's sensors (above 5 kHz); glints as the ranking
  pops in; bwomp (the worst two); "hmm?"; a low thud and a sad slide for "dead last"; the clapper (edges only, it sits on
  "Even"); a rustle and a stretch as the other hand prises the fingers over; a click (the V); a ding (on camera); a
  deflating slide; a record scratch into the button; a whoosh and a boing as he lets go; knuckles straining into the loop.
  `src/qc_gags.py` measures each gag in its pause: −17.3 … −21.5 dB against −16.2 for the voice.
- **Score:** none under the hook and its jokes; a light pizzicato/marimba groove (110 BPM, A minor) from "Your middle"
  through the brain; half time in the lab; a retro groove in D minor in the studio; thin under the button; silent for the
  heart, the twang, TEAM, "dead last", the perfect V and the button's last beat into the loop.
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, music bus −14 with a 0.74 duck, effects bus
  −8, −14 LUFS, true peak −1.9 dBTP before AAC. `qc_audio.py`: no word under 10 dB SNR in the speech band.

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| The ring finger is the least independent finger, and the middle finger is the next least: asked to move one finger at a time, people moved the neighbours too (individuation index, right hand: thumb 0.98, index 0.98, little 0.94, middle 0.94, ring 0.91). The ranking on screen is that order, with no numbers (the task was bending one finger, not spreading) | established | Häger-Ross C, Schieber MH. Quantifying the independence of human finger movements. J Neurosci 2000;20(22):8542–50 (PMC6773164) |
| The cords on the back of the hand (the tendons that straighten the fingers) are joined by bands, the juncturae tendinum; the band between the middle and ring tendons is the commonest kind in that web space | established | von Schroeder HP et al. 1990 classification, via the juncturae tendinum review literature and the 2015 meta-analysis of 19 cadaver studies (PMC4606223); Wikipedia "Juncturae tendinum" |
| Part of the coupling is mechanical (tendon connections, shared muscles) and part is the brain: the nerve cells that drive different fingers get "considerable shared central input" | established (as a cause of coupling in general; nobody has measured the salute itself) | Häger-Ross & Schieber 2000 (discussion); Schieber & Hibbard, Science 1993 |
| The salute splits the hand between the middle and ring fingers | established (it is how the gesture is made) | Wikipedia "Vulcan salute" |
| Some actors on the original series reportedly set their fingers with the other hand off screen before raising the hand into frame | reported, not documented in a production source: said with "reportedly" | Wikipedia "Vulcan salute" ("reportedly had to position their fingers off-screen with the other hand"); The Take; a Star Trek III trivia entry (fishing line round Shatner's fingers: not used) |
| Leonard Nimoy took the gesture from the Jewish priestly blessing (Birkat Kohanim) he saw as a boy (description only) | established (his own account, I Am Not Spock, 1975) | Wikipedia "Vulcan salute"; startrek.com; The Canadian Jewish News |
| How many people can't do the salute | unknown: nobody has counted it, so no number is given | — |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

**One round** (20 Oct 2026): `qa.py` 18/18 PASS: 31.43 s (short arm), −14.03 LUFS, −1.79 dBTP, voice 25.9 dB mean SNR in the
speech band (0 % of content words under 6 dB, min 15.6), WER 0.0 % over 75 words, the answer at 4.55 s, "your" as word 6,
no "subscribe", no pill, 26.6 MB.

| # | Item | Score |
|---|---|---|
| 1 | The test, the hook and the answer | 9 |
| 2 | Retention | 8 |
| 3 | Story | 9 |
| 4 | Show, don't tell | 9 |
| 5 | Narration | 8 |
| 6 | Comedy | 9 |
| 7 | Look | 8 (the studio set is plain; the lab has no hero in it, his gloved hand on the screen stands in) |
| 7b | Safe area | 9 |
| 8 | Sound | 9 |
| 9 | Science | 9 |
| 10 | Packaging | 9 |
| 11 | The loop | 9 |

Fixed while building, before the render (stills, a 1 s sweep and the safe-area mask): the raised arm's length; his face
cut by the left edge in the push-ins; the hand over his face when he turned it; holes in the glass where fingers meet the
palm (opposite path windings); the glass reading as a dark glove; a white bloom over the strap; the brain hiding its
levers; the lab's hand small and under the captions; the ranking and the camera frame crossing into the buttons' column;
the DEAD LAST stamp only repeating the caption (now an X-eyed ring finger and a tombstone); the old TV camera out of
frame; a sparkle at half its position; the helping arm across his mouth; a theremin that masked six words; tails ringing
into "under" and "In"; the bwomp silenced by its own music cut; the gag levels (now −17.3 … −21.5 dB against −16.2).

**Rebuild check:** `src/build.sh` from the cached takes made the shipped MP4: timeline.json and mix.wav byte-identical to the
round-1 build, the MP4 the same size (26,587,801 bytes) and length (31.43 s), qa.py 18/18 again.

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The cinematic lighting runs on the graphics
chip through Chrome's WebGL2; without one the render falls back to the classic look and says so (`look: ...`). The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`); this Short uses none.
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set. `src/cover.sh` renders the cover.
